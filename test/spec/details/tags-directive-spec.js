describe('Preview Directive:', function () {
    'use strict';

    beforeEach(function () {
        module('templates');
        // module('voyager.common'); //auth service module - apparently this is needed to mock the auth service
        module('voyager.details');
        module('voyager.tagging');
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

        httpMock.expectGET(new RegExp('auth')).respond({}); // auth call

        scope.select2Options = {
            'multiple': true,
            'simple_tags': true,
            'tags': ['tag1']
        };

        element = angular.element('<input id="labels" type="hidden" ui-select2="select2Options" ng-model="labels" vg-tags>');
        compiled = $compile(element)(scope);
        $(document.body).append(element);
        element.scope().$apply();
    }

    describe('Functions', function() {
        it('should render', function () {
            scope.doc = {id:'id'};
            scope.labels = ['label'];

            httpMock.expectGET().respond({});
            httpMock.expectPOST().respond({});
            httpMock.expectJSONP().respond({});

            applyDirective();

            timeout.flush();

            $('#labels').trigger('choice-selected');

            var location = $window.location.href;

            expect(location).toContain('fq=tag_tags');
        });

    });


});