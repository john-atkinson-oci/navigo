/*global angular */

angular.module('voyager.component')
	.directive('vsSelectedFilter', function($timeout, $window) {
		'use strict';

		return {
			restrict: 'A',
			link: function(scope, element, attr) {

				var windowEl = angular.element($window);
				var windowWidth = windowEl.width();
				var windowHeight = windowEl.height();
				// var resultsTable;

				var _adjustSelectedFilterContainer = function() {
					$timeout(function() {
						var searchResultMapContainer = angular.element('#searchResultMapContainer');
						var selectedFilterEl = angular.element('#selectedFilters');
						var selectedFilterContainer = selectedFilterEl.find('.overtop');
						var filterContainerHeight = 0;
						var listWrapEl = selectedFilterEl.next('.list_wrap');

						if (scope.filters.length) {
							filterContainerHeight = selectedFilterEl.find('.overtop').outerHeight();
							selectedFilterContainer.css('width', (selectedFilterEl.parent().outerWidth()) + 'px');
						}

						listWrapEl.css({'padding-top': filterContainerHeight + 'px'});

						if (attr.view === 'table') {
							searchResultMapContainer.css('top', (118 + filterContainerHeight) + 'px');
							// resultsTable = angular.element('#resultsTable');
							// var offset = listWrapEl.offset().top - 20;
							// resultsTable.stickyTableHeaders('destroy');
							// resultsTable.stickyTableHeaders({fixedOffset: offset});
						} else {
							selectedFilterEl.next('.list_wrap').css({'margin-top' : 0});
							searchResultMapContainer.css({'top': '', 'height': '100%', 'visibility': 'visible'});
						}
					}, 100);
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

					windowEl.on('resize', function(){
						if (windowWidth !== windowEl.width() || windowHeight !== windowEl.height()) {
							windowWidth = windowEl.width();
							windowHeight = windowEl.height();
							_adjustSelectedFilterContainer();
						}
					});

					scope.$on('destroy', function(){
						windowEl.unbind('resize', _adjustSelectedFilterContainer);
						// resultsTable.stickyTableHeaders('destroy');
					});

				});


			} //link
		};
	});

