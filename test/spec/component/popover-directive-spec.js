describe('Popover Directive:', function () {
    'use strict';

    beforeEach(function () {
        module('templates');
        // module('voyager.common'); //auth service module - apparently this is needed to mock the auth service
        module('voyager.component');
        module(function ($provide) {
            $provide.constant('config', config);
        });
    });

    var elementHtmlBase = '<li vs-popover class="hover_flyout max_height">'+
                '<a href="javascript:;" class="icon-arrow subcat_trigger keep_open"></a>'+
                '<a href="javascript:;" class="icon-arrow flyout_trigger"></a>'+
                '<a href="javascript:;" class="icon-arrow not_flyout_trigger"></a><div class="flyout queue_flyout">'+
                '<div class="arrow"></div>'+
                '<div class="flyout_inner">'+
                    '<ul>'+
                        '<li><a href="javascript:;">New task</a></li>'+
                        '<li><a href="javascript:;">Task history</a></li>'+
                        '<li><a href="javascript:;">Clear All</a></li>'+
                    '</ul>'+
                '</div>'+
            '</div>'+
        '</li>';

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
        element = angular.element(elementHtmlBase);
        compiled = $compile(element)(scope);
        $($document.body).append(element);
        element.scope().$apply();
    }

    describe('Functions', function() {

        it('should trigger click', function () {
            applyDirective();
            $(element).find('.flyout_trigger').trigger('click');
        });

        it('should trigger mouseenter', function () {
            applyDirective();
            $(element).find('a.hover_flyout').trigger('mouseenter');
        });

        it('should trigger mouseleave', function () {
            applyDirective();
            $(element).find('.flyout_trigger').trigger('mouseleave');
            // timeout.flush();
            expect($(element).find('.hover_flyout').hasClass('opened')).toBe(false);
        });

        it('should append the element', function () {
            applyDirective();
            expect($(element).find('.hover_flyout')).toBeDefined();
        });

        it('should anchor flyout_trigger popover on click', function () {
            applyDirective();
            $(element).find('a.flyout_trigger').trigger('click');

            var flyout_inner = $(element).find('.flyout_inner');
            expect($(element).hasClass('max_height')).toBe(true);
            expect(flyout_inner).toBeDefined();
            expect($(element).find('.flyout').data('height')).toBeDefined();
        });

        it('should set maxheight on flyout_inner if is subcat_trigger', function () {
            applyDirective();
            $(element).find('a.subcat_trigger').trigger('click');
            expect($(element).hasClass('max_height')).toBe(true);
        });


        it('should remove opened class on click if not keep_open', function () {
            applyDirective();
            $(element).addClass('opened');
            expect($(element).hasClass('opened')).toBe(true);
            $(element).find('a.flyout_trigger').removeClass('keep_open');
            $(element).find('a.flyout_trigger').trigger('click');
            expect($(element).hasClass('opened')).toBe(false);
        });

        it('should remove opened class on click if not keep_open and not flyout_trigger', function () {
            applyDirective();
            $(element).addClass('opened');
            expect($(element).hasClass('opened')).toBe(true);
            $(element).find('a.not_flyout_trigger').removeClass('keep_open');
            $(element).find('a.not_flyout_trigger').trigger('click');
            expect($(element).hasClass('opened')).toBe(false);
        });

    });
});