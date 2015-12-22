/*global describe, beforeEach, module, it, inject, config */

describe('TaskCtrl', function () {

    'use strict';

    beforeEach(function () {
        //module('voyager.security'); //auth service module - apparently this is needed to mock the auth service
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

    var scope, controllerService, q, location, timeout, httpMock, $modal, cartService;

    beforeEach(inject(function ($rootScope, $controller, $q, $location, $timeout, $httpBackend, _$modal_, _cartService_) {
        scope = $rootScope.$new();
        q = $q;
        controllerService = $controller;
        location = $location;
        timeout = $timeout;
        httpMock = $httpBackend;
        $modal = _$modal_;
        cartService = _cartService_;
    }));

    var inputItemsWithQuery = {name:'input_items', query:{fq:'field:facet', params:{bbox:'',bboxt:''}}, ids:[], type:'VoyagerResults', response:{docs:[]}};

    function initCtrl() {
        //spyOn(location,'path').and.returnValue('status');
        //
        httpMock.expectGET(new RegExp('projections')).respond({});  // param service - projections call (could mock param service)
        httpMock.expectGET(new RegExp('task\/name\/init')).respond({params:[inputItemsWithQuery]});  // check status call
        httpMock.expectGET(new RegExp('display')).respond({params:[inputItemsWithQuery]});  // check status call
        var stateParams = {task:{name:'name'}};
        controllerService('TaskCtrl', {$scope: scope, $stateParams:stateParams});

        httpMock.flush();
    }

    describe('Load', function () {

        it('should load', function () {
            initCtrl();
        });

        it('should exec', function () {
            cartService.addQuery({fq:'field:facet',params:{bbox:'',bboxt:''}, solrFilters:[], bounds:'&fq=bbox:0000'});
            cartService.addItem({id:'1'});

            initCtrl();

            httpMock.expectPOST(new RegExp('validate=true')).respond({});  // validate
            httpMock.expectPOST(new RegExp('validate=false')).respond({id:'id'});  // exec

            scope.execTask();

            httpMock.flush();

            expect(location.path()).toBe('/status/id');
        });

        it('should fail validation', function () {
            cartService.addQuery({fq:'field:facet',params:{bbox:'',bboxt:''}, solrFilters:[], bounds:'&fq=bbox:0000'});
            cartService.addItem({id:'1'});

            initCtrl();

            httpMock.expectPOST(new RegExp('validate=true')).respond(500,{params:[inputItemsWithQuery], errors:['error']});  // validate

            scope.execTask();

            httpMock.flush();

            expect(scope.errors).toEqual(['error']);

            scope.setError('error message');

            expect(scope.errorMessage).toBe('error message');
        });

        it('should select task', function () {
            cartService.addQuery({fq:'field:facet',params:{bbox:'',bboxt:''}});
            cartService.addItem({id:'1'});

            initCtrl();

            httpMock.expectGET(new RegExp('task2\/init')).respond({params:[inputItemsWithQuery]});  // validate
            httpMock.expectGET(new RegExp('display')).respond({params:[inputItemsWithQuery]});  // display

            scope.selectTask({name:'task2', available:true});

            httpMock.flush();

            //expect(location.path()).toBe('/status/id');
        });

    });

});