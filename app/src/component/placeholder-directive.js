/*global angular */

angular.module('voyager.component')
	.directive('placeholder', function($timeout) {
		'use strict';
		return {
			restrict: 'A',
			link: function(scope, element, attr, ctrl) {

				if ($(element).parents('#ecobar_addin').length) {
					return;
				}

				//if browser supports placeholder, do nothing
				var test = document.createElement('input');
				if ('placeholder' in test) {
					return true;
				}

				$timeout(function() {
					element.val(element.attr('placeholder')).addClass('placeholder');
				});

				if (element.attr('type').toLowerCase() === 'password') {
					element.data('oType', 'password').attr('type', 'text');
				}

				element.bind('focus', function(){
					if (element.data('oType') === 'password') {
						element.attr('type', 'password');
					}

					if (element.val() === element.attr('placeholder')) {
						element.val('').removeClass('placeholder');
					}
				}).bind('blur', function(){
					if (element.val() === '') {
						element.val(element.attr('placeholder')).addClass('placeholder');
						if (element.data('oType') === 'password') {
							element.attr('type', 'text');
						}
					}
				});

				if (attr.ngModel !== undefined && ctrl !== undefined) {
					var value;
					scope.$watch(attr.ngModel, function(val){
						value = val || '';
					});

					ctrl.$formatters.unshift(function(val){
						if (!val) {
							element.val(element.attr('placeholder'));
							value = '';
							return attr.placeholder;
						}

						return val;
					});
				}
			} //link
		};
	});

