angular.module('taskRunner')
    .controller('TaskReportCtrl', function ($scope, $modalInstance, data) {
        'use strict';

        $scope.data = data;

        $scope.cancel = function() {
            $modalInstance.close();
        };

    });