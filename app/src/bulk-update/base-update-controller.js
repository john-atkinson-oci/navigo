'use strict';
angular.module('voyager.search')
    .controller('BaseUpdateCtrl', function ($scope, $modalInstance, tagService, resultTotalCount, $timeout, usSpinnerService, config) {

        var _loading = false;

        $scope.hasError = function () {
            return angular.isDefined($scope.error);
        };

        $scope.resultTotalCount = resultTotalCount;

        $scope.overLimit = resultTotalCount > config.bulkLimit;
        if ($scope.overLimit) {
            $scope.error = 'This operation is limited to ' + config.bulkLimit + ' records.  Please refine your search.';
        }

        $scope.validate = function() {return true;}; // overrideable

        $scope.save = function () {
            if ($scope.validate()) {  // pseudo override
                delete $scope.error;
                _loading = true;
                usSpinnerService.spin('task-spinner');
                $scope.doSaveAll(); // pseudo override
            }
        };

        $scope.handleEnter = function (ev) {
            if (ev.which === 13 && !_loading) {
                $scope.save();
            }
        };

        $scope.handleResponse = function(response) {
            _loading = false;
            usSpinnerService.stop('task-spinner');
            if (angular.isUndefined(response.error)) {
                $scope.successMessage = response.documents + ' items were updated.';
                $timeout(function () {
                    $scope.done();
                }, 2000);
            } else {
                $scope.error = 'Sorry, please try again later';
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
            $scope.successMessage = false;
        };

        $scope.done = function () {
            $modalInstance.close();
        };

    });
