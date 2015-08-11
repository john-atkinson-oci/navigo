'use strict';
/* this is used on the task tab/page so the items param gets set correctly from the url params, when not displayed */

angular.module('taskRunner')
    .directive('vsViewItems', function () {

        return {
            templateUrl: 'src/taskrunner/params/view-items.html',
            controller: function ($scope) {
                $scope.items = $scope.param.response.docs;
            }
        };
    });