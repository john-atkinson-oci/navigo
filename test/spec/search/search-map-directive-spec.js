describe('Search Map Directive:', function () {
    'use strict';

    var cfg = _.clone(config);

    beforeEach(function () {
        module('templates');
        // module('voyager.common'); //auth service module - apparently this is needed to mock the auth service
        module('voyager.search');
        module(function ($provide) {
            $provide.constant('config', cfg);
        });
    });

    var scope, $timeout, httpMock, rootScope, compile, leafletData, $q, element, compiled, controller;

    function initDirective($rootScope, $compile) {
        element = angular.element('<div vs-search-map></div>');
        compiled = $compile(element)($rootScope);
        element.scope().$apply();
        controller = element.controller(scope);
    }

    beforeEach(inject(function ($compile, $rootScope, _$timeout_, $httpBackend, _leafletData_, _$q_) {
        scope = $rootScope.$new();
        $timeout = _$timeout_;
        httpMock = $httpBackend;
        rootScope = $rootScope;
        compile = $compile;
        leafletData = _leafletData_;
        $q = _$q_;
    }));


    describe('Render', function () {

        it('should render leaflet map', function () {
            initDirective(rootScope, compile);

            $timeout.flush();

            expect(element.html()).toContain('leaflet');
        });

        it('should toggle map mode', function () {
            rootScope.displayFormat = 'detail_format';
            initDirective(rootScope, compile);
            expect(element.hasClass('dragging_disabled')).toBeTruthy();

            rootScope.displayFormat = 'short_format';
            rootScope.$apply();

            $timeout.flush();

            expect(element.hasClass('dragging_disabled')).toBeFalsy();
        });
    });



    //
    //
    //describe('Functions', function () {
    //
    //    it('should zoom', function () {
    //        initDirective(rootScope, compile);
    //
    //        scope.zoomIn($.Event( 'click' ));
    //
    //        scope.zoomOut($.Event( 'click' ));
    //    });
    //
    //    it('should toggle display format', function () {
    //        initDirective(rootScope, compile);
    //
    //        scope.toggleDisplayFormat('Card', $.Event('click'));
    //
    //        expect(scope.selectedMapType).toBe('Card');
    //    });
    //
    //    it('should draw rectangle', function () {
    //        rootScope.selectedDrawingType = 'Intersects';
    //        rootScope.displayFormat = 'detail_format';
    //
    //        spyOn(leafletData,'getMap').and.callThrough();
    //
    //        initDirective(rootScope, compile);
    //
    //        scope.drawRectangle('within', $.Event('click'));
    //
    //        scope.$apply();
    //        $timeout.flush();
    //
    //        expect(scope.selectedDrawingType).toBe('Within');
    //        expect(leafletData.getMap).toHaveBeenCalled();
    //
    //    });
    //
    //    it('should resize', function () {
    //        rootScope.selectedDrawingType = 'Intersects';
    //        rootScope.displayFormat = 'detail_format';
    //
    //        spyOn(leafletData,'getMap').and.callThrough();
    //
    //        // TODO function in outer scope, fix this
    //        rootScope.toggleMap = function(){};
    //
    //        initDirective(rootScope, compile);
    //
    //        scope.resize();
    //
    //        scope.$apply();
    //        $timeout.flush();
    //
    //        expect(scope.selectedDrawingType).toBe('Intersects');
    //        expect(leafletData.getMap).toHaveBeenCalled();
    //    });
    //
    //});
});