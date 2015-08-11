/*global angular */
angular.module('voyager.search')
    .controller('RemoveAllFlagsCtrl', function ($scope, $modalInstance, tagService, resultData, $timeout, usSpinnerService, config) {
        'use strict';

        var _loading = false;

        $scope.resultTotalCount = resultData.totalItemCount;

        $scope.overLimit = resultData.totalItemCount > config.bulkLimit;
        if ($scope.overLimit) {
            $scope.error = 'This operation is limited to ' + config.bulkLimit + ' records.  Please refine your search.';
        }

        $scope.removeFlag = function() {
            _loading = true;
            usSpinnerService.spin('task-spinner');
            tagService.removeBulkField('tag_flags').then(function(response){
                _loading = false;
                usSpinnerService.stop('task-spinner');
                if (angular.isUndefined(response.error)) {
                    $scope.successMessage = 'Flags have been removed.';
                    $timeout(function() {
                        $scope.done();
                    }, 2000);
                } else {
                    $scope.error = 'Sorry, please try again later';
                }
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
            $scope.successMessage = false;
        };

        $scope.done = function () {
            $modalInstance.close();
        };
    });
