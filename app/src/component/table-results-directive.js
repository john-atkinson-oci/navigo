/*global angular */

angular.module('voyager.component')
	.directive('vsTableResults', function($window, $document) {
		'use strict';

		function _animate(el, animateParams, callback) {
			el.stop().css('visibility', 'visible').animate(animateParams, 250, 'linear', function(){
				if (callback) {
					callback();
				}
			});
		}

		function _minHeight(availableHeight) {
			if (availableHeight < 250) {
				availableHeight = 250;
			}

			return availableHeight;
		}

		return {
			restrict: 'A',
			link: function(scope, element, attr) {

				var windowEl = angular.element($window);
				var windowWidth = windowEl.width();
				var windowHeight = windowEl.height();
				var searchContainerEl = angular.element('#searchResultMapContainer');
				var listWrapEl = angular.element('.list_wrap');

				$document.ready(function(){
					_resizeContent();
				});

				function _resizeContent() {
					var windowHeight = windowEl.outerHeight();
					var mapTopPosition = angular.element('.search-map').offset().top;
					var availableHeight = windowHeight - mapTopPosition;

					if (attr.size === 'small') {
						availableHeight -= 600;
						availableHeight = _minHeight(availableHeight);
						_animate(searchContainerEl, {height: availableHeight});
					}
					else if (attr.size === 'no') {
						availableHeight = 0;
						_animate(searchContainerEl, 0, function(){
							searchContainerEl.css('visibility', 'hidden');
						});
					} else {
						availableHeight -= 280;
						availableHeight = _minHeight(availableHeight);
						_animate(searchContainerEl, {height: availableHeight});
					}

					_animate(listWrapEl, {marginTop: availableHeight});
				}

				// make sure that window height and window width actually change
				windowEl.on('resize', function() {
					if (windowWidth !== windowEl.width() || windowHeight !== windowEl.height()) {
						windowWidth = windowEl.width();
						windowHeight = windowEl.height();
						_resizeContent();
					}
				});

				scope.$on('destroy', function(){
					windowEl.unbind('resize', _resizeContent);
				});

				scope.$watch('tableViewMapSize', function(){
					_resizeContent();
				});

			} //link
		};
	});

