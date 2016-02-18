/*global angular */
angular.module('taskRunner')
    .controller('InvalidItemsCtrl', function ($scope, $modalInstance, invalidTaskItems) {
        'use strict';
        $scope.invalidTaskItems = invalidTaskItems;
        $scope.cancel = function () {
            $modalInstance.dismiss('close');
        };
    });