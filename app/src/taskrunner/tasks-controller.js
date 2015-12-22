/*global angular, _*/

angular.module('taskRunner')

    .controller('TasksCtrl', function ($scope, taskService, usSpinnerService, authService, $state) {
        'use strict';

        $scope.toggleTasksText = 'Show All';
        $scope.hasUnavailable = false;



        function _loadTasks() {
            taskService.findAllTasks($scope.canReload).then(function(response) {
                $scope.taskList = response; //.data.response.docs;
                usSpinnerService.stop('tasks-spinner');
                $scope.refreshing = false;

                var unavailableTasks = [];
                var taskCount = 0;
                angular.forEach($scope.taskList, function(tasks) {
                    unavailableTasks = unavailableTasks.concat(_.filter(tasks, function(task){return task.available === false;}));
                    taskCount += tasks.length;
                });
                $scope.hasUnavailable = unavailableTasks.length > 0;
                $scope.allUnavailable = unavailableTasks.length === taskCount;
                if ($scope.allUnavailable) {
                    $scope.toggleTasksText = 'Show Available'; // will show all tasks, button text is opposite (toggle)
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

        authService.getPrivileges().then(function() {
            $scope.canReload = authService.hasPermission('manage');
            _loadTasks();
        });

        // Currently not used.
        //$scope.toggleFilter = function() {
        //    if ($scope.toggleTasksText === 'Show Available') {
        //        $scope.toggleTasksText = 'Show All';
        //    } else {
        //        $scope.toggleTasksText = 'Show Available';
        //    }
        //};

        //$scope.filterTask = function(task) {
        //    var match = true;
        //    if ($scope.toggleTasksText === 'Show All') {  //means currently showing only available
        //        match = task.available;
        //    }
        //    return match;
        //};

    });