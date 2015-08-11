/*global angular, _ */
angular.module('voyager.search')
    .controller('EditPresentationCtrl', function ($scope, $modalInstance, tagService, configService, resultTotalCount, usSpinnerService, config) {
        'use strict';

        var _tags = [];
        var error = false;

        $scope.resultTotalCount = resultTotalCount;

        $scope.overLimit = resultTotalCount > config.bulkLimit;
        if ($scope.overLimit) {
            $scope.error = 'This operation is limited to ' + config.bulkLimit + ' records.  Please refine your search.';
        }

        $scope.select2Options = {
            'multiple': true,
            'simple_tags': true,
            'tags': _tags
        };

        function _init() {

            tagService.fetchTags().then(function(tags) {
                $.merge(_tags,tags);
            });

            _getFieldList();
        }

        _init();

        $scope.hasError = function () {
            return (error);
        };

        $scope.save = function () {
            if (!_.isEmpty($scope.fieldText) && !_.isEmpty($scope.selectedField)) {
                error = false;
                $scope.error = false;
                usSpinnerService.spin('task-spinner');

                tagService.saveBulkField($scope.fieldText, $scope.selectedField).then(function(response){
                    usSpinnerService.stop('task-spinner');
                    if (angular.isUndefined(response.error)) {
                        $scope.success = true;
                        $scope.successMessage = response.documents + ' Items were edited.';
                    }
                    else {
                        error = true;
                        $scope.success = false;
                        $scope.error = 'Sorry, please try again later.';
                    }
                });
            } else {
                error = true;
                $scope.success = false;
                $scope.error = 'Please select a field and enter a tag.';
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.done = function () {
            $modalInstance.close();
        };

        function _getFieldList() {
            $scope.fieldList = configService.getEditable();
        }

    });
