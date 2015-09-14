/*global describe, beforeEach, module, it, inject, expect, angular */

describe('vsSearchMap:', function () {
    'use strict';

    beforeEach(function () {
        module('templates');
        module('voyager.search');
        module(function ($provide) {
            $provide.constant('config', config);
        });
    });

    var scope, element, controller, compiled;

    beforeEach(inject(function ($compile, $rootScope) {
        scope = $rootScope.$new();
        element = angular.element('<div control="true" vs-search-map>');
        compiled = $compile(element)($rootScope);
        element.scope().$apply();
        controller = element.controller(scope);
    }));

    describe('Map Size Control', function() {
        it('should add map size control', function () {
            var numberOfControl = scope.controls.custom.length;
            scope.addMapSizeToggleControl();
            expect(scope.controls.custom.length).toBe(numberOfControl + 1);
        });

        it('should open map size drop down', function (){
            expect(scope.toggleMapSizeDropDown).toBeDefined();
            spyOn(scope, 'toggleMapSizeDropDown').and.callThrough();

            element.find('.map-size-drop-down .flyout-trigger').on('click', function(){
                scope.toggleMapSizeDropDown();
                scope.$apply();
            }).triggerHandler('click');

            expect(scope.toggleMapSizeDropDown).toHaveBeenCalled();
        });
    });

});