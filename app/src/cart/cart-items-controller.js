/*global angular */

angular.module('cart')
.controller('CartItemsCtrl', function ($scope, cartService, converter, taskService, usSpinnerService, searchService) {
    'use strict';

    $scope.cartItemCount = cartService.getCount();
    $scope.task = {};
    $scope.jobId = '';

    $scope.lastSearch = searchService.getLastSearch();

    $scope.$on('taskExecuted', function (event, args) {
        $scope.$broadcast('doTask', args);
    });

    $scope.setError = function(val) {
        $scope.errorMessage = val;
        $scope.hasError = true;
    };

    $scope.clearError = function() {
        $scope.errorMessage = '';
        $scope.hasError = false;
    };

});
