/*global describe, beforeEach, module, it, inject, config, EZSpy */

describe('StatusCtrl', function () {

    'use strict';

    beforeEach(function () {
        //module('voyager.security'); //auth service module - apparently this is needed to mock the auth service
        module('taskRunner');
        module('LocalStorageModule');
        module('angulartics');
        module('ui.bootstrap');

        module(function ($provide) {
            $provide.constant('config', config);
            //$provide.value('authService',{});  //mock the auth service so it doesn't call the init methods
        });
    });

    var scope, controllerService, q, location, timeout, _leafletData, httpMock;

    //spies
    var $s = {'configService':{}};

    beforeEach(inject(function ($rootScope, $controller, $q, $location, $timeout, $httpBackend) {
        scope = $rootScope.$new();
        q = $q;
        controllerService = $controller;
        location = $location;
        timeout = $timeout;
        httpMock = $httpBackend;
       // EZSpy.spyOnAll($s, [{configService:configService}]);
        //$s.searchService.getPageIds.and.returnValue([1]);
        //$s.searchService.testEsriGeocodeService.and.returnValue(q.when({}));
    }));

    describe('Load', function () {

        it('should load status', function () {

            var response = {docs:[], numFound:0}, sort = {key:'key', value:'value'};

            spyOn(location,'path').and.returnValue('status');

            httpMock.expectGET().respond({});  // param service - projections call (could mock param service)
            httpMock.expectGET().respond({});  // check status call

            controllerService('StatusCtrl', {$scope: scope, $stateParams: {id: 'foo'}, leafletData: _leafletData});

            httpMock.expectGET().respond({});  // display call
            httpMock.expectGET().respond({});  // check progress call
            httpMock.expectGET().respond({});  // check status call on success

            httpMock.flush();

            scope.$apply();

            expect(scope.isSuccess).toBeTruthy();
            expect(scope.statusColor).toBe('alert-success');
            expect(scope.isRunning).toBeFalsy();
        });

    });
});