/*global angular, $, QueryBuilder */

angular.module('fileBrowser').
    factory('fileBrowserService', function ($http, config) {
        'use strict';

        return {

            browse: function (uri) {
                return $http.get(config.root + 'api/rest/system/browse.json?uri=' + uri);
            }

        };

    });