/*global describe, beforeEach, module, it, inject, expect*/
'use strict';

describe('Load App', function () {

    beforeEach(function () {
        module(function ($provide) {
            $provide.constant('config', {});
        });

        module('portalApp');
    });

    var scope;

    beforeEach(inject(function ($rootScope) {
        scope = $rootScope.$new();
    }));

    it('should load', function () {
        expect(true).toBeTruthy();
    });
});
