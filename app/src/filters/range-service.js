/*global angular, $ */

angular.module('voyager.filters').
    factory('rangeService', function (config, $http, configService, translateService, $q) {
        'use strict';
        var _rangeLimits = {};
        var _statsFields = {};

        function _getRangeParams() {
            var configFilters = configService.getFilters(), facetParams = '';
            $.each(configFilters, function (index, filter) {
                if(filter.style === 'RANGE' || filter.style === 'STATS') {
                    facetParams += '&stats.field=' + filter.field;
                }
            });
            return facetParams;
        }

        function _hasRangeParam() {
            var configFilters = configService.getFilters();
            var hasRange = false;
            $.each(configFilters, function (index, filter) {
                if(filter.style === 'RANGE' || filter.style === 'STATS') {
                    hasRange = true;
                    return false;
                }
            });
            return hasRange;
        }

        function _getRangeLimitsQuery() {
            var queryString = config.root + 'solr/v0/select?rows=0&stats=true' + _getRangeParams();
            if(angular.isDefined(configService.getConfigId())) {
                queryString += '&voyager.config.id=' + configService.getConfigId();
            }
            queryString += '&wt=json&json.wrf=JSON_CALLBACK';
            return queryString;
        }

        function _setRangeLimits() {
            var deferred = $q.defer();
            if (_hasRangeParam()) {
                $http.jsonp(_getRangeLimitsQuery()).success(function (data) {
                    _rangeLimits = data.stats.stats_fields; // jshint ignore:line
                    deferred.resolve();
                });
            } else {
                deferred.resolve();
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
            fetchAllRangeLimits: function() {
                return _setRangeLimits();
            },

            setStatsFields: function(statsFields) {
                _statsFields = statsFields;
            },

            getRangeLimits: function(filter) {
                return _rangeLimits[filter];
            },

            buildRangeFilter: function(filter, selectedFilter) {
                var range = {min:_rangeLimits[filter.field].min,max:_rangeLimits[filter.field].max, style:filter.style, name:filter.field, filter:filter.field, display:filter.value};
                if (selectedFilter) {
                    range.model = selectedFilter.model;
                } else {
                    range.model = [range.min,range.max];
                }
                range.stddev = _parseInt(_rangeLimits[filter.field].stddev);
                range.sum = _parseInt(_rangeLimits[filter.field].sum);
                range.mean = _parseInt(_rangeLimits[filter.field].mean);
                //range.humanized = filter.value + ': [' + range.min + ' TO ' + range.max + ']';
                return range;
            },

            buildCalendarFilter: function(filter, selectedFilter) {
                var calendar = {style:filter.style, name:filter.field, filter:filter.field, display:filter.value, stype: filter.stype, multivalued: filter.multivalued};
                if (selectedFilter) {
                    calendar.model = decodeURIComponent(selectedFilter.name).replace(/[\[\]]/g,'').split(' TO ');
                } else {
                    calendar.model = [];
                }
                return calendar;
            },

            decorateSelected: function(selectedFilter, filterKeyValue) {
                var range = filterKeyValue.value.replace('TO',',');
                selectedFilter.name = filterKeyValue.name;
                selectedFilter.model = JSON.parse(range);
                selectedFilter.humanized = translateService.getFieldName(filterKeyValue.name) + ': ' + filterKeyValue.value;
            }
        };

    });
