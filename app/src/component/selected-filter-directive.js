/*global angular */

angular.module('voyager.component')
	.directive('vsSelectedFilter', function($timeout, $window) {
		'use strict';
		return {
			restrict: 'A',
			link: function(scope, element) {

				var _adjustSelectedFilterContainer = function() {
					$timeout(function() {
						var selectedFilterEl = $('#selectedFilters');
						var selectedFilterContainer = selectedFilterEl.find('.overtop');
						var filterContainerHeight = 0;

						if (scope.filters.length) {
							filterContainerHeight = selectedFilterEl.find('.overtop').outerHeight();
							selectedFilterContainer.css('width', (selectedFilterEl.parent().outerWidth()) + 'px');
						}

						selectedFilterEl.next('.list_wrap').css('padding-top', filterContainerHeight + 'px');
					}, 10);
				};

				element.ready(function(){

					scope.$watch('filters', function(){
						_adjustSelectedFilterContainer();
					});

					scope.$watch('$parent.filterVisible', function(){
						_adjustSelectedFilterContainer();
					});
				});

				var windowEl = angular.element($window);
				windowEl.on('resize', _adjustSelectedFilterContainer);

				scope.$on('destroy', function(){
					windowEl.unbind('resize', _adjustSelectedFilterContainer);
				});

			} //link
		};
	});

