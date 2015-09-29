/*global angular */
'use strict';

angular.module('voyager.component')
    .directive('vsWebServiceDialog', function() {

        return {
            restrict: 'E',
            templateUrl: 'src/component/web-service/web-service-dialog.html',
            link: function(scope) {
                scope.error = false;

                scope.hasError = function() {
                    return scope.error !== false;
                };

                scope.ok = function () {
                    // @TODO: integrate with back end api
                };

                scope.cancel = function () {
                    scope.$dismiss();
                };
            }
        };

    });
