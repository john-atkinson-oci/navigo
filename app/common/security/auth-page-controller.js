/*global angular, _, ga */
angular.module('voyager.security')
    .controller('AuthPageCtrl', function ($scope, authService, $state, $window) {
        'use strict';
        var error;

        $scope.authPage = true;

        function authSuccess() {
            //TODO abstraction here so it works for more analytics providers
            if(typeof ga === 'function') {
                ga("set", "&uid", $scope.user);
            }
            error = null;
            $scope.error = error;

            $state.go('search');
        }

        function authFail(response) {
            if(response.data) {
                error = response.data.error;
            } else {
                error = "Could not log in";
            }
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

        $scope.methods = authService.getMethods();

        if($scope.methods.external && $scope.methods.all.length === 1) {  // only external enabled, just redirect to it
            $window.location.href = $scope.methods.external[0].url;
        }

        $scope.goExternal = function(method) {
            $window.location.href = method.url;
        };
    });
