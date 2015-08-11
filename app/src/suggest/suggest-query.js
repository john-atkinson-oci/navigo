'use strict';

angular.module('voyager.search').
    factory('suggestQuery', function ($http, config) {

        return {

            execute: function (name) {
                var query = config.root + 'solr/v0/select?place=' + name + '&place.suggest=true&block=false&rows=0&wt=json&json.wrf=JSON_CALLBACK&rand=' + Math.random();
                return $http.jsonp(query).then(function(res) {
                    return res.data.placefinder.results;
                });
            }
        };

    });
