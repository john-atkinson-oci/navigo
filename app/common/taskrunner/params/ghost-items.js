/*global angular, $, _, Sugar*/
/* this is used on the task tab/page so the items param gets set correctly from the url params, when not displayed */

angular.module('taskRunner')
    .directive('vsGhostItems', function (taskService) {
        'use strict';

        function _setFilterParams($scope) {
            $scope.param.ids = taskService.getItems();
        }

        return {
            template: "<div></div>",
            controller: function ($scope) {
                _setFilterParams($scope);  //sent during task exec
            }
        };
    });