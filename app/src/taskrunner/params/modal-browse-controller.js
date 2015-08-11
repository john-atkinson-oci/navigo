/*global angular */
angular.module('taskRunner')
    .controller('ModalBrowseCtrl', function($scope, $modalInstance, type, path) {
        'use strict';

        $scope.browserType = type;
        $scope.path = path;

        $scope.ok = function (path) {
            $modalInstance.close(path);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
});