'use strict';
angular.module('voyager.filters')
    .factory('catalogService', function (config, $http, $location, $q) {

        function _fetch() {
            return $http.get(config.root + 'api/rest/index/config/federation.json').then(function(res) {
                return res.data.servers;
            });
        }

        function _loadRemoteLocations() {
            if ($location.path() === '/search' && angular.isDefined($location.search().shards)) {
                // load remote location names
                return _fetch().then(function (catalogs) {
                    var catalogPromises = [];
                    _.each(catalogs, function (catalog) {
                        if(angular.isDefined(catalog.url)) {
                            var url = catalog.url + config.require.locations;
                            // don't use credentials/cookies on remote call
                            var catalogPromise = $http.get(url, {withCredentials: false}).then(function (response) {
                                _.extend(config.locations.data.VALUE.location, response.data.VALUE.location);
                            });
                            catalogPromises.push(catalogPromise);
                        }
                    });
                    return $q.all(catalogPromises).then(function(res) {
                        return res;
                    }, function(error) {
                        return error; // failure means the remote catalogs are offline, allow to continue, the search should show an error
                    });
                });
            } else {
                return $q.when({});  // don't need to load
            }
        }

        return {
            fetch: _fetch,
            loadRemoteLocations: _loadRemoteLocations
        };
    });