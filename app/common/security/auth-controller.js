/*global angular */
angular.module('voyager.security')
    .controller('AuthCtrl', function ($scope, $uibModalInstance, $controller) {
        'use strict';

        $controller('AuthBaseCtrl', { $scope: $scope });

        var successCallback = $scope.authSuccess;
        $scope.authSuccess = function() {
            successCallback();
            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    });
