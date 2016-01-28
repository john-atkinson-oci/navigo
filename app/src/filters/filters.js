'use strict';
angular.module('voyager.filters')
	.directive('vsFilters', function($document, $window){
		return {
			restrict: 'A',
			link: function(scope, element) {

				var lastScroll = 0;
				var uptick = 0;

				var _windowScroll = function() {
					if (!element.is(':hidden')) {

						var scrollTop = $document.scrollTop(),
							winHeight = $window.innerHeight,
							filterHeight = element.outerHeight();


						if ($('.result_container .list').outerHeight() < filterHeight) {
							$('.result_container .list').css('min-height', filterHeight + 'px');
						}

						if (scrollTop < 10) {
							element.css('margin-top', 0);
							return;
						}

						if (filterHeight > winHeight) {
							var actualHeight, marginTop;

							actualHeight = scrollTop + winHeight + parseInt(element.css('padding-bottom')); //actual content height
							marginTop = (filterHeight > actualHeight) ? -scrollTop : winHeight - filterHeight;

							if(lastScroll > scrollTop && marginTop < 0) { //scrolling up, force the filters to scroll up
								uptick += 50;  // arbitrary number of pixels to push upward TODO possibly factor in the height for a smoother experience
							} else {
								uptick = 0;
							}
							marginTop = marginTop + uptick;

							if (marginTop < 50) {
								if (marginTop > 0) {
									marginTop = 0;
								}
								element.css('margin-top', marginTop + 'px');
							}

						}

						lastScroll = scrollTop;

                        scope.$apply();
					}
				};

                angular.element($window).bind('scroll', _windowScroll);
                scope.$on('$destroy', onDestroy);

				var $banner = $('#top-banner'), padding;
				if ($('.content-header-padding').length) {
					padding = 210;
					if ($banner.length) {
						padding += $banner.height();
					}
					element.css('padding-top', padding + 'px');
				} else if($banner.length) {
					padding = element.css('padding-top');
					padding = padding.replace('px','');
					padding = parseInt(padding);
					padding += $banner.height();
					element.css('padding-top', padding + 'px');
				}

				function onDestroy() {
                    angular.element($window).unbind('scroll', _windowScroll);
				}
			}
		};
	});