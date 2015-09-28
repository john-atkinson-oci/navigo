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

                    // savedLocationService.saveLocation(scope.savedLocation, params).then(function(response) {
                    //     if (!angular.isDefined(response.data.error)) {
                    //         scope.$dismiss();
                    //         scope.error = false;
                    //         // scope.$emit('saveLocationSuccess', response.data);
                    //     } else {
                    //         scope.error = response.data.error;
                    //     }
                    // }, function() {
                    //     scope.error = 'please try again later';
                    // });
                };

                scope.cancel = function () {
                    scope.$dismiss();
                };
            }
        };

    });
