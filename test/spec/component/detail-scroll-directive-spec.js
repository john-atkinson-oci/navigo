/*global describe, beforeEach, module, inject, it, expect */

describe('vsDetailScroll:', function () {
    'use strict';

    beforeEach(function () {
        module('voyager.component');
    });

    var scope, element;

    beforeEach(inject(function ($compile, $rootScope) {
        scope = $rootScope.$new();
        element = angular.element('<div id="mock" vs-detail-scroll />');
        $compile(element)(scope);
        element.scope().$apply();
    }));

    describe('Load', function() {
        it('should call initialize function when loading changed', function () {
            expect(scope.initialize).toBeDefined();
            spyOn(scope, 'initialize');
            scope.loading = false;
            scope.$apply();
            expect(scope.initialize).toHaveBeenCalled();
        });
    });

    describe('Events', function(){
        it('should update resize timer', function (){
            var timer = scope.resizeTimer;
            spyOn(scope, 'setStickyContent');
            scope.resize();
            scope.$digest();
            expect(timer !== scope.resizeTimer).toBe(true);
        });
    });

});