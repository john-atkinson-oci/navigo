/*global angular, $, _*/

angular.module('taskRunner')
    .controller('TaskListCtrl', function ($scope, taskService, $stateParams, usSpinnerService, $timeout) {
        'use strict';

        $scope.toggleTasksText = 'Show All';
        $scope.hasUnavailable = false;

        function _loadTasks() {
            taskService.findAllTasks($scope.canReload).then(function(response) {
                $scope.taskList = response;
                usSpinnerService.stop('tasks-spinner');
                $scope.refreshing = false;

                //_.each($scope.taskList, function(item){item.available = false;});  //test all unavailable

                var unavailableTasks = _.filter($scope.taskList, function(task){task.img = 'fa-chevron-circle-right'; return task.available === false;});
                $scope.hasUnavailable = unavailableTasks.length > 0;
                $scope.allUnavailable = unavailableTasks.length === $scope.taskList.length;
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

        $scope.searchParams = '&' + $.param($stateParams,true);

        $scope.getIcon = function(task) {
            return task.available ? 'glyphicon-ok-circle':'glyphicon-ban-circle';
        };

        $scope.getStyle = function(task) {
            var style = 'cursor:' +  (task.available?'pointer;':'not-allowed;');
            style += 'color:' + (task.available?'':'#bbb;');
            return style;
        };

//        security.getPrivileges().then(function() {
//            $scope.canReload = security.hasPermission('manage');
        _loadTasks();
//        });

        $scope.toggleFilter = function() {
            if ($scope.toggleTasksText === 'Show Available') {
                $scope.toggleTasksText = 'Show All';
            } else {
                $scope.toggleTasksText = 'Show Available';
            }
        };

        $scope.filterTask = function(task) {
            var match = true;
            if ($scope.toggleTasksText === 'Show All') {  //means currently showing only available
                match = task.available;
            }
            return match;
        };

        function _moveTo(id) {
            var top = $('#'+id).offset().top;
            $timeout(function () {
                window.scrollTo(0, top);
            }, 600);

        }

        $scope.selectTask = function(task) {

            task.isSelected = !task.isSelected;
            task.img = task.isSelected ? 'fa-chevron-circle-down':'fa-chevron-circle-right';
            //$routeParams.t = task.name;
            if(task.available === true) {
                //$scope.task = {'name':task.name,'isNew':true};
                task.isNew = true;
                $scope.task = $.extend({},task);  //clone so watcher always fires
                $scope.$broadcast('taskSelected', task);  //fire task exec event
                _moveTo(task.name);
            }
        };

    });