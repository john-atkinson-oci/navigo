describe('Cart Items Directive:', function () {
    'use strict';

    var cfg = _.clone(config);

    beforeEach(function () {
        module('templates');
        module('voyager.security');
        module('taskRunner');
        module('voyager.results');
        module('voyager.filters');
        module('cart');
        module('angulartics');
        module('ui.bootstrap');
        //module('voyager.common'); //auth service module - apparently this is needed to mock the auth service
        module(function ($provide) {
            $provide.constant('config', cfg);
        });
    });

    var $scope, template, element, controller;
    beforeEach(inject(function($rootScope, $compile) {
        $scope = $rootScope.$new();
        element = angular.element('<div vs-cart-items></div>');
        template = $compile(element)($scope);
        $scope.$digest();
        controller = element.controller();
        $scope = element.isolateScope();

    }));

    describe('Remove invalid items', function () {

        it('should remove item', inject(function (cartService) {

            var item = {id:'junk', key:'junkkey'};

            cartService.clear();
            cartService.addItem(item);

            $scope.removeItem('junk');

            expect(cartService.getCount()).toBe(0);
            cartService.clear();
        }));

        it('should remove invalid items', inject(function (cartService, taskModalService) {

            var items = [{id:'junk'}];

            cartService.clear();
            cartService.addItems(items);

            spyOn(taskModalService, 'close');

            $scope.removeInvalidItems(items);
            expect(taskModalService.close).toHaveBeenCalled();

            cartService.clear();
        }));


        it('should remove items by format', inject(function (cartService, $q) {

            var items = [{id:'junk', key:'junkkey'}, {id:'junk2', key:'junkkey2'}];
            var deferred = $q.defer();
            spyOn(cartService, 'fetch').and.returnValue(deferred.promise);
            spyOn(cartService, 'getItemIds');

            cartService.clear();
            cartService.setItems(items);

            $scope.removeItemByFormat({id:'junk', key:'junkkey'});
            deferred.resolve();
            expect(cartService.fetch).toHaveBeenCalled();

            $scope.task = {name:'zip_files', constraints: ['format_type:File']};
            $scope.removeItemByFormat();
            expect(cartService.getItemIds).toHaveBeenCalled();

            cartService.clear();
        }));

    });

});