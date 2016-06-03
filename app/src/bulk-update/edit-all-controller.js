/*global angular, _ */
angular.module('voyager.search')
    .controller('EditAllCtrl', function ($scope, $uibModalInstance, tagService, configService, resultTotalCount, $controller, config, converter) {
        'use strict';

        $controller('BaseUpdateCtrl', { $scope: $scope, resultTotalCount: resultTotalCount , $uibModalInstance: $uibModalInstance});

        var _tags = [];

        $scope.select2Options = {
            'multiple': true,
            'simple_tags': true
        };

        if (!_.isEmpty(config.homepage.editValues)) {
            $scope.select2Options.data = converter.toIdTextArray(config.homepage.editValues);
        } else {
            $scope.select2Options.tags = _tags;
        }

        function _init() {

            tagService.fetchTags().then(function(tags) {
                $.merge(_tags,tags);
            });

            _getFieldList();
        }

        _init();

        $scope.validate = function() {
            if (!_.isEmpty($scope.fieldText) && !_.isEmpty($scope.selectedField)) {
                return true;
            } else {
                $scope.error = 'Please select a field and enter a value.';
                return false;
            }
        };

        $scope.doSaveAll = function() {
            tagService.saveBulkField($scope.fieldText, $scope.selectedField).then($scope.handleResponse);
        };

        function _getFieldList() {
            $scope.fieldList = configService.getEditable();
        }

    });
