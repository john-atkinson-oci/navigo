/*global angular, _*/

angular.module('cart')
    .controller('CartCtrl', function ($scope, cartService, searchService, $location, config, $log) {

        'use strict';
        $scope.hasError = false;
        $scope.loading = true;

        $scope.disp = $location.search().disp || 'default';

        $scope.uiText = config.ui.list;

        var _removeValue = function (array, id) {
            return _.reject(array, function (item) {
                return item.id === id;
            });
        };

        $scope.removeItem = function (id) {
            cartService.remove(id);
            $scope.cartItems = _removeValue($scope.cartItems, id);
            $scope.cartItemCount = cartService.getCount();
        };

        $scope.removeItemByFormat = function(item) {
            cartService.removeByFormat(item.key);
            init();
        };

        $scope.hasItems = function () {
            return cartService.getCount() > 0;
        };

        $scope.clearQueue = function() {
            cartService.clear();
        };

        cartService.addObserver(function(length, items, action){
            if(action === 'clear') {
                $scope.cartItems = [];
                $scope.cartItemCount = 0;
            }
        });

        var init = function () {
            $scope.displayCategory = cartService.getCount() > 100;

            cartService.fetch().then(function(data) {
                cartService.setQueryCount(data.count);
                $scope.cartItemCount = data.count;
                $scope.cartItems = data.docs;
                $scope.loading = false;
            }, function(error) {
                $log.error(error);
            });

        };

        init();

    });
