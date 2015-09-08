/*global angular */

angular.module('voyager.component')
	.directive('vsSelectedFilter', function($timeout, $window) {
		'use strict';

		return {
			restrict: 'A',
			link: function(scope, element, attr) {

				var _adjustSelectedFilterContainer = function() {
					$timeout(function() {
						var searchResultMapContainer = angular.element('#searchResultMapContainer');
						var selectedFilterEl = angular.element('#selectedFilters');
						var selectedFilterContainer = selectedFilterEl.find('.overtop');
						var filterContainerHeight = 0;

						if (scope.filters.length) {
							filterContainerHeight = selectedFilterEl.find('.overtop').outerHeight();
							selectedFilterContainer.css('width', (selectedFilterEl.parent().outerWidth()) + 'px');
						}

						selectedFilterEl.next('.list_wrap').css({'padding-top': filterContainerHeight + 'px'});

						if (attr.view === 'table') {
							searchResultMapContainer.css('top', (118 + filterContainerHeight) + 'px');
						} else {
							selectedFilterEl.next('.list_wrap').css({'margin-top' : 0});
							searchResultMapContainer.css({'top': '', 'height': '100%', 'visibility': 'visible'});
						}
					}, 200);
				};

				element.ready(function(){
					scope.$watch('filters', function(){
						_adjustSelectedFilterContainer();
					});

					scope.$watch('$parent.filterVisible', function(){
						_adjustSelectedFilterContainer();
					});

					scope.$watch('$parent.view', function(){
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

