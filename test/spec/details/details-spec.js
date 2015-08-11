'use strict';

describe('DetailsCtrl', function () {

    beforeEach(function () {
        module('voyager.security');
        module('voyager.results');
        module(function ($provide) {
            $provide.constant('config', config);
        });
        module('voyager.tagging');
        module('voyager.details');
    });

    var scope, controller, q, detailServiceSpy, authServiceSpy;

    beforeEach(inject(function ($rootScope, $controller, $q, detailService, authService) {
        scope = $rootScope.$new();
        controller= $controller;
        q = $q;
        detailServiceSpy = EZSpy.spyOn(detailService);
        authServiceSpy = EZSpy.spyOn(authService);
    }));

    describe('Load', function () {

        it('should load', function () {
            controller('DetailsCtrl', {$scope: scope});
        });

        it('should call detail service with id', function() {

            detailServiceSpy.lookup.and.returnValue(q.when({}));

            controller('DetailsCtrl', {$scope: scope, $stateParams: {id: 'foo'}, detailService: detailServiceSpy, authService: authServiceSpy});

            expect(detailServiceSpy.lookup.calls.argsFor(0)[0]).toEqual('foo');
        });

        it('should handle document with minimum fields', function() {

            detailServiceSpy.lookup.and.returnValue(q.when({data:{response:{docs:[{id:'foo',name:'bar'}]}}}));

            controller('DetailsCtrl', {$scope: scope, detailService: detailServiceSpy, authService: authServiceSpy});

            expect(detailServiceSpy.lookup).toHaveBeenCalled();
        });
    });
});
