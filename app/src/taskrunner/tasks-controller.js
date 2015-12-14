/*global angular, $, _*/

angular.module('taskRunner')

    .controller('TasksCtrl', function ($scope, taskService, usSpinnerService, authService, $state) {
        'use strict';

        $scope.toggleTasksText = "Show All";
        $scope.hasUnavailable = false;



        function _loadTasks() {
            taskService.findAllTasks($scope.canReload).then(function(response) {
                $scope.taskList = response; //.data.response.docs;
                usSpinnerService.stop('tasks-spinner');
                $scope.refreshing = false;

                //_.each($scope.taskList, function(item){item.available = false;});  //test all unavailable

                var unavailableTasks = _.filter($scope.taskList, function(task){return task.available === false;});
                $scope.hasUnavailable = unavailableTasks.length > 0;
                $scope.allUnavailable = unavailableTasks.length === $scope.taskList.length;
                if ($scope.allUnavailable) {
                    $scope.toggleTasksText = "Show Available"; // will show all tasks, button text is opposite (toggle)
                }
            });
        }

        $scope.refreshTasks = function() {
            $scope.refreshing = true;
            usSpinnerService.spin('tasks-spinner');
            taskService.refresh().then(function() {
                _loadTasks();
            });
        };

        $scope.selectTask = function(task) {
            $state.go('task', {task: task});
        };

        //$scope.searchParams = '&' + $.param($routeParams,true);

        $scope.getIcon = function(task) {
            return task.available ? 'glyphicon-ok-circle':'glyphicon-ban-circle';
        };

        $scope.getStyle = function(task) {
            var style = 'cursor:' +  (task.available?'pointer;':'not-allowed;');
            style += 'color:' + (task.available?'':'#bbb;');
            return style;
        };

        authService.getPrivileges().then(function() {
            $scope.canReload = authService.hasPermission('manage');
            _loadTasks();
        });

        $scope.toggleFilter = function() {
            if ($scope.toggleTasksText === "Show Available") {
                $scope.toggleTasksText = "Show All";
            } else {
                $scope.toggleTasksText = "Show Available";
            }
        };

        $scope.filterTask = function(task) {
            var match = true;
            if ($scope.toggleTasksText === "Show All") {  //means currently showing only available
                match = task.available;
            }
            return match;
        };

    });