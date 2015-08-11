/**
 * Created by Scott on 11/20/2014.
 */
/*global angular, _, ga */
angular.module('voyager.security')
    .controller('AuthCtrl', function ($scope, $modalInstance, authService, $window) {
        'use strict';
        var error;

        function authSuccess() {
            //TODO abstraction here so it works for more analytics providers
            if(typeof ga === 'function') {
                ga("set", "&uid", $scope.user);
            }
            error = null;
            $scope.error = error;
            $modalInstance.close();
        }

        function authFail(response) {
            console.log('authFail');
            error = response.data.error;
            $scope.error = error;
        }

        $scope.handleEnter = function (ev) {
            if (ev.which === 13) {
                $scope.ok();
            }
        };

        $scope.hasError = function () {
            if (error) {
                return true;
            }
            return false;
        };

        $scope.ok = function () {
            if (!_.isEmpty($scope.user) && !_.isEmpty($scope.pass)) {
                error = false;
                authService.doLogin($scope, authSuccess, authFail);
            } else {
                error = true;
                $scope.error = 'Please enter your username and password';
            }
            //console.log($scope.error);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.methods = authService.getMethods();

        if($scope.methods.external && $scope.methods.all.length === 1) {  // only external enabled, just redirect to it
            $window.location.href = $scope.methods.external[0].url;
        }

        $scope.goExternal = function(method) {
            $window.location.href = method.url;
        };
    });
