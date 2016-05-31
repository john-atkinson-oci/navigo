/*global describe, beforeEach, module, it, inject, config */

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

    var scope, controllerService, q, location, timeout, _leafletData, httpMock, $uibModal;

    //spies
   // var $s = {'configService':{}};

    beforeEach(inject(function ($rootScope, $controller, $q, $location, $timeout, $httpBackend, _$uibModal_) {
        scope = $rootScope.$new();
        q = $q;
        controllerService = $controller;
        location = $location;
        timeout = $timeout;
        httpMock = $httpBackend;
        $uibModal = _$uibModal_;
       // EZSpy.spyOnAll($s, [{configService:configService}]);
        //$s.searchService.getPageIds.and.returnValue([1]);
        //$s.searchService.testEsriGeocodeService.and.returnValue(q.when({}));
    }));

    var inputItemsWithQuery = {name:'input_items', query:{fq:'field:facet'}, response:{docs:[]}};

    function initCtrl() {
        spyOn(location,'path').and.returnValue('status');

        httpMock.expectGET(new RegExp('projections')).respond({});  // param service - projections call (could mock param service)
        httpMock.expectGET(new RegExp('job')).respond({params:[inputItemsWithQuery],state:'SUCCESS'});  // check status call

        controllerService('StatusCtrl', {$scope: scope, $stateParams: {id: 'foo'}, leafletData: _leafletData});
    }

    describe('Load', function () {

        it('should load status', function () {

            //var response = {docs:[], numFound:0}, sort = {key:'key', value:'value'};

            initCtrl();

            httpMock.expectGET(new RegExp('display')).respond({params:[inputItemsWithQuery]});  // display call
            httpMock.expectGET(new RegExp('status')).respond({state:'SUCCESS'});  // check status call
            httpMock.expectGET(new RegExp('job')).respond({params:[inputItemsWithQuery],state:'SUCCESS'});  // check progress call

            httpMock.flush();

            httpMock.expectGET(new RegExp('job')).respond({params:[inputItemsWithQuery],state:'SUCCESS'});  // check progress call
            timeout.flush();

            httpMock.flush();

            scope.$apply();

            expect(scope.isSuccess).toBeTruthy();
            expect(scope.statusColor).toBe('alert-success');
            expect(scope.isRunning).toBeFalsy();
        });

        it('should load status as running', function () {

            //var response = {docs:[], numFound:0}, sort = {key:'key', value:'value'};

            initCtrl();

            httpMock.expectGET(new RegExp('display')).respond({params:['param']});  // display call
            httpMock.expectGET(new RegExp('job')).respond({state:'RUNNING', params:[inputItemsWithQuery], status:{text:'running'}, progress:1});  // check progress call

            httpMock.flush();

            httpMock.expectGET(new RegExp('status')).respond({state:'SUCCESS'});  // check status
            timeout.flush();

            httpMock.expectGET(new RegExp('job')).respond({state:'SUCCESS', params:[inputItemsWithQuery]});  // check progress call again
            //httpMock.expectGET().respond({state:'SUCCESS'});  // check status call on success
            //httpMock.expectGET(new RegExp('status')).respond({state:'SUCCESS'});  // check status call on success

            httpMock.flush();

            httpMock.expectGET(new RegExp('job')).respond({state:'SUCCESS', params:[inputItemsWithQuery]});  // final progress call again
            timeout.flush();

            httpMock.flush();

            scope.$apply();

            expect(scope.isSuccess).toBeTruthy();
            expect(scope.statusColor).toBe('alert-success');
            expect(scope.isRunning).toBeFalsy();
        });

        it('should load status as failed', function () {

            initCtrl();

            httpMock.expectGET(new RegExp('display')).respond({params:['param']});  // display call
            httpMock.expectGET(new RegExp('job')).respond({state:'FAILED', params:[inputItemsWithQuery]});  // check progress call
            httpMock.expectGET(new RegExp('job')).respond({state:'FAILED', params:[inputItemsWithQuery], status:{text:'failed'}});  // final status

            httpMock.flush();

            httpMock.expectGET(new RegExp('status')).respond({state:'FAILED', status:{text:'failed'}});  // check status
            timeout.flush();

            scope.$apply();

            expect(scope.isSuccess).toBeFalsy();
            expect(scope.statusColor).toBe('alert-error');
            expect(scope.isRunning).toBeFalsy();
        });

        it('should load status as warning', function () {

            initCtrl();

            httpMock.expectGET(new RegExp('display')).respond({params:['param']});  // display call
            httpMock.expectGET(new RegExp('job')).respond({state:'WARNING', params:[inputItemsWithQuery]});  // check progress call
            httpMock.expectGET(new RegExp('job')).respond({state:'WARNING', params:[inputItemsWithQuery], status:{text:'failed'}});  // final status

            httpMock.flush();

            httpMock.expectGET(new RegExp('job')).respond({state:'WARNING', status:{text:'failed'}});  // check status
            timeout.flush();

            scope.$apply();

            expect(scope.isSuccess).toBeTruthy();
            expect(scope.statusColor).toBe('alert-warning');
            expect(scope.isRunning).toBeFalsy();
        });

        it('should load status as cancelled', function () {

            initCtrl();

            httpMock.expectGET(new RegExp('display')).respond({params:['param']});  // display call
            httpMock.expectGET(new RegExp('job')).respond({state:'CANCELED', params:[inputItemsWithQuery]});  // check progress call
            httpMock.expectGET(new RegExp('job')).respond({state:'CANCELED', params:[inputItemsWithQuery], status:{text:'failed'}});  // final status

            httpMock.flush();

            httpMock.expectGET(new RegExp('job')).respond({state:'CANCELED', status:{text:'failed'}});  // check status
            timeout.flush();

            scope.$apply();

            expect(scope.isSuccess).toBeFalsy();
            expect(scope.isRunning).toBeFalsy();
        });

    });

    describe('Functions', function () {

        function initCancelled() {
            initCtrl();

            httpMock.expectGET(new RegExp('display')).respond({params:['param']});  // display call
            httpMock.expectGET(new RegExp('job')).respond({state:'CANCELED', params:[inputItemsWithQuery]});  // check progress call
            httpMock.expectGET(new RegExp('job')).respond({state:'CANCELED', params:[inputItemsWithQuery], status:{text:'failed'}});  // final status

            httpMock.flush();

            //httpMock.expectGET(new RegExp('job')).respond({state:'CANCELED', status:{text:'failed'}});  // check status
            timeout.flush();

            scope.$apply();
        }

        it('should email', function () {

            initCancelled();

            httpMock.expectPUT(new RegExp('email')).respond({});  // email

            scope.emailClick();

            httpMock.flush();

            expect(scope.emailButtonText).toBe('Cancel Notify');

            scope.emailClick();

            expect(scope.emailButtonText).toBe('Notify Me When Done');
        });

        it('should cancel', function () {

            initCancelled();

            httpMock.expectDELETE(new RegExp('job')).respond({});  // cancel job

            scope.cancelClick();

            httpMock.flush();

        });

        it('should cancel', function () {

            initCancelled();

            httpMock.expectDELETE(new RegExp('job')).respond({});  // cancel job

            scope.cancelClick();

            httpMock.flush();

        });

        it('should show details', function () {

            spyOn($uibModal, 'open').and.callThrough();

            initCancelled();

            scope.showDetails();

            expect($uibModal.open).toHaveBeenCalled();

        });

        it('should show report', function () {

            spyOn($uibModal, 'open').and.callThrough();

            initCancelled();

            scope.report = {Skipped:true};
            scope.showReport();

            expect($uibModal.open).toHaveBeenCalled();

        });

        it('should show log', function () {

            spyOn($uibModal, 'open').and.callThrough();

            initCancelled();

            scope.report = {Skipped:true};
            scope.getData('file');

            expect($uibModal.open).toHaveBeenCalled();

        });

        it('should show url', function () {

            $(document.body).append('<input id="copy-url">');

            initCancelled();

            scope.showUrl();

            timeout.flush();
        });

        it('should kill timer on destroy when running', function () {

            spyOn(timeout,'cancel').and.callThrough();

            initCtrl();

            httpMock.expectGET(new RegExp('display')).respond({params:['param']});  // display call
            httpMock.expectGET(new RegExp('job')).respond({state:'RUNNING', params:[inputItemsWithQuery], status:{text:'running'}, progress:1});  // check progress call

            httpMock.flush();

            scope.$emit('$destroy');

            expect(timeout.cancel).toHaveBeenCalled();

        });

    });

});