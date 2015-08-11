angular.module('taskRunner')
    .directive('vsIndexBrowser', function (taskService) {
        'use strict';

        function _setFilterParams($scope) {
            $scope.param.ids = taskService.getItems();
        }

        return {
            template: '<div></div>',
            controller: function ($scope) {
                _setFilterParams($scope);  //sent during task exec
            }
        };
    });