/*global angular, _*/

angular.module('taskRunner')
    .controller('TasksCtrl', function ($scope, taskService, usSpinnerService, authService, $state, taskModalService, translateService) {
        'use strict';

        $scope.toggleTasksText = 'Show All';
        $scope.hasUnavailable = false;
        $scope.hasInvalidItems = false;
        $scope.errorMessage = 'All the items in the cart are invalid formats';
        $scope.constraintFormats = [];

        function _loadTasks() {
            taskService.findAllTasks($scope.canReload).then(function(response) {
                $scope.taskList = response; //.data.response.docs;
                usSpinnerService.stop('tasks-spinner');
                $scope.refreshing = false;

                var unavailableTasks = [];
                var taskCount = 0;
                angular.forEach($scope.taskList, function(tasks) {
                    tasks.warnings = 0;
                    tasks.errors = 0;
                    unavailableTasks = unavailableTasks.concat(_.filter(tasks, function(task){
                        taskService.validateTaskItems(task.constraints).then(function(severity){
                            if (severity === 1) {
                                tasks.warnings += 1;
                            }
                            else if(severity === 2){
                                tasks.errors += 1;
                            }
                            task.severity = severity;
                        });
                        return task.available === false;
                    }));
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

        $scope.showTaskValidationError = function() {
            taskModalService.showTaskValidationError($scope.errorMessage, $scope.constraintFormats);
        };

        $scope.selectTask = function(task) {
            $scope.constraintFormats = [];
            _.each(task.constraints, function(value) {
                value = value.split(':')[1];
                var values = value.split(' ');
                if (values){
                    angular.forEach(values, function(value){
                        value = value.replace('(', '');
                        value = value.replace(')', '');
                        value = translateService.getType(value);
                        $scope.constraintFormats.push(value);
                    });
                }
                else{
                    value = translateService.getType(value);
                    $scope.constraintFormats.push(value);
                }
            });
            taskService.validateTaskItems(task.constraints).then(function(severity){
                if (severity === 0) {
                    task.error = false;
                    task.warning = false;
                    $state.go('task', {task: task});
                }
                else if (severity === 1) {
                    task.error = false;
                    task.warning = true;
                    //task.constraints = $scope.constraintFormats;
                    $scope.hasInvalidItems = true;
                    $state.go('task', {task: task});
                }
                else if (severity === 2) {
                    $scope.showTaskValidationError($scope.errorMessage, $scope.constraintFormats);
                }
            });
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