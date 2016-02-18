/*global angular */
angular.module('taskRunner')
    .controller('TaskErrorCtrl', function ($scope, $modalInstance, errorMessage, constraintFormats) {
        'use strict';
        $scope.errorMessage = errorMessage;
        $scope.constraintFormats = constraintFormats;
        $scope.cancel = function () {
            $modalInstance.dismiss('close');
        };
    });
