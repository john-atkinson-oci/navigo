/*global angular */

angular.module('voyager.component')
	.directive('vsSearchToolToggle', function() {
		'use strict';
		return {
			restrict: 'A',
			link: function(scope, element, attr) {

				var _update = true;

				scope.$watch(attr.ngModel, function() {
					if (_update) {
						scope.$emit('searchDrawingTypeChanged', scope.selectedDrawingType);
					} else {
						_update = true;
					}
				});

				scope.$on('updateSearchDrawingType', function(event, args){
					_update = false;
					scope.selectedDrawingType = args;
				});

			} //link
		};
	});

