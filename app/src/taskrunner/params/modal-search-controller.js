/*global angular */
angular.module('taskRunner')
    .controller('ModalSearchCtrl', function($scope, $modalInstance, queryCriteria) {
        'use strict';

        $scope.queryCriteria = queryCriteria;

        $scope.isModal = true;

        $scope.ok = function (path) {
            $modalInstance.close(path);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
});