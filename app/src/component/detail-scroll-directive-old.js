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
				var $banner;

				scope.initialize = function() {
					element.ready(function(){
						$timeout(function() {
							detailTopStickyContent = angular.element('#detailTopStickyContent');
							detailTabContentNav = angular.element('#detailTabContentNav');
							detailSecondaryColumn = angular.element('#detailSecondaryColumn');

							$banner = angular.element('#top-banner');
							if($banner.outerHeight() > 0) {
								$timeout(function() {
									var paddingTop = detailTopStickyContent.css('padding-top');
									paddingTop = parseInt(paddingTop.replace('px',''));
									detailTopStickyContent.css('padding-top', $banner.outerHeight() + paddingTop);
									detailSecondaryColumn.css('padding-top', $banner.outerHeight() + paddingTop);
									scope.resize();
								});
							}

							detailTabContentNavHeight = detailTabContentNav.outerHeight();
							itemDetailEl = angular.element('#itemDetailContent');

							scope.setStickyContent();

							windowEl.on('scroll', _scroll);
							windowEl.on('resize', scope.resize);

							scope.$on('$destroy', function(){
								scope.destroy();
							});
						}, 350);
					});
				};

				windowEl = angular.element($window);
				scope.$watch('loading', function(){
					if (scope.loading === false) {
						scope.initialize();
					}
				});

				scope.$watch('showTab', function(){
					if (angular.isDefined(scope.showTab)) {
						$document.scrollTop(detailTabContentNavTipPoint);
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
					var mainContentHeight = $document.outerHeight();

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
						if($banner.outerHeight() > 0) {
							detailSecondaryColumn.css('padding-top', 0);
						}
					} else if ((scrollTop + windowHeight) >= detailSecondaryColumnHeight) {
						var marginTop = -(detailSecondaryColumnHeight - windowHeight);
						// TODO - prevent image from scrolling under header (when recent search items show up under the map this happens)?
						//if($banner.outerHeight() > 0) {
						//	marginTop += $banner.outerHeight() * 2;
						//}
						detailSecondaryColumn.addClass('sticky').css('width', '365px').css('margin-top', marginTop + 'px');
					}
				}

				function _setContentNavStyle() {
					var top = detailTopStickyContentHeight + detailTabContentNavHeight + 10;
					if ($banner.outerHeight() > 0) {
						top += $banner.outerHeight();
					}
					detailTabContentNav.addClass('sticky').css('top', top +'px');
					detailTabContentNav.next().css('padding-top', detailTabContentNavHeight  + 'px');
				}

				function _removeStyleForSmallScreen() {
					detailTabContentNav.css('top', 0).removeClass('sticky').next().css('margin-top', '10px');
					detailTopStickyContent.removeClass('sticky').next().css('margin-top', 0);
					detailSecondaryColumn.removeClass('sticky').css('margin-top', '0px');
					if($banner.outerHeight() > 0) {
						detailSecondaryColumn.css('padding-top', '0px');
						detailTopStickyContent.css('padding-top', '0px');
					}
				}

				scope.setStickyContent = function() {
					if (windowEl.width() <= 767) { // smaller screen, remove sticky class
						_removeStyleForSmallScreen();
					} else {
						detailTopStickyContent.removeClass('sticky').next().css('margin-top', 0);
						detailTabContentNav.removeClass('sticky');
						detailTopStickyContentHeight = detailTopStickyContent.outerHeight();

						detailTabContentNavTipPoint = detailTabContentNav.offset().top - detailTopStickyContentHeight - 100;
						if ($banner.outerHeight() > 0) {
							detailTopStickyContentHeight -= $banner.outerHeight() * 2;
						}
						var mainContentHeight = itemDetailEl.outerHeight();
						detailTopStickyContent.addClass('sticky').next().css('margin-top',  detailTopStickyContentHeight + 'px');
						detailSecondaryColumnHeight = detailSecondaryColumn.height() + 138;

						if (detailSecondaryColumnHeight < windowEl.height()) {
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

