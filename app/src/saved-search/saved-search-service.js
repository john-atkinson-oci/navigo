/*global angular, $, querystring, config */

angular.module('voyager.search').
    factory('savedSearchService', function (sugar, $http, configService, $q, authService, $modal, recentSearchService, $location, filterService, $analytics, converter) {
        'use strict';

        var observers = [];

        function _applyBbox(solrParams, voyagerParams) {
            if(_.isArray(solrParams.fq)) {
                var index = sugar.getIndex(solrParams.fq, 'bbox');
                solrParams.fq.splice(index, 1);  //remove bbox param from fq and add as explicit bbox param?
            } else {
                delete solrParams.fq;  //remove bbox param
            }
            solrParams.place = voyagerParams.bbox;
            solrParams['place.op'] = (voyagerParams['bbox.mode'] === 'WITHIN') ? 'within':'intersects';
        }

        function _getView(voyagerParams) {
            var view = {'type':'card'};
            if(angular.isDefined(voyagerParams.view)) {
                voyagerParams.view = voyagerParams.view.toLowerCase();
                if(voyagerParams.view === 'table' || voyagerParams.view === 'map') {
                    view.type = voyagerParams.view;
                }
            }
            return view;
        }

        function _decode(params) {
            $.each(params, function(index, param) {
                if( typeof param === 'string' ) {
                    params[index] = decodeURIComponent(param);
                } else {  //array
                    $.each(param, function(index, value) {
                        param[index] = decodeURIComponent(value);
                    });
                }
            });
        }

        function _doSave(request) {

            if(configService.hasChanges()) {
                var deferred = $q.defer();
                sugar.postJson(configService.getUpdatedSettings(), 'display', 'config').then(function(response) {
                    request.config = response.data.id;
                    /* jshint ignore:start */
                    request.query += '/disp=' + request.config;
                    request.path = request.query;
                    sugar.postJson(request, 'display', 'ssearch').then(function(savedResponse) {
                        deferred.resolve();
                    }, function(error) {
                        deferred.reject(error);
                    });
                    /* jshint ignore:end */
                }, function(error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            } else {
                request.query += '/disp=' + request.config;
                request.path = request.query;
                return sugar.postJson(request, 'display', 'ssearch');
            }
        }

        function _getQueryString() {
            var rows = 150;  //TODO set to what we really want
            var queryString = config.root + 'solr/ssearch/select?';
            queryString += 'rows=' + rows + '&rand=' + Math.random();
            queryString += '&wt=json&json.wrf=JSON_CALLBACK';
            return queryString;
        }

        function _execute() {
            return $http.jsonp(_getQueryString()).then(function (data) {
                return data.data.response.docs;
            }, function(error) {
                //@TODO: handle error
                console.log(error);
                return error;
            });
        }

        //public methods - client interface
        return {
            getSavedSearches: function() {
                return _execute();
            },

            getParams: function(saved) {
                var solrParams = querystring.parse(sugar.trim(saved.query,'&'));
                _decode(solrParams);  //workaround - seems the params get encoded twice

                var voyagerParams;

                //@TODO: need to change in the back end to use path instead query
                if (saved.path === undefined) {
                    voyagerParams = querystring.parse(sugar.trim(saved.query.replace(/\//g,'&'),'&'));
                } else {
                    voyagerParams = querystring.parse(sugar.trim(saved.path.replace(/\//g,'&'),'&'));
                }

                if (angular.isDefined(voyagerParams.catalog) && angular.isUndefined(solrParams.shards)) {
                    // TODO why is shards missing on a federated saved search?
                    solrParams.shards = _.isArray(voyagerParams.catalog) ? voyagerParams.catalog.join(',') : voyagerParams.catalog;
                }

                if(angular.isDefined(voyagerParams.bbox)) {
                    _applyBbox(solrParams, voyagerParams);
                }

                if(angular.isDefined(voyagerParams.disp)) {
                    solrParams.disp = voyagerParams.disp;
                }

                var view = _getView(voyagerParams);
                solrParams.view = view.type;
                if (angular.isDefined(solrParams.sort)) {
                    var sort = solrParams.sort.split(' ');
                    solrParams.sort = sort[0].replace('_sort','');  //TODO workaround, bug with saved search?
                    solrParams.sortdir = sort[1];
                } else {
                    solrParams.sortdir = 'desc';
                }
                return solrParams;
            },

            addObserver: function (obs) {
                var index = _.findIndex(observers, obs);
                if (index === -1) {
                    observers.push(obs);
                }
            },
            removeObserver: function (observer) {
                observers = _.without(observers, observer);
            },
            saveSearch: function(savedSearch, params) {
                savedSearch.config = configService.getConfigId();
                savedSearch.query = converter.toClassicParams(params);
                return _doSave(savedSearch);
            },

            deleteSearch: function(id){
                return $http.delete(config.root + 'api/rest/display/ssearch/' + id).then(function(){
                            observers.forEach(function (entry) {
                                entry(id);
                            });
                        });
            },

            showSaveSearchDialog: function (item) {
                var modalInstance = $modal.open({
                    templateUrl: 'src/saved-search/save-search-dialog.html',
                    size: 'md',
                    controller: 'SaveSearchDialog',
                    resolve: {
                        searchItem: function() {
                            return item;
                        }
                    }
                });

                modalInstance.result.then(function () {

                }, function () {
                    //$log.info('Modal dismissed at: ' + new Date());
                });
            },

            showSearchModal: function(tab) {
                var modalInstance = $modal.open({
                        templateUrl: 'src/saved-search/saved-search-modal.html',
                        size:'lg',
                        controller: 'SavedSearchModalCtrl',
                        resolve: {
                            tab: function() {
                                return tab;
                            }
                        }
                    });

                modalInstance.result.then(function () {

                }, function () {
                    //$log.info('Modal dismissed at: ' + new Date());
                });
            },
            applySavedSearch: function(saved, $scope) {
                var solrParams = this.getParams(saved);
                //solrParams.id = saved.id;  TODO why are we setting this?

                $scope.$emit('clearSearchEvent');

                $location.path('search').search(solrParams);
                filterService.applyFromUrl($location.search()).then(function() {
                    $scope.$emit('filterEvent', {});
                });

                $analytics.eventTrack('saved-search', {
                    category: 'run'
                });
                //$scope.$emit('searchEvent');  //TODO remove - filterEvent will fire a search
                this.addToRecent(saved);
            },
            addToRecent: function(searchItem) {
                var item = {};
                item.id = searchItem.id;
                item.title = searchItem.title;
                item.query = this.getParams(searchItem);
                item.query = sugar.toQueryStringEncoded(item.query);
                item.saved = true;
                recentSearchService.addItem(item);
            },
            order: function(id, beforeId, afterId) {
                var data = '';
                if(beforeId !== null) {
                    data += 'before=' + beforeId;
                }
                if(data !== '') {
                    data += '&';
                }

                if(afterId !== null) {
                    data += 'after=' + afterId;
                }
                return sugar.postForm('api/rest/display/ssearch/' + id + '/order', data);
            }
        };
    });
