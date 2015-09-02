/*global angular, _ */

angular.module('voyager.component')
    .controller('ExportResultsCtrl', function($scope, $modalInstance, usSpinnerService) {
        'use strict';

        $scope.error = false;

        $scope.hasError = function () {
            return $scope.error !== false;
        };

        $scope.save = function () {
            if (!_.isEmpty($scope.CSVFileName)) {
                $scope.error = false;
                usSpinnerService.spin('task-spinner');

                // @TODO: integrate with back end api to export data
                // tagService.saveBulkField($scope.CSVFileName).then(function(response){
                //     usSpinnerService.stop('task-spinner');
                //     if (angular.isUndefined(response.error)) {
                //         $scope.success = true;
                //     }
                //     else {
                //         $scope.success = false;
                //         $scope.error = 'Sorry, please try again later.';
                //     }
                // });
            } else {
                $scope.success = false;
                $scope.error = 'Please enter a file name';
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    });
