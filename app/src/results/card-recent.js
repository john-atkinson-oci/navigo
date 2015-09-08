/*global angular */
'use strict';
angular.module('voyager.results')
	.directive('vsCardRecent', function () {
		return {
			strict: 'A',
			templateUrl: 'src/results/card-recent.html'
		};
	});