/*global angular, querystring, config */

angular.module('voyager.search').
    factory('savedLocationService', function (sugar, $http, configService, $q, authService, $modal, $location, $analytics, filterService, converter) {
        'use strict';

        var observers = [];

        function _doSave(request) {

            if(configService.hasChanges()) {
                var deferred = $q.defer();
                sugar.postJson(configService.getUpdatedSettings(), 'display', 'config').then(function(response) {
                    request.config = response.data.id;
                    /* jshint ignore:start */
                    request.query += '/disp=' + request.config;
                    request.path = request.query;
                    sugar.postJson(request, 'display', 'slocation').then(function(savedResponse) {
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
                return sugar.postJson(request, 'display', 'slocation');
            }
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
                if (data.data) {
                    return data.data.response.docs;
                }

                return [];
            }, function(error) {
                //@TODO: handle error
                console.log(error);
                return error;
            });
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
                return querystring.parse(sugar.trim(saved.value.replace(/\//g,'&'),'&'));
            },

            addObserver: function (obs) {
                var index = _.findIndex(observers, obs);
                if (index === -1) {
                    observers.push(obs);
                }
            },
            removeObserver: function (obs) {
                observers = _.without(observers, obs);
            },
            saveLocation: function(SavedLocation, params) {
                SavedLocation.config = configService.getConfigId();
                SavedLocation.value = converter.toClassicParams(params);
                return _doSave(SavedLocation);
            },

            applySavedLocation: function(saved, $scope) {
                var solrParams = this.getParams(saved);

                $scope.$emit('clearSearchEvent');

                $location.path('search').search(solrParams);

                filterService.applyFromUrl($location.search()).then(function() {
                    $scope.$emit('filterEvent', {});
                });

                //TODO - Cainkade/May this doesn't exist - commenting out for now
                //this.addToRecent(saved);
            },

            deleteLocation: function(id){
                return $http.delete(config.root + 'api/rest/display/slocation/' + id).then(function() {
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
                return sugar.postForm('api/rest/display/slocation/' + id + '/order', data);
            }

        };
    });
