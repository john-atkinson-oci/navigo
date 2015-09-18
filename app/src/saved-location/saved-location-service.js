/*global angular, $, querystring, config */

angular.module('voyager.search').
    factory('savedLocationService', function (sugar, $http, configService, $q, authService, $modal, $location, $analytics) {
        'use strict';

        var observers = [];

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

        function _doPost(request, action) {
            return $http({
                method: 'POST',
                url: config.root + 'api/rest/display/' + action + '.json',
                data: request,
                headers: {'Content-Type': 'application/json'}
            });
        }

        function _doSave(request) {

            if(configService.hasChanges()) {
                var deferred = $q.defer();
                _doPost(configService.getUpdatedSettings(), 'config').then(function(response) {
                    request.config = response.data.id;
                    /* jshint ignore:start */
                    request.query += '/disp=' + request.config;
                    request.path = request.query;
                    _doPost(request, 'slocation').then(function(savedResponse) {
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
                return _doPost(request, 'slocation');
            }
        }

        function _convert(params, from, to) {
            var converted = '';
            if(angular.isDefined(params[from])) {
                var pArr = sugar.toArray(params[from]), f, filter, filterValue;
                $.each(pArr, function(index, value) {
                    if (value.indexOf(':') !== -1) {
                        f = value.split(':');
                        filter = f[0];
                        filterValue = f[1];
                        if(f.length > 2) {
                            f.splice(0,1);
                            filterValue = f.join(':');
                        }
                        filterValue = filterValue.replace(/\\/g, ''); //remove escape characters
                        //TODO encoding twice so classic ui works - seems like classic ui needs to be fixed?
                        converted += '/' + to + '.' + filter + '=' + encodeURIComponent(encodeURIComponent(filterValue));
                    } else {
                        if(to === 'bbox.mode') {
                            if (value === 'w') {
                                value = 'WITHIN';
                            } else {
                                value = 'INTERSECTS';
                            }
                        }
                        converted += '/' + to + '=' + value;
                    }
                });
            }
            return converted;
        }

        function _toVoyagerParams(params) {
            var voyagerParams = '';
            voyagerParams += _convert(params, 'q', 'q');
            voyagerParams += _convert(params, 'fq', 'f');

            voyagerParams += _convert(params, 'place', 'place');
            voyagerParams += _convert(params, 'place.op', 'place.op');

            voyagerParams += _convert(params, 'voyager.list', 'voyager.list');
            if(params.view === 'table') {
                voyagerParams += '/view=TABLE';
            }
            if(angular.isDefined(params.sort)) {
                voyagerParams += '/sort=' + params.sort;
            }
            if(angular.isDefined(params.sortdir) && params.sortdir === 'desc') {
                voyagerParams += '/sort.reverse=true';
            }

            return voyagerParams;
        }

        function _getQueryString() {
            var rows = 150;  //TODO set to what we really want
            var queryString = config.root + 'solr/slocation/select?';
            queryString += 'rows=' + rows + '&rand=' + Math.random();
            queryString += '&wt=json&json.wrf=JSON_CALLBACK';
            return queryString;
        }

        function _execute(url) {
            return $http.jsonp(url).then(function (data) {
                return data.data.response.docs;
            }, function(error) {
                //@TODO: handle error
                console.log(error);
                return error;
            });
        }

        function _postForm(url, data) {
            var service = config.root + url;
            var headerConfig = {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}};
            return $http.post(service, data, headerConfig);
        }

        function _getSearchResult(term) {
            var rows = 150;
            var queryString = config.root + 'solr/slocation/select?';
            queryString += 'fq=name:' + term;
            queryString += '&fl=name';
            queryString += '&rows=' + rows + '&rand=' + Math.random();
            queryString += '&wt=json&json.wrf=JSON_CALLBACK';
            return queryString;
        }

        //public methods - client interface
        return {
            getSavedLocations: function() {
                return _execute(_getQueryString());
            },

            searchByTerm: function(term) {
                return _execute(_getSearchResult(term));
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
                var exists = false;
                observers.forEach(function (entry) {
                    if (entry === obs) {
                        exists = true;
                    }
                });
                if (!exists) {
                    observers.push(obs);
                }
            },

            saveLocation: function(SavedLocation, params) {
                SavedLocation.config = configService.getConfigId();
                SavedLocation.value = _toVoyagerParams(params);
                return _doSave(SavedLocation);
            },

            applySavedLocation: function(saved, $scope) {
                var solrParams = this.getParams(saved);
                //solrParams.id = saved.id;  TODO why are we setting this?

                $scope.$emit('clearSearchEvent');

                $location.path('search').search(solrParams);
                // filterService.applyFromUrl($location.search()).then(function() {
                //     $scope.$emit('addBboxEvent', {});  //updates map with bbox from url
                //     $scope.$emit('filterEvent', {});
                // });

                $analytics.eventTrack('saved-search', {
                    category: 'run'
                });

            },

            deleteLocation: function(id){
                return $http.delete(config.root + 'api/rest/display/slocation/' + id).then(function(){
                            observers.forEach(function (entry) {
                                entry(id);
                            });
                        });
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
                return _postForm('api/rest/display/slocation/' + id + '/order', data);
            }

        };
    });
