/*global angular */
angular.module('taskRunner')
    .controller('InvalidItemsCtrl', function ($scope, $uibModalInstance, invalidTaskItems) {
        'use strict';
        $scope.invalidTaskItems = invalidTaskItems;
        $scope.cancel = function () {
            $uibModalInstance.dismiss('close');
        };
    });