/*global describe, beforeEach, module, inject, it, expect */

describe('vsDetailScroll:', function () {
    'use strict';

    beforeEach(function () {
        module('voyager.component');
    });

    var scope, element, $window, timeout, document;

    beforeEach(inject(function ($compile, $rootScope, $timeout, _$document_, _$window_) {
        timeout = $timeout;
        document = _$document_;
        scope = $rootScope.$new();
        $window = _$window_;
        element = angular.element('<div><div id="mock" vs-detail-scroll><div id="detailTopStickyContent" /><div id="detailTabContentNav" class="sticky" /><div id="detailSecondaryColumn" /><div id="itemDetailContent" /></div></div>');
        $(document.body).append(element);
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

    it('should remove sticky', function (){
        scope.initialize();
        element.ready();
        timeout.flush(351);
        timeout.verifyNoPendingTasks();
        var detailTabContentNav = $($(element).find('#detailTabContentNav')[0]);
        expect(detailTabContentNav.hasClass('sticky')).toBe(true);
        scope.setStickyContent();
    });


});