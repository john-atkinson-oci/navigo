/*global angular, _ */
'use strict';
angular.module('voyager.search')
	.directive('vsExportResults', function(usSpinnerService, searchService, $location, exportService) {

	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'src/export-results/export-results.html',
		link: function(scope) {

			scope.error = false;

			scope.hasError = function () {
				return scope.error !== false;
			};

			// Check to see if user has entered a file name, if so, make API call.
			// Otherwise show error.
			scope.save = function () {
				if (!_.isEmpty(scope.CSVFileName)) {
					scope.error = false;
					usSpinnerService.spin('task-spinner');
					var _params = $location.search();
					delete _params.recent;
					scope.getCSVFile(_params, scope.totalItems);
				} else {
					scope.success = false;
					scope.error = 'Please enter a file name';
				}
			};

			// @function close modal
			scope.cancel = function () {
				scope.$dismiss();
			};

			// @function Append .csv extension if users didn't enter an extension
			scope.getFileName = function() {
				var fileNameParts = scope.CSVFileName.split('.');
				var fileExt = '';

				if (fileNameParts.pop().toLowerCase() !== 'csv') {
					fileExt = '.csv';
				}

				return scope.CSVFileName + fileExt;
			};

			// @function Create an anchor tag with file information as attribute
			// @returns object
			scope.createAnchorTag = function(data, filename) {
				var anchor = angular.element('<a/>');
				anchor.attr({
					href: 'data:attachment/csv;charset=utf-8,' + encodeURI(data),
					target: '_blank',
					download: filename
				});

				return anchor;
			};

			// @function Function to handle successful api call
			scope.successHandler = function(response, filename) {
				usSpinnerService.stop('task-spinner');

				if (response.status === 200 && angular.isUndefined(response.error)) {
					// if success, open the CSV file and download the file
					scope.success = true;
					var anchor = scope.createAnchorTag(response.data, filename)[0];

					if (typeof(anchor.click) === 'function') {
						anchor.click();
					}

					scope.cancel(); // close modal
				} else {
					scope.error = response.error || 'Please try again later';
				}
			};

			// @function Function to handle when api call fail
			scope.errorHandler = function(response) {
				usSpinnerService.stop('task-spinner');
				scope.error = response.error || 'Please try again later';
			};

			// @function Make API call to get content for CSV file
			scope.getCSVFile = function(params, rowCount) {
				exportService.getCSV(params, rowCount).then(function(response) {
					scope.successHandler(response, scope.getFileName());
				}, function(response){
					scope.errorHandler(response);
				});
			};
		}
	};
});
