describe('Filters Directive:', function () {
    'use strict';

    beforeEach(function () {
        module('templates');
        // module('voyager.common'); //auth service module - apparently this is needed to mock the auth service
        module('voyager.search');
        module(function ($provide) {
            $provide.constant('config', config);
        });
    });

    var scope, element, controller, compiled, timeout, httpMock, $window, $document;

    beforeEach(inject(function ($compile, $rootScope, $timeout, $httpBackend, _$window_, _$document_) {
        var padded = $('<div class="content-header-padding">junk</div>');
        $(document.body).append(padded);

        scope = $rootScope.$new();
        element = angular.element('<div vs-filters>Filters</div>');
        compiled = $compile(element)($rootScope);

        $(document.body).append(element);

        element.scope().$apply();
        controller = element.controller(scope);
        timeout = $timeout;
        httpMock = $httpBackend;
        $window = _$window_;
        $document = _$document_;
    }));

    describe('Functions', function() {
        it('should scroll', function () {
            var scrollTop = 10;
            spyOn($document,'scrollTop').and.returnValue(scrollTop);
            $window.innerHeight = 100;

            $($window).trigger('scroll');

            expect($(element).css('margin-top')).toBe(-scrollTop + 'px');
        });

        it('should remove scroll binding', function () {

            spyOn(angular,'element').and.callThrough();
            scope.$emit('$destroy');
            expect(angular.element).toHaveBeenCalledWith($window);
        });

    });


});