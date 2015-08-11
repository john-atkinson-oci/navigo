'use strict';

angular.module('voyager.home')
    .service('collectionsQuery', function(config, $http) {

        function _getQueryString() {
            var rows = 6;
            var label = config.homepage.sidebarLinksLabel;
            var queryString = config.root + 'solr/ssearch/select?fq=labels:' + label + '&fl=id,title,query,count:[count]';
            queryString += '&rows=' + rows + '&rand=' + Math.random();
            queryString += '&wt=json&json.wrf=JSON_CALLBACK';
            return queryString;
        }

        function _execute() {
            return $http.jsonp(_getQueryString()).then(function (data) {
                return data.data.response.docs;
            }, function(error) {
                return error;
            });
        }

        return {
            execute: function() {
                return _execute();
            }
        };

    });

