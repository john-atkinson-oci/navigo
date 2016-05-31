/*global angular */

angular.module('taskRunner')
    .controller('TaskLogCtrl', function ($scope, $uibModalInstance, taskService, usSpinnerService, file, task) {
        'use strict';

        $scope.task = task;

        usSpinnerService.spin('spinner');
        taskService.getFileData(file, true).then(function(response) {
            usSpinnerService.stop('spinner');
            $scope.logFileData = response.data;
        });

        $scope.download = function() {
            window.location.href = file.downloadUrl;
        };

        $scope.cancel = function() {
            $uibModalInstance.close();
        };

    });
