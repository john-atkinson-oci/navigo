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

    var scope, $timeout, httpMock, compile, leafletData, $q, element, compiled, controller;

    function initDirective() {
        element = angular.element('<div vs-search-map></div>');
        compiled = compile(element)(scope);
        element.scope().$apply();
        controller = element.controller(scope);
    }

    beforeEach(inject(function ($compile, $rootScope, _$timeout_, $httpBackend, _leafletData_, _$q_) {
        scope = $rootScope.$new();
        $timeout = _$timeout_;
        httpMock = $httpBackend;
        compile = $compile;
        leafletData = _leafletData_;
        $q = _$q_;
    }));


    describe('Render', function () {

        it('should render leaflet map', function () {
            initDirective();

            $timeout.flush();

            expect(element.html()).toContain('leaflet');
        });

        it('should toggle map mode', function () {
            scope.displayFormat = 'detail_format';
            initDirective();
            expect(element.hasClass('dragging_disabled')).toBeTruthy();

            scope.displayFormat = 'short_format';
            scope.$apply();

            $timeout.flush();

            expect(element.hasClass('dragging_disabled')).toBeFalsy();
        });

        it('should zoom', function () {
            initDirective();

            scope.zoomIn($.Event( 'click' ));

            scope.zoomOut($.Event( 'click' ));
        });

        it('should toggle display format', function () {
            initDirective();

            scope.toggleDisplayFormat('Card', $.Event('click'));

            expect(scope.selectedMapType).toBe('Card');
        });

        // TODO broken with Cainkade changes for NGA-11
        // replaced with selectDrawingTool?

        //it('should draw rectangle', function () {
        //    scope.selectedDrawingType = 'Intersects';
        //    scope.displayFormat = 'detail_format';
        //
        //    spyOn(leafletData,'getMap').and.callThrough();
        //
        //    initDirective();
        //
        //    scope.drawRectangle('within', $.Event('click'));
        //
        //    scope.$apply();
        //    $timeout.flush();
        //
        //    expect(scope.selectedDrawingType).toBe('Within');
        //    expect(leafletData.getMap).toHaveBeenCalled();
        //
        //});

        it('should resize', function () {
            scope.selectedDrawingType = 'Intersects';
            scope.displayFormat = 'detail_format';

            spyOn(leafletData,'getMap').and.callThrough();

            // TODO function in outer scope, fix this
            scope.toggleMap = function(){};

            initDirective();

            scope.resize();

            scope.$apply();
            $timeout.flush();

            expect(scope.selectedDrawingType).toBe('Intersects');
            expect(leafletData.getMap).toHaveBeenCalled();
        });
    });

});