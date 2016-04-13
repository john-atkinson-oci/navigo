/*global describe, beforeEach, module, it, inject, config */

describe('TasksCtrl', function () {

    'use strict';

    beforeEach(function () {
        module('voyager.security'); //auth service module - apparently this is needed to mock the auth service
        module('taskRunner');
        module('LocalStorageModule');
        module('angulartics');
        module('ui.bootstrap');
        module('cart');
        module('voyager.filters');
        module('ui.router');
        module(function ($provide) {
            $provide.constant('config', config);
            //$provide.value('authService',{});  //mock the auth service so it doesn't call the init methods
        });
    });

    var $scope, controllerService, q, location, timeout, httpMock, $modal, cartService, $state;

    beforeEach(inject(function ($rootScope, $controller, $q, $location, $timeout, $httpBackend, _$modal_, _cartService_, _$state_) {
        $scope = $rootScope.$new();
        q = $q;
        controllerService = $controller;
        location = $location;
        timeout = $timeout;
        httpMock = $httpBackend;
        $modal = _$modal_;
        cartService = _cartService_;
        $state = _$state_;
    }));

    function initCtrl(permission, items) {
        controllerService('TasksCtrl', {
            $scope: $scope,
            $state: $state
        });

        httpMock.expectGET(new RegExp('auth\/info')).respond({permissions:permission, user:{groups:[]}}); //auth call
        httpMock.expectJSONP(new RegExp('solr')).respond({response: {docs: items}}); // for setItemExtent call
        httpMock.expectJSONP(new RegExp('solr\/tasks')).respond({response: {docs: items}});
        httpMock.expectJSONP(new RegExp('solr')).respond({response: {docs: items}}); // for validateTaskItems which calls cartItemsQuery.fetchItems
        httpMock.flush();
    }

    describe('Load tasks', function () {

        it('should load tasks', function () {
            var item = {category: ['category'], task: 'name'};
            initCtrl({manage:true}, [item]);
            expect($scope.hasUnavailable).toBeFalsy();
        });

        it('should have one task unavailable', function () {

            var item = {category: ['category'], task: 'name', available: false};
            initCtrl({manage:true}, [item]);
            expect($scope.hasUnavailable).toBeTruthy();
        });

        it('should refresh tasks', function () {

            var item = {category: ['category'], task: 'name'};
            initCtrl({manage:true}, [item]);
            httpMock.expectPOST(new RegExp('tasks\/refresh')).respond({});
            httpMock.expectJSONP(new RegExp('solr')).respond({response: {docs: []}}); // for setItemExtent call
            httpMock.expectJSONP(new RegExp('solr\/tasks')).respond({response: {docs: [item]}});
            httpMock.expectJSONP(new RegExp('solr')).respond({response: {docs: []}}); // for validateTaskItems which calls cartItemsQuery.fetchItems
            $scope.refreshTasks();
            httpMock.flush();
            expect($scope.hasUnavailable).toBeFalsy();
        });

        it('should select task', function () {

            spyOn($state,'go');

            var item = {category: ['category'], task: 'name', available: true};
            initCtrl({manage:true}, [item]);

            httpMock.expectJSONP(new RegExp('solr')).respond({response: {docs: []}}); // for validateTaskItems which calls cartItemsQuery.fetchItems

            var task = {name:'task2', available:true, constraints:['format_keyword:File']};

            $scope.selectTask(task);

            httpMock.flush();

            expect($state.go).toHaveBeenCalled();

        });

    });

});