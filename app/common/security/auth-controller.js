/*global angular */
angular.module('voyager.security')
    .controller('AuthCtrl', function ($scope, $modalInstance, $controller) {
        'use strict';

        $controller('AuthBaseCtrl', { $scope: $scope });

        var successCallback = $scope.authSuccess;
        $scope.authSuccess = function() {
            successCallback();
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    });
