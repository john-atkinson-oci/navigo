/*global angular */

angular.module('voyager.search').
	factory('exportService', function ($http, config, sugar, filterService, configService, solrGrunt) {

		'use strict';

		var selectPath = 'solr/v0/select';
		var _defaultSortField = angular.isDefined(config.defaultSort)? config.defaultSort : 'score';
		var _sortField = 'score';
		var _searchParams;
		var _sortDirection;

		function _setParams(params) {
			if(angular.isUndefined(_sortField)) {
				_sortField = _defaultSortField;
			}
			if(angular.isDefined(params.sort)) {
				if(params.sort.indexOf(' ') !== -1) {
					var sortInfo = params.sort.split(' ');
					_sortField = sortInfo[0];
					_sortDirection = sortInfo[1];
				} else {
					_sortField = params.sort;
				}
			}
			if(angular.isDefined(params.sortdir)) {
				_sortDirection = params.sortdir;
			}
			_searchParams = solrGrunt.getSolrParams(params);
		}

		function buildQueryForCSV(solrParams, itemsPerPage, sortDirection, sortField) {
			delete solrParams.fq; //filter service will apply filter params below
			//solrParams.q = getInput(solrParams.q); //default to all if no input filter  //TODO do we need to convert empty to *:* seems to work without it
			var queryString = config.root + selectPath;
			queryString += '?' + sugar.toQueryString(solrParams);

			queryString += '&start=0';
			queryString += '&fl=id';

			//prevent adding extra comma when table field name is empty
			if (configService.getTableFieldNames().length) {
				queryString += ',' + configService.getTableFieldNames().join(',');
			}

			queryString += '&rows=' + itemsPerPage;
			queryString += '&extent.bbox=true&block=false';
			queryString += filterService.getFilterParams();
			queryString += filterService.getBoundsParams();
			if(angular.isDefined(configService.getConfigId()) && angular.isUndefined(solrParams['voyager.config.id'])) {
				queryString += '&voyager.config.id=' + configService.getConfigId();
			}
			if (angular.isDefined(sortField)) {
				if(angular.isUndefined(sortDirection)) {
					sortDirection = angular.isDefined(config.defaultSortDirection)? config.defaultSortDirection : 'desc';
				}
				queryString += '&sort=' + sortField + ' ' + sortDirection;
			}
			queryString += '&rand=' + Math.random(); // avoid browser caching?
			queryString += '&wt=csv';
			return queryString;
		}

		return {

			getCSV: function (params, rowCount) {
				_setParams(params);

				var service = buildQueryForCSV(_searchParams, rowCount, _sortDirection, _sortField);
				return $http.get(service).then(function(response) {
					return response;
				}, function(exception){
					return exception;
				});
			}
		};

	});