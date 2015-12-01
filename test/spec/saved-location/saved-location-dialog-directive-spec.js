describe('Save Location Dialog Directive:', function () {
    'use strict';

    var cfg = _.clone(config);

    beforeEach(function () {
        module('templates');
        module('voyager.search');
        module(function ($provide) {
            $provide.constant('config', cfg);
        });
    });

    var scope, $timeout, httpMock, compile, element, compiled, $location;

    function initDirective() {
        element = angular.element('<vs-save-location-dialog />');
        compiled = compile(element)(scope);
        element.scope().$apply();
    }

    beforeEach(inject(function ($compile, $rootScope, _$timeout_, $httpBackend, _$location_) {
        scope = $rootScope.$new();
        $timeout = _$timeout_;
        httpMock = $httpBackend;
        compile = $compile;
        $location = _$location_;
    }));


    describe('Render', function () {

        it('should render dialog', function () {

            httpMock.expectGET(new RegExp('auth')).respond({permissions:{manage:true}});  //permissions
            httpMock.expectGET(new RegExp('groups')).respond({groups:[]});  //groups

            initDirective();

            httpMock.flush();

            expect(element.html()).toContain('form-save-location');
        });

        it('should save with Place map type', function () {

            httpMock.expectGET(new RegExp('auth')).respond({permissions:{manage:false}});  //permissions

            initDirective();

            httpMock.flush();

            scope.savedLocation = {name:'name'};
            scope.selectedMapType = 'Place';
            scope.search = {location:'place'};
            scope.selectedDrawingType = 'DrawingType';

            $location.search()['place.id'] = 'id';

            //TODO where is this applied to scope? bootstrap modal?
            scope.$dismiss = function() {

            };

            httpMock.expectPOST(new RegExp('slocation')).respond({});  //save call

            scope.ok();

            httpMock.flush();

        });

        it('should save without Place map type', function () {

            httpMock.expectGET(new RegExp('auth')).respond({permissions:{manage:false}});  //permissions

            initDirective();

            httpMock.flush();

            scope.savedLocation = {name:'name'};
            scope.search = {location:'place', place:'place'};
            scope.selectedDrawingType = 'DrawingType';

            $location.search()['place.id'] = 'id';

            //TODO where is this applied to scope? bootstrap modal?
            scope.$dismiss = function() {

            };

            httpMock.expectPOST(new RegExp('slocation')).respond({});  //save call

            scope.ok();

            httpMock.flush();

        });

        it('should cancel', function () {

            httpMock.expectGET(new RegExp('auth')).respond({permissions:{manage:false}});  //permissions

            initDirective();

            httpMock.flush();

            //TODO where is this applied to scope? bootstrap modal?
            scope.$dismiss = function() {

            };

            spyOn(scope, '$dismiss');

            scope.cancel();

            expect(scope.$dismiss).toHaveBeenCalled();
        });
    });

});