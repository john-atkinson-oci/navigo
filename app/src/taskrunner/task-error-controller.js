/*global angular */
angular.module('taskRunner')
    .controller('TaskErrorCtrl', function ($scope, $uibModalInstance, errorMessage, constraintFormats) {
        'use strict';
        $scope.errorMessage = errorMessage;
        $scope.constraintFormats = constraintFormats;
        $scope.cancel = function () {
            $uibModalInstance.dismiss('close');
        };
    });
