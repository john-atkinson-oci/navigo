/*global angular, $ */
angular.module('voyager.util').
    factory('solrGrunt', function () {
        'use strict';

        var _nonSolrParams = {'vw':true,'view':true,'pg':true,'sortdir':true,'sort':true,'bbox':true,'bboxt':true};

        function _getSolrParams(params) {
            var solrParams = {};
            $.each(params,function(key, value) {
                if (angular.isUndefined(_nonSolrParams[key])) {
                    solrParams[key] = value;
                }
            });
            return solrParams;
        }

        return {

            getSolrParams: function (params) {
                return _getSolrParams(params);
            },

            getInput: function(value) {
                var input = '*:*';
                if (angular.isDefined(value)) {
                    input = value;
                }
                return input;
            }
        };

    });
