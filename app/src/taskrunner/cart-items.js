'use strict';
angular.module('taskRunner')
    .directive('vsCartItems', function (cartItemsQuery, cartService, taskService, taskModalService) {

        return {
            templateUrl: 'src/taskrunner/cart-items.html',
            scope: {
                cartItems: '=',
                invalid: '=',
                displayCategory: '=',
                task: '='
            },
            controller: function ($scope) {

                var _removeValue = function (array, id) {
                    return _.reject(array, function (item) {
                        return item.id === id;
                    });
                };

                $scope.removeItem = function (id) {
                    cartService.remove(id);
                    $scope.invalidTaskItems = _removeValue($scope.invalidTaskItems, id);
                };

                $scope.removeInvalidItems = function (invalidItems) {
                    $.each(invalidItems, function( index, item ) {
                        $scope.removeItem(item.id);
                    });
                };

                $scope.removeItemByFormat = function(item) {
                    if (angular.isDefined(item)){
                        cartService.removeByFormat(item.key);
                        cartService.fetch().then(function(data) {
                            cartService.setQueryCount(data.count);
                            $scope.cartItemCount = data.count;
                            $scope.cartItems = data.docs;
                            $scope.loading = false;
                        });
                    }
                    else {
                        var items = cartService.getItemIds();
                        var query = taskService.getTaskQueryCriteria($scope.task.constraints, false, items);
                        cartItemsQuery.fetchItems(query, items).then(function(data) {
                            cartService.addQuery(query, items);
                            cartService.setQueryCount(data.count);
                            taskModalService.close();
                        });
                    }
                };

            }
        };

    });