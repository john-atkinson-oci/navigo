/*global describe, beforeEach, module, angular, it, expect, config, inject */

describe('ExportResults:', function () {

	'use strict';

	beforeEach(function () {
		module('templates');
		module('voyager.search');
		module(function ($provide) {
			$provide.constant('config', config);
		});
	});

	var scope, element, compiled, controller;

	beforeEach(inject(function ($compile, $rootScope) {
        scope = $rootScope.$new();
        element = angular.element('<vs-export-results />');
        compiled = $compile(element)(scope);
        element.scope().$apply();
        controller = element.controller(scope);

        scope.$dismiss = function() {
			return true;
        };
    }));

	describe('Modal Initial State', function () {
		it('should applied template', function () {
			expect(element.html()).not.toEqual('');
		});
	});

	describe('Error States', function () {

		it('should return error state equals false', function () {
			expect(scope.hasError()).toBe(false);
		});

		it('should return error message when CSVFileName is empty', function () {
			scope.save();
			expect(scope.success).toBe(false);
			expect(scope.error).toBe('Please enter a file name');
		});

		it('should return error state when CSVFileName is not empty', function () {
			scope.error = 'error message';
			scope.CSVFileName = 'text.cvs';
			scope.save();
			expect(scope.error).toBe(false);
		});
	});

	describe('File Name', function () {
		it('should return file name with "csv" extension with no existing extension', function () {
			scope.CSVFileName = 'text';
			var newFileName = scope.getFileName();
			expect(newFileName).toBe('text.csv');
		});

		it('should return file name with "csv" extension with existing extension', function () {
			scope.CSVFileName = 'text.test.csv';
			var newFileName = scope.getFileName();
			expect(newFileName).toBe('text.test.csv');
		});
	});


	describe('Events', function () {

		it('it should return an anchor tag object with proper attributes', function (){
			var response = {
				success: true,
				data: '97bd7c139978719d,trscalendar.pdf,application/pdf'
			};

			scope.CSVFileName = 'text.csv';
			var anchor = scope.createAnchorTag(response.data, scope.CSVFileName);
			expect(anchor.attr('download')).toBe(scope.CSVFileName);
			expect(anchor.attr('href')).toBe('data:attachment/csv;charset=utf-8,' + response.data);

		});

		it('it should set success to "true" when handle a success api return', function (){
			var response = {
				data: '97bd7c139978719d,trscalendar.pdf,trscalendar.pdf',
				status: 200
			};

			scope.CSVFileName = 'text.csv';
			scope.successHandler(response, scope.CSVFileName);
			expect(scope.success).toBe(true);
		});

		it('it should set error message to "failed" when handle an api return width error message', function (){
			var response = {
				error: 'failed'
			};

			scope.successHandler(response, 'text.csv');
			expect(scope.error).toBe('failed');
		});

		it('it should show error message when handle a failed api return', function (){
			var response = {};

			scope.errorHandler(response);
			expect(scope.error).toBe('Please try again later');
		});

		it('it should show returned error message when handle a failed api return', function (){
			var response = {
				error: 'failed'
			};

			scope.errorHandler(response);
			expect(scope.error).toBe('failed');
		});

	});

});