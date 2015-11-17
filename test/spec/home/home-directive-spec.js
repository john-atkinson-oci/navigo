describe('Home Directive:', function () {
    'use strict';

    beforeEach(function () {
        module('templates');
        module('voyager.home');
        module('voyager.search');
        module(function ($provide) {
            $provide.constant('config', config);
        });
    });

    var scope, element, compiled, timeout, httpMock, $window, $document, $compile, $rootScope;

    beforeEach(inject(function (_$compile_, _$rootScope_, $timeout, $httpBackend, _$window_, _$document_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $compile = _$compile_;
        timeout = $timeout;
        httpMock = $httpBackend;
        $window = _$window_;
        $document = _$document_;
    }));

    function applyDirective() {
        element = angular.element('<div vs-searchform>Search Form</div>');
        compiled = $compile(element)($rootScope);
        $(document.body).append(element);
        element.scope().$apply();
    }

    describe('Load', function() {
        it('should load and destroy', function () {
            $rootScope.displayFormat = 'short_format';
            applyDirective();

            timeout.flush();

            // TODO expect

            spyOn(timeout, 'cancel').and.callThrough();

            $rootScope.$emit('$destroy');

            expect(timeout.cancel).toHaveBeenCalled();
        });

        it('should resize', function () {
            $rootScope.displayFormat = 'short_format';
            applyDirective();

            timeout.flush();

            $(window).trigger('resize');

            timeout.flush();

            // TODO expect
        });

        it('should adjust when displayFormat changes', function () {
            applyDirective();

            timeout.flush();

            $rootScope.displayFormat = 'short_format';
            $rootScope.$apply();

            // TODO expect

            $rootScope.displayFormat = 'long_format';
            $rootScope.$apply();

            // TODO expect
        });

    });


});