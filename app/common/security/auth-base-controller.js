/*global angular, _, ga */
angular.module('voyager.security')
    .controller('AuthBaseCtrl', function ($scope, authService, $window, config, localStorageService) {
        'use strict';
        var error;

        $scope.canRemember = config.rememberMe;
        $scope.hideDefault = localStorageService.get('default-cred') === 'true';

        $scope.setDefaultCred = function () {
            $scope.user = 'admin';
            $scope.pass = 'admin';
        };

        $scope.removeDefault = function() {
            localStorageService.add('default-cred','true');
            $scope.hideDefault = true;
        };

        $scope.authSuccess = function() {
            //TODO abstraction here so it works for more analytics providers
            if(typeof ga === 'function') {
                ga('set', '&uid', $scope.user);
            }
            error = null;
            $scope.error = error;
        };

        function authFail(response) {
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
                authService.doLogin($scope, $scope.authSuccess, authFail);
            } else {
                error = true;
                $scope.error = 'Please enter your username and password';
            }
        };

        $scope.methods = authService.getMethods();

        if($scope.methods.external && $scope.methods.all.length === 1) {  // only external enabled, just redirect to it
            $window.location.href = $scope.methods.external[0].url;
        }

        $scope.goExternal = function(method) {
            $window.location.href = method.url;
        };
    });
