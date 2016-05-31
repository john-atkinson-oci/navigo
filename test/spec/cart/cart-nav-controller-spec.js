'use strict';

describe('Controller: CartNavCtrl', function () {

	var $scope, CartNavCtrl, $timeout, taskService, authService, cartService, searchService, $uibModal, $state, usSpinnerService, $location, $http, $controller;
	var cfg = _.clone(config);

	beforeEach(function () {

		module('cart');
		module('voyager.security');
		module('voyager.search');
		module('voyager.util');
		module('voyager.filters');
		module('voyager.config');
		module('taskRunner');
		module(function ($provide) {
			$provide.constant('config', cfg);
		});

		inject(function (_$controller_, _$timeout_, _taskService_, _authService_, _cartService_, _searchService_, _$uibModal_, _usSpinnerService_, _$location_, _$state_, $httpBackend, $rootScope) {
			$scope = $rootScope.$new();
			$timeout = _$timeout_;
			taskService = _taskService_;
			authService = _authService_;
			cartService = _cartService_;
			searchService = _searchService_;
			$uibModal = _$uibModal_;
			usSpinnerService = _usSpinnerService_;
			$location = _$location_;
			$http = $httpBackend;
			$controller = _$controller_;
			$state = _$state_;
		});

	});

	// Specs here

	it('should init', function () {
		CartNavCtrl = $controller('CartNavCtrl', {
			$scope: $scope
		});
		expect($scope.uiText.name).toBe('Queue');
		//$http.expectGET(new RegExp('auth')).respond({response: {docs:[]}});
		$http.expectJSONP().respond({response: {docs:[]}});
		$http.flush();
	});

	it('should init with default task', function () {
		$location.search('task','task');
		CartNavCtrl = $controller('CartNavCtrl', {
			$scope: $scope
		});
		//$http.expectGET(new RegExp('auth')).respond({response: {docs:[]}});
		$http.expectJSONP().respond({response: {docs:[]}});
		$http.flush();
		$timeout.flush();
	});

	it('should refresh tasks', function () {
		CartNavCtrl = $controller('CartNavCtrl', {
			$scope: $scope
		});
		// init expects
		//$http.expectGET(new RegExp('auth')).respond({response: {docs:[]}});
		$http.expectJSONP(new RegExp('solr\/tasks')).respond({response: {docs:[{id:'task1', category:['category1']},{id:'task2', category:['category1']}]}});

		$scope.refreshTasks();
		$http.expectPOST(new RegExp('refresh')).respond({});
		$http.expectJSONP(new RegExp('solr\/tasks')).respond({response: {docs:[]}});
		$http.flush();
	});

	it('should select task', function () {
		$controller('CartNavCtrl', {
			$scope: $scope
		});

		spyOn(taskService,'validateTaskItems').and.callThrough();

		var task = {name:'task2', available:true, constraints:['format_keyword:File']};

		$scope.selectTask(task);

		expect(taskService.validateTaskItems).toHaveBeenCalled();
	});

});