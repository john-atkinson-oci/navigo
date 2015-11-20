describe('Highlight Directive:', function () {
    'use strict';

    beforeEach(function () {
        module('templates');
        // module('voyager.common'); //auth service module - apparently this is needed to mock the auth service
        module('voyager.component');
        module(function ($provide) {
            $provide.constant('config', config);
        });
    });

    var elementHtml = '<div ng-hide="isURL" vs-highlight><span id="locationPathWrap"></span><span id="locationPathNotHighlight"><a href="{{::doc_path.url}}" id="locationPath0">{{::doc_path.path}}</a><a href="{{::sub_path.url}}" ng-repeat="sub_path in sub_paths" id="locationPath{{$index + 1}}">{{::sub_path.path}}</a></span></div>';

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

        // httpMock.expectGET(new RegExp('auth')).respond({}); // auth call
        element = angular.element(elementHtml);
        compiled = $compile(element)(scope);
        $(document.body).append(element);
        element.scope().$apply();
    }

    function getSelectedText(){
        return  window.getSelection ? window.getSelection() : document.selection.createRange();
    }

    describe('Functions', function() {


        it('should trigger mouseover and mouseout', function () {
            applyDirective();
            $(element).find('a').trigger('mouseover');
            $(element).find('a').trigger('mouseout');

        });

        it('should append the element', function () {
            applyDirective();
            expect($(element).find('#locationPathWrap')).toBeDefined();
        });

        it('should append the correct subpaths', function () {
            applyDirective();
            scope.doc_path = {url: 'http://foo.bar'}
            scope.sub_paths = [{url: 'http://one.com', path: 'one'}, {url: 'http://two.com', path: 'two'},{url: 'http://three.com', path: 'three'}]
            scope.$digest()
            var templateAsHtml = element.html();
            expect(templateAsHtml).toContain(scope.doc_path.url);

            expect($(element).find('#locationPath1')).toBeDefined();
            expect($(element).find('#locationPath2')).toBeDefined();
            expect($(element).find('#locationPath3')).toBeDefined();

        });

        it('should select the text on mouseover', function () {
            applyDirective();
            scope.doc_path = {url: 'http://foo.bar'}
            scope.sub_paths = [{url: 'http://one.com', path: 'one'}, {url: 'http://two.com', path: 'two'},{url: 'http://three.com', path: 'three'}]
            scope.$digest()

            $(element).find('#locationPath2').trigger('mouseover');
            var sel = getSelectedText();
            expect(sel).toMatch("onetwo");
            $(element).find('#locationPath2').trigger('mouseout');
            sel = getSelectedText();
            expect(sel).not.toBe(null);

        });
    });
});