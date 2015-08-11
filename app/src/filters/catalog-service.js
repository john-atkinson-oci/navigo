'use strict';
angular.module('voyager.filters')
    .factory('catalogService', function (config, $http) {

        return {
            fetch: function() {
                return $http.get(config.root + 'api/rest/index/config/federation.json').then(function(res) {
                    return res.data.servers;
                });
            }
        };
    });