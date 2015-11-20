describe('Placeholder Directive:', function () {
    'use strict';

    beforeEach(function () {
        module('templates');
        // module('voyager.common'); //auth service module - apparently this is needed to mock the auth service
        module('voyager.component');
        module(function ($provide) {
            $provide.constant('config', config);
        });
    });

    var elementHtml = '<div><input type="text" placeholder="i am groot"></input></div>';

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

        element = angular.element(elementHtml);
        compiled = $compile(element)(scope);
        $(document.body).append(element);
        element.scope().$apply();
        // timeout.flush();
    }
    describe('Functions', function() {

        it('should contain placeholder attribute', function () {
            applyDirective();
            $(element).trigger('focus');
            var templateAsHtml = element.html();
            expect(templateAsHtml).toContain('placeholder');
        });

    });
});