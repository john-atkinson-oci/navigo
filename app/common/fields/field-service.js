/*global angular, $, QueryBuilder */

angular.module('voyager.fields').
    factory('fieldService', function ($http, config, $q) {
        'use strict';

        return {
            fetchFields: function () {
                return $http.jsonp(config.root + 'solr/fields/select?q=*:*&wt=json&rows=10000&json.wrf=JSON_CALLBACK').then(function(res) {
                    return res.data.response.docs;
                });
            }
        };

    });
