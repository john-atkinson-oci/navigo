angular.module('taskRunner')
    .controller('TaskDetailsCtrl', function ($scope, $modalInstance, inputItems, params, task) {
        'use strict';

        $scope.task = task;
        $scope.inputItems = inputItems;
        $scope.params = params;

        $scope.cancel = function() {
            $modalInstance.close();
        };

    });