angular.module('taskRunner')
    .controller('TaskReportCtrl', function ($scope, $uibModalInstance, data) {
        'use strict';

        $scope.data = data.report;
        $scope.hasDetails = data.size === 'lg';

        $scope.cancel = function() {
            $uibModalInstance.close();
        };

    });