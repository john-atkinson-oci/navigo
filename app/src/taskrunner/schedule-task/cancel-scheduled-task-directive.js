/*global angular */
'use strict';

angular.module('taskRunner')
    .directive('vsCancelScheduledTask', function() {

        return {
            restrict: 'E',
            templateUrl: 'src/taskrunner/schedule-task/cancel-scheduled-task-modal.html',
            link: function(scope) {
                scope.error = false;

                scope.hasError = function() {
                    return scope.error !== false;
                };

                scope.ok = function () {
                    // @TOOO: integrate with back end api
                };

                scope.cancel = function () {
                    scope.$dismiss();
                };
            }
        };

    });
