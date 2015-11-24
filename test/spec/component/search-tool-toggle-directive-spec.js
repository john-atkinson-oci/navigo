describe('Search Tool Toggle Directive:', function () {
    'use strict';

    beforeEach(function () {
        module('templates');
        module('voyager.component');
        module(function ($provide) {
            $provide.constant('config', config);
        });
    });

    var elementHtmlBase = '<select ui-select2="{dropdownAutoWidth: \'true\', minimumResultsForSearch: -1}" name="place.op" id="locationSelect" ng-model="selectedDrawingType" vs-search-tool-toggle ng-change="placeOpChange(selectedDrawingType)"><option ng-repeat="type in drawingTypes" value="{{type}}">{{type}}</option></select>';

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
        element = angular.element(elementHtmlBase);
        compiled = $compile(element)(scope);
        $(document.body).append(element);
        element.scope().$apply();
    }

    describe('Functions', function() {
        it('should update', function () {
            applyDirective();
            scope.$emit('updateSearchDrawingType', false);
            expect(scope.selectedDrawingType).toBe(false);
            scope.$emit('updateSearchDrawingType', true);
            expect(scope.selectedDrawingType).toBe(true);
        });
    });
});