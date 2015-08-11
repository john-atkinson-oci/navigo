/*global angular, _ */
angular.module('voyager.search')
    .controller('BulkUpdaterCtrl', function ($scope, $modalInstance, tagService, resultData, $timeout, usSpinnerService, config) {
        'use strict';

        var _tags = [];
        var error = false;
        var _loading = false;

        $scope.resultTotalCount = resultData.totalItemCount;

        $scope.overLimit = resultData.totalItemCount > config.bulkLimit;
        if ($scope.overLimit) {
            error = true;
            $scope.error = 'This operation is limited to ' + config.bulkLimit + ' records.  Please refine your search.';
        }

        $scope.select2Options = {
            'tags': _tags
        };

        function _init() {
            tagService.fetchFlags().then(function(tags) {
                $.merge(_tags,tags);
            });
        }

        _init();

        $scope.handleEnter = function (ev) {
            if (ev.which === 13 && !_loading) {
                $scope.saveFlag();
            }
        };

        $scope.hasError = function () {
            return error;
        };

        $scope.saveFlag = function () {
            if (!_.isEmpty($scope.flag)) {
                error = false;
                _loading = true;
                usSpinnerService.spin('task-spinner');
                tagService.saveBulkField($scope.flag, 'tag_flags', resultData.docId).then(function(response){
                    _loading = false;
                    usSpinnerService.stop('task-spinner');
                    if (angular.isUndefined(response.error)) {
                        $scope.successMessage = 'Flag has been saved.';
                        $timeout(function() {
                            $scope.done();
                        }, 2000);
                    } else {
                        error = true;
                        $scope.error = 'Sorry, please try again later';
                    }
                });
            } else {
                error = true;
                $scope.error = 'Enter a label for your featured content';
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
