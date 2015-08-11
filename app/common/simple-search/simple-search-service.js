/*global angular, $, QueryBuilder */

angular.module('simpleSearch').
    factory('simpleSearch', function ($http, config, $q, facetService, translateService) {
        'use strict';

        function _bytesToSize(bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes === 0) {
                return '0 Bytes';
            }
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        }

        function _decorate(docs) {
            angular.forEach(docs, function (doc, index) {
                if(doc.bytes) {
                    doc.size = _bytesToSize(doc.bytes);
                }
            });
            return docs;
        }

        var getInput = function (query) {
            var input = '*:*';
            if (query) {
                input = query;
            }
            return input;
        };

        function _getParams(input, query, page) {
            query.q = getInput(input);
            query.rows = 100;
            query.start = (page - 1) * 100;
            query.wt = 'json';
            query['json.wrf'] = 'JSON_CALLBACK';
            query.block = false;
            if(query.fl) {
                query.fl += ',name';
            }
            return query;
        }

        function _search(input, query, page, records) {
            var params = _getParams(input, query, page);

            // testing
            //params.facet = true;
            //params['facet.field'] = ['format','format_type'];

            if (params.facet === true) {  //set defaults
                if(angular.isUndefined(params.facet.limit)) {
                    params['facet.limit'] = 11;
                }
                if(angular.isUndefined(params.facet.mincount)) {
                    params['facet.mincount'] = 1;
                }
            }
            return $http.jsonp(config.root + 'solr/v0/select',{params:params}).then(function(res) {
                var docs = res.data.response.docs;
                if (docs.length > 0 && page > 1) {
                    docs = _decorate(docs);
                    $.merge(records, docs);
                } else if (page === 1) {
                    docs = _decorate(docs);
                    records.splice(0,records.length);
                    $.merge(records, docs);
                }
                if (res.data.facet_counts && res.data.facet_counts.facet_fields) {
                    var facetFilters = facetService.buildAllFacets(res.data.facet_counts.facet_fields);
                    var facetFields = [];
                    _.each(facetFilters, function(facets, name) {
                        facetFields.push({filter:name, display:translateService.getFieldName(name), facets:facets});
                    });
                    res.data.facetFields = facetFields;
                }
                return res.data;
            });
        }

        return {
            search: function(input, query, page, records) {
                if(angular.isUndefined(query)) {
                    query = {};
                }
                return _search(input, query, page, records);
            }
        };

    });
