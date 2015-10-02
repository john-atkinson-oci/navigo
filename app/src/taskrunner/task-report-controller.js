angular.module('taskRunner')
    .controller('TaskReportCtrl', function ($scope, $modalInstance, data) {
        'use strict';

        $scope.data = data.report;
        $scope.hasDetails = data.size === 'lg';

        $scope.cancel = function() {
            $modalInstance.close();
        };

    });