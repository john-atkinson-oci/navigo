/*global angular */

angular.module('voyager.component')
	.directive('vsDetailScroll', function($window, $document, $timeout) {
		'use strict';

		return {
			restrict: 'A',
			link: function(scope, element) {

				var windowEl;
				var detailTopStickyContent;
				var detailTopStickyContentHeight;
				var detailTabContentNav;
				var detailTabContentNavTipPoint;
				var detailTabContentNavHeight;
				var detailSecondaryColumn;
				var detailSecondaryColumnHeight;
				var itemDetailEl;
				var tipped = false;

				scope.initialize = function() {
					element.ready(function(){
						$timeout(function() {
							detailTopStickyContent = angular.element('#detailTopStickyContent');
							detailTabContentNav = angular.element('#detailTabContentNav');
							detailSecondaryColumn = angular.element('#detailSecondaryColumn');
							detailTabContentNavHeight = detailTabContentNav.outerHeight();
							itemDetailEl = angular.element('#itemDetailContent');
							scope.setStickyContent();

							windowEl.on('scroll', _scroll);
							windowEl.on('resize', scope.resize);

							scope.$on('$destroy', function(){
								scope.destroy();
							});
						}, 250);
					});
				};

				windowEl = angular.element($window);
				scope.$watch('loading', function(){
					if (scope.loading === false) {
						scope.initialize();
					}
				});

				scope.resize = function() {
					$timeout.cancel(scope.resizeTimer);
					scope.resizeTimer = $timeout(function(){
						scope.setStickyContent();
					}, 100);
				};

				scope.destroy = function() {
					windowEl.unbind('scroll', _scroll);
					windowEl.unbind('resize', scope.resize);
				};

				function _scroll() {
					if (windowEl.width() <= 767) {
						return;
					}

					var scrollTop = $document.scrollTop();
					var windowHeight = windowEl.height();
					var mainContentHeight = itemDetailEl.outerHeight() + 80;

					if (mainContentHeight > windowHeight || detailSecondaryColumnHeight > windowHeight) {
						if (!tipped && scrollTop >= detailTabContentNavTipPoint) {
							tipped = true;
							_setContentNavStyle();
						}
						else if (tipped && scrollTop < detailTabContentNavTipPoint) {
							tipped = false;
							detailTabContentNav.removeClass('sticky').css('top', 0).next().css('padding-top', '0px');
						}
					}

					_setSecondaryContentStyle(scrollTop, mainContentHeight);
				}

				function _setSecondaryContentStyle(scrollTop, mainContentHeight) {

					var windowHeight = windowEl.height();

					if (detailSecondaryColumnHeight >= mainContentHeight || detailSecondaryColumnHeight < windowHeight) {
						// do nothing
						return;
					}

					if (scrollTop === 0) {
						detailSecondaryColumn.removeClass('sticky').css('margin-top', 0);
					} else if ((scrollTop + windowHeight) >= detailSecondaryColumnHeight) {
						detailSecondaryColumn.addClass('sticky').css('width', '365px').css('margin-top', -(detailSecondaryColumnHeight - windowHeight) + 'px');
					}
				}

				function _setContentNavStyle() {
					detailTabContentNav.addClass('sticky').css('top', (detailTopStickyContentHeight + detailTabContentNavHeight + 10) +'px');
					detailTabContentNav.next().css('padding-top', detailTabContentNavHeight  + 'px');
				}

				function _removeStyleForSmallScreen() {
					detailTabContentNav.css('top', 0).removeClass('sticky').next().css('margin-top', '10px');
					detailTopStickyContent.removeClass('sticky').next().css('margin-top', 0);
					detailSecondaryColumn.removeClass('sticky').css('margin-top', '0px');
				}

				scope.setStickyContent = function() {
					if (windowEl.width() <= 767) { // smaller screen, remove sticky class
						_removeStyleForSmallScreen();
					} else {
						detailTopStickyContent.removeClass('sticky').next().css('margin-top', 0);
						detailTabContentNav.removeClass('sticky');
						detailTopStickyContentHeight = detailTopStickyContent.outerHeight();
						detailTabContentNavTipPoint = detailTabContentNav.offset().top - detailTopStickyContentHeight - 100;

						var mainContentHeight = itemDetailEl.outerHeight();
						detailTopStickyContent.addClass('sticky').next().css('margin-top',  detailTopStickyContentHeight + 'px');
						detailSecondaryColumnHeight = detailSecondaryColumn.height() + 138;

						if (mainContentHeight > windowEl.height() && detailSecondaryColumnHeight < mainContentHeight && detailSecondaryColumnHeight < windowEl.height()) {
							detailSecondaryColumn.addClass('sticky').css({'margin-top': 0, 'width': '365px'});
						} else {
							detailSecondaryColumn.removeClass('sticky');
							_setSecondaryContentStyle($document.scrollTop(), mainContentHeight);
						}

						if (tipped) {
							_setContentNavStyle();
						}
					}
				};

			} //link
		};
	});

