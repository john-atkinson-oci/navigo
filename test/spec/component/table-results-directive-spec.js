/*global describe, beforeEach, module, it, inject, expect */

describe('vsTableRsults:', function () {
	'use strict';

	beforeEach(function () {
		module('voyager.component');
	});

	var scope, element;

	beforeEach(inject(function ($compile, $rootScope) {
		scope = $rootScope.$new();
		angular.element(document.body).append('<div class="search-map"></div>');
		element = angular.element('<div vs-table-results></div>');
		$compile(element)($rootScope);
		element.scope().$apply();
	}));

	describe('Content Height', function(){
		it('should return 250 when availableHeight is smaller', function (){
			var minHeight = scope.minHeight(250);
			expect(minHeight).toBe(250);
		});

		it('should return available height if it is greater than 250', function (){
			var minHeight = scope.minHeight(350);
			expect(minHeight).toBe(350);
		});

		it('should return the max available height for table when map is small', function (){
			var availableHeight = scope.getAvailableHeight('small', 900);
			expect(availableHeight).toBe(300);
		});

		it('should return the max available height for table when map is large', function (){
			var availableHeight = scope.getAvailableHeight('large', 700);
			expect(availableHeight).toBe(420);
		});

		it('should return 0 when map is not showing', function (){
			var availableHeight = scope.getAvailableHeight('no');
			expect(availableHeight).toBe(0);
		});

	});

	describe('Events', function(){

		it('should set elelement\'s visibility to hidden', function () {
			var el = angular.element('<div />');
			scope.hideElement(el);
			expect(el.css('visibility')).toBe('hidden');
		});

	});

});