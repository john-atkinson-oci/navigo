/*global angular, $, QueryBuilder, _, config */

angular.module('voyager.common.featured').
    factory('featuredService', function ($http, $q) {
        'use strict';

        var _type = '&wt=json&json.wrf=JSON_CALLBACK';

        var _features = {};

        function _postForm(url, data) {
            var service = config.root + url;
            var headerConfig = {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}};
            return $http.post(service, data, headerConfig);
        }

        function _toFormParam(key, value) {
            var param = '&' + key + '=';
            if (_.isArray(value)) {
                param += value.join('&' + key + '=');
            } else {
                param += value;
            }
            return param;
        }

        function _buildRequest(id) {
            var service = config.root + 'solr/v0/select?fq=id:' + id + '&fl=tag_flags';
            return service + _type + '&rand=' + Math.random(); // avoid browser caching?;
        }

        return {

            save: function (id, field, value, mode) {
                var url = 'api/rest/tag/record/' + id;
                var data = 'field=' + field + _toFormParam('value', value);
                if(angular.isDefined(mode)) {
                    data += '&mode=' + mode;
                }
                return _postForm(url,data);
            },

            fetch: function(id) {
                return $http.jsonp(_buildRequest(id)).then(function(data) {
                    return data.data.response.docs[0];
                });
            },

            fetchFeatures: function() {
                var service = config.root + 'api/rest/display/extensions/config';
                return $http.get(service).then(function(res) {
                    _features = _.indexBy(res.data.featureContentGroupList,'id');
                    return _features;
                });
            },

            getFeature: function(id) {
                return _features[id];
            },

            getFeatures: function() {
                return _features;
            }

        };

    });
