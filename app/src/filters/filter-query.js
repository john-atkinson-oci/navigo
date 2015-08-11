angular.module('voyager.filters').
    factory('filterQuery', function (config, facetService, configService, sugar, $http) {
        'use strict';

        //use the configured display filters to define what filters to select in the query
        //TODO maybe use configService and/or filterStyle?
        var getFacetParams = function (field) {
            var facetParams = '';
            if (field && field !== 'shards') {
                var fieldConfig = _.find(config.settings.data.filters, function(filter) {return filter.field === field;});
                if(angular.isDefined(fieldConfig.minCount)) {
                    facetParams += '&f.' + fieldConfig.field + '.facet.mincount=' + fieldConfig.minCount;
                }
                if(fieldConfig.style === 'CHECK') {
                    facetParams += '&facet.field={!ex=' + field + '}' + field;
                } else {
                    facetParams += '&facet.field=' + field;
                }
                return facetParams;
            }
            var filters = config.settings.data.filters;

            $.each(filters, function (index, filter) {
                if(filter.field !== 'shards') {
                    if(filter.style === 'CHECK') {
                        facetParams += '&facet.field={!ex=' + filter.field + '}' + filter.field;
                    } else if(filter.style === 'STATS') {
                        //facetParams += '&stats.field=' + filter.field;  //stats is a separate call - see range-service.js
                        facetParams += '&facet.field=' + filter.field;
                        //stats = true;
                    } else {
                        facetParams += '&facet.field=' + filter.field;
                    }
                    if(angular.isDefined(filter.minCount)) {
                        facetParams += '&f.' + filter.field + '.facet.mincount=' + filter.minCount;
                    }
                }
            });
            return facetParams;
        };

        var getInput = function (query) {
            var input = '';
            if (angular.isDefined(query)) {
                input = query;
            }
            return input;
        };

        function _getQueryString(params, filters, bounds) {
            delete params.fq; //use filter params
            delete params.sort; //don't sort
            //params.q = getInput(params.q); //default to all if no input filter
            var queryString = config.root + 'solr/v0/select';
            queryString += '?' + sugar.toQueryString(params);
            var facetLimit = 11;
            queryString += '&rows=0';  //only return facets not results
            queryString += '&facet=true&facet.mincount=1&facet.limit=' + facetLimit + getFacetParams();
            queryString += filters;
            queryString += bounds;
            queryString += '&rand=' + Math.random(); // avoid browser caching?
            queryString += '&wt=json&json.wrf=JSON_CALLBACK';
            return queryString;
        }

        function checkFederations(res) {
            var shards = res.data['shards.info'], badShards = {};
            if (shards) {
                for (var shard in shards) {
                    if (!_.isEmpty(shards[shard].error)) {
                        badShards[shard] = shards[shard].shardAddress;
                    }
                }
            }
            return badShards;
        }

        return {

            execute: function (params, filters, bounds, selectedFilters) {
                var paramCopy = _.clone(params);  //params get modified, don't modify location directly
                return $http.jsonp(_getQueryString(paramCopy, filters, bounds)).then(function(res) {
                    var resultData = res.data.facet_counts.facet_fields;
                    var badShards = checkFederations(res);
                    var filterFacets = facetService.buildAllFacets(resultData, selectedFilters);
                    return {filters: filterFacets, badShards: badShards};
                });
            },

            buildAllFacets: function(params, field) {
                delete params.fq; //filter service will apply filter params below
                delete params.sort; //don't sort
                params.q = getInput(params.q); //default to all if no input filter
                var queryString = config.root + 'solr/v0/select', facetLimit = -1, rows = 0;
                queryString += '?' + sugar.toQueryString(params);
                queryString += '&rows=' + rows;
                queryString += '&facet=true&facet.mincount=1&facet.limit=' + facetLimit + getFacetParams(field);
                var fieldConfig = _.find(config.settings.data.filters, function(filter) {return filter.field === field;});
                if(field !== 'shards') {
                    if(fieldConfig.style === 'CHECK') {
                        queryString += '&facet.field={!ex=' + field + '}' + field;
                    } else {
                        queryString += '&facet.field=' + field;
                    }
                }
//                queryString += filterService.getFilterParams();
//                queryString += filterService.getBoundsParams();
                queryString += '&rand=' + Math.random(); // avoid browser caching?
                queryString += '&wt=json&json.wrf=JSON_CALLBACK';
                return queryString;
            }
        };
    });
