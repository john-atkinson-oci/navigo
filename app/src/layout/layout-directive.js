/*global angular, $, config */

angular.module('voyager.layout')
	.directive('vsLayout', function($location) {
		'use strict';

		return {
			restrict: 'A',
			link: function(scope) {

				scope.$on('$stateChangeSuccess', toggleScreen);

				function toggleScreen() {
					if ($location.path() === '/search') {
						$('body').addClass('full');
					} else {
						$('body').removeClass('full');
					}
				}

				if (!_.isUndefined(config.ecobar) && config.ecobar) {
					var fileref=document.createElement('script');
					fileref.setAttribute('type','text/javascript');
					fileref.setAttribute('src', 'assets/js/vendor/ecobar/jquery.ecobar.js');
					document.getElementsByTagName('head')[0].appendChild(fileref);
				}

			}
		};
	});

