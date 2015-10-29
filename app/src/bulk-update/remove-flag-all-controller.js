/*global angular */
angular.module('voyager.search')
    .controller('RemoveAllFlagsCtrl', function ($scope, $modalInstance, tagService, resultData, $timeout, usSpinnerService, config, $controller) {
        'use strict';

        $controller('BaseUpdateCtrl', { $scope: $scope, resultTotalCount: resultData.totalItemCount , $modalInstance: $modalInstance});

        $scope.doSaveAll = function() {
            tagService.removeBulkField('tag_flags').then($scope.handleResponse);
        };

    });
