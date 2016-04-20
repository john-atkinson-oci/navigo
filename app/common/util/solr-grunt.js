/*global angular, $ */
angular.module('voyager.util').
    factory('solrGrunt', function () {
        'use strict';

        var _nonSolrParams = {'vw':true,'view':true,'pg':true,'bbox':true,'bboxt':true, 'filter': true};

        function _getSolrParams(params) {
            var solrParams = {};
            $.each(params,function(key, value) {
                if (angular.isUndefined(_nonSolrParams[key]) && value !== '') {
                    solrParams[key] = value;
                }
            });
            if (angular.isDefined(solrParams.sort)) {
                if (angular.isDefined(solrParams.sortdir)) {
                    solrParams.sort = solrParams.sort + ' ' + solrParams.sortdir;
                } else {
                    solrParams.sort = solrParams.sort + ' desc';
                }
            }
            delete solrParams.sortdir;
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
