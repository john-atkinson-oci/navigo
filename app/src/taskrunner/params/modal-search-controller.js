/*global angular */
angular.module('taskRunner')
    .controller('ModalSearchCtrl', function($scope, $uibModalInstance, queryCriteria) {
        'use strict';

        $scope.queryCriteria = queryCriteria;

        $scope.isModal = true;

        $scope.ok = function (path) {
            $uibModalInstance.close(path);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
});