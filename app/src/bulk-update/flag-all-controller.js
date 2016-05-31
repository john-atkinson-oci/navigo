/*global angular, _ */
angular.module('voyager.search')
    .controller('FlagAllCtrl', function ($scope, $uibModalInstance, tagService, resultData, $controller) {
        'use strict';

        $controller('BaseUpdateCtrl', { $scope: $scope, resultTotalCount: resultData.totalItemCount , $uibModalInstance: $uibModalInstance});

        var _tags = [];

        $scope.select2Options = {
            'tags': _tags
        };

        function _init() {
            tagService.fetchFlags().then(function(tags) {
                $.merge(_tags,tags);
            });
        }

        _init();

        $scope.validate = function() {
            if (!_.isEmpty($scope.flag)) {
                return true;
            } else {
                $scope.error = 'Enter a flag.';
                return false;
            }
        };

        $scope.doSaveAll = function() {
            tagService.saveBulkField($scope.flag, 'tag_flags', resultData.docId).then($scope.handleResponse);
        };

    });
