/*global angular */
angular.module('taskRunner')
    .controller('ModalBrowseCtrl', function($scope, $uibModalInstance, type, path) {
        'use strict';

        $scope.browserType = type;
        $scope.path = path;

        $scope.ok = function (path) {
            $uibModalInstance.close(path);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
});