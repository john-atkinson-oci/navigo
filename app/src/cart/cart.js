/*global angular, $, _, window */

angular.module('cart')
    .controller('CartCtrl', function ($scope, cartService, searchService, clipService, $location, config) {

        'use strict';
        $scope.hasError = false;
        //default drop down values
        $scope.coordinate = '4326';
        $scope.format = 'FileGDB';
        $scope.loading = true;

        $scope.disp = $location.search().disp || 'default';

        $scope.uiText = config.ui.list;

        //leaflet
        angular.extend($scope, {
            defaults: {
                scrollWheelZoom: false
            }
        });

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
            $scope.cartItems = cartService.getItems();
            $scope.cartItemCount = $scope.cartItems.length;
            init();
        };

        $scope.hasItems = function () {
            return cartService.getCount() > 0;
        };

        $scope.goBack = function () {
            window.location.href = searchService.getLastSearch();
        };

        this.errorHandler = function (response) {
            $scope.hasError = true;
            $scope.errorMessage = 'Error: ';
            $.each(response.data.params, function (index, value) {
                if (value.error) {
                    $scope.errorMessage += value.error;
                    return false;
                }
            });
        };

        $scope.doDownload = function () {
            if ($scope.downloadForm.$valid) {
                $scope.hasError = false;
                var itemIds = $.map(cartService.getItems(), function (item) {
                        return item;
                    });
                clipService.doClip($scope.wkt, $scope.coordinate, $scope.format, itemIds, this.errorHandler);
            }
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
                $scope.cartItemExtent = data.bbox;
                $scope.cartItems = data.docs;
                $scope.loading = false;
            }, function(error) {
                console.log(error);
            });

        };

        init();

    });
