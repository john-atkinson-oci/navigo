describe('Selected Filter Directive:', function () {
    'use strict';

    beforeEach(function () {
        module('templates');
        module('voyager.component');
        module(function ($provide) {
            $provide.constant('config', config);
        });
    });

    var elementHtmlBase = '<div id="selectedFilters" vs-selected-filter>'+
                        '<div class="overtop" ng-if="filters.length">'+
                            '<div class="hover_flyout">'+
                                '<a href="javascript:;" class="semi icon-arrow flyout_trigger">Filters</a>'+
                                '<div class="flyout">'+
                                    '<div class="arrow"></div>'+
                                    '<div class="flyout_inner">'+
                                        '<ul>'+
                                            '<li><a href="javascript:;" ng-click="clearAllFilter()">Clear All</a></li>'+
                                        '</ul>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                            '<ul class="selected_list">'+
                                '<li ng-repeat="selected in filters"><a href="javascript:;" ng-click="removeFilter(selected)">{{selected.humanized}}<span class="icon-x"></span></a></li>'+
                            '</ul>'+
                        '</div>'+
                    '</div>';

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
        it('should adjust container', function () {
            applyDirective();
            scope.filters = [{'humanized': 'filter one'}, {'humanized': 'filter two'}];
            scope.$digest();
            timeout.flush();
            var html = element.html();
            expect(html).toContain('filter one');
            expect(html).toContain('filter two');
        });
    });
});