'use strict';
angular.module('voyager.map').
    factory('wmsLayerQuery', function (config, $http) {

        function _getQueryString(id) {
            return config.root + 'solr/v0/select?links.to=' + id + ':_root&fl=wms_layer_name&wt=json&json.wrf=JSON_CALLBACK';
        }

        return {
            execute: function (id) {
                return $http.jsonp(_getQueryString(id)).then(function (data) {
                    return _.pluck(data.data.response.docs,'wms_layer_name');
                }, function(error) {
                    //@TODO: handle error
                    console.log(error);
                    return error;
                });
            }
        };

    });