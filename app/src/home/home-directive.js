/*global angular, $ */

angular.module('voyager.home')
	.directive('vsSearchform', function($timeout) {
		'use strict';

		function _adjustMap(element) {
			var availableHeight = $(window).height() - $('#header').height(),
				timeDuration = availableHeight * 0.5;


			if ($('.content-header-padding').length) {
				availableHeight -= $('.content-header-padding').height();
			}

			$('#searchContainer').stop().animate({
				height: availableHeight
			}, timeDuration, 'linear');

			element.stop().animate({
				top: (availableHeight - $('#searchContainer .search_wrap').outerHeight() - 3),
				height: $('.search_wrap').outerHeight()
			}, timeDuration, 'linear');
		}

		return {
			restrict: 'A',
			link: function(scope, element) {

				$timeout(function() {
					element.find('input[name=query]').trigger('focus').parents('fieldset').addClass('focused').siblings().removeClass('focused');
				}, 155);

				element.on('focus', '.input_field', function(event){
					$(event.currentTarget).parents('fieldset').addClass('focused').siblings().removeClass('focused');
				}).on('blur', '.input_field', function(event){
					$(event.currentTarget).parents('fieldset').removeClass('focused');
				});

				// TODO inefficient to have 2 watchers watching the same value!
				scope.$watch('displayFormat', function(){
					if (scope.displayFormat === 'short_format') {
						element.find('.location_fieldset').addClass('focused');
					} else {
						element.find('.location_fieldset').removeClass('focused');
					}
				});

				var initialized = false;
				scope.$watch('displayFormat', function() {
					if (!initialized) {
						initialized = true;
						return;
					}

					$(window).scrollTop(0);
					if (scope.displayFormat === 'short_format') {
						_adjustMap(element);
					} else {

						element.css('height', 'auto').stop().animate({
							top: 100,
							height: ($('.search_wrap').outerHeight() + $('#searchHistory').outerHeight())
						}, 300, 'linear', function() {
							$(this).css('height', 'auto');
						});

						$('#searchContainer').stop().animate({
							height: 540
						}, 300, 'linear');
					}
				});

				var timer;

				//attach resize event to window to adjust map based on viewport size
				function _resizeMap() {
					$timeout.cancel(timer);
					if (scope.displayFormat === 'short_format') {
						timer = $timeout(function() {
							_adjustMap(element);
						}, 15);
					}
				}

				$(window).on('resize', _resizeMap);

				//on scope destory, cancel timer and unbind resize event
				scope.$on(
				    '$destroy',
				    function () {
				        $timeout.cancel(timer);
				        $(window).unbind('resize', _resizeMap);
				    }
				);
			}
		};
	});

