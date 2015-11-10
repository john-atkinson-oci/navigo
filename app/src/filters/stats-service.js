/*global angular, $ */

angular.module('voyager.filters').
    factory('statsService', function (config, $http, configService, translateService, $q, solrGrunt, sugar) {
        'use strict';
        var _stats= {};
        var _statsFields = {};

        function _getStatsParams() {
            var configFilters = configService.getFilters(), facetParams = '';
            $.each(configFilters, function (index, filter) {
                if(filter.style === 'STATS') {
                    facetParams += '&stats.field=' + filter.field;
                }
            });
            return facetParams;
        }

        function _hasStatsParam() {
            var configFilters = configService.getFilters();
            var hasStats = false;
            $.each(configFilters, function (index, filter) {
                if(filter.style === 'STATS') {
                    hasStats = true;
                    return false;
                }
            });
            return hasStats;
        }

        // TODO remove this?
        ///* jshint ignore:start */
        //function _getAllStatsQuery() {
        //    var queryString = config.root + 'solr/v0/select?rows=0&block=false&stats=true' + _getStatsParams();
        //    if(angular.isDefined(configService.getConfigId())) {
        //        queryString += '&voyager.config.id=' + configService.getConfigId();
        //    }
        //    queryString += '&wt=json&json.wrf=JSON_CALLBACK';
        //    return queryString;
        //}
        ///* jshint ignore:end */

        function _getQueryString(params, filterParams, bboxParams) {
            var solrParams = solrGrunt.getSolrParams(params);
            delete solrParams.fq; //filter service will apply filter params below
            solrParams.q = solrGrunt.getInput(solrParams.q); //default to all if no input filter
            var queryString = config.root + 'solr/v0/select?rows=0&stats=true' + _getStatsParams();
            queryString += '&' + sugar.toQueryString(solrParams);
            queryString += filterParams;
            queryString += bboxParams;
            if(angular.isDefined(configService.getConfigId())) {
                queryString += '&voyager.config.id=' + configService.getConfigId();
            }
            queryString += '&wt=json&json.wrf=JSON_CALLBACK';
            return queryString;
        }

        function _setStats(params, filterParams, bboxParams) {
            var deferred = $q.defer();
            if (_hasStatsParam()) {
                $http.jsonp(_getQueryString(params, filterParams, bboxParams)).success(function (data) {
                    _stats = data.stats.stats_fields; // jshint ignore:line
                    deferred.resolve(_stats);
                });
            } else {
                deferred.resolve(null);
            }
            return deferred.promise;
        }

        function _parseInt(val) {
            var ret = 0;
            if (angular.isDefined(val)) {
                ret = parseInt(val);
            }
            return ret;
        }
        //public methods - client interface
        return {

            // TODO - what was this for
            //fetchStats: function() {
            //    return _setStats();
            //},

            updateStats: function(params, filterParams, bboxParams, filters) {
                _setStats(params, filterParams, bboxParams).then(function(stats) {
                    if (stats !== null) {
                        $.each(filters, function(index, filter) {
                            if (filter.style === 'STATS') {
                                $.each(filter.values, function(i, facet) {  //TODO if style is stats there is only 1 facet, looping is overkill
                                    facet.stddev = _parseInt(stats[filter.field].stddev);
                                    facet.sum = _parseInt(stats[filter.field].sum);
                                    facet.mean = _parseInt(stats[filter.field].mean);
                                });
                            }
                        });
                    }
                });
            },

            setStatsFields: function(statsFields) {
                _statsFields = statsFields;
            }

            // TODO - what was this for
            //getStats: function(filter) {
            //    return _stats[filter];
            //},

            // TODO - why isn't this referenced - range service is - test this scenario
            //decorateSelected: function(selectedFilter, filterKeyValue) {
            //    var range = filterKeyValue.value.replace('TO',',');
            //    selectedFilter.name = filterKeyValue.name;
            //    selectedFilter.model = JSON.parse(range);
            //    selectedFilter.humanized = translateService.getFieldName(filterKeyValue.name) + ': ' + filterKeyValue.value;
            //}
        };

    });
