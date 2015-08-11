/*global angular */
angular.module('cart')
    .controller('CartNavCtrl', function (config, $scope, $location, searchService, cartService, authService, usSpinnerService, $modal, taskService, $timeout) {
        'use strict';

        function _init() {
            $scope.lastSearch = searchService.getLastSearch();
            var path = $location.path().split('/');
            $scope.page = path[1];

            if ($scope.page === 'history') {
                $scope.showTaskList = false;
            } else {
                $scope.showTaskList = cartService.getCount() > 0;
                _loadTasks();

                cartService.addObserver(function(){
                    $scope.cartItemCount = cartService.getCount();
                    $scope.showTaskList = $scope.cartItemCount > 0;
                });
                _setPermissions();
                authService.addObserver(_setPermissions);
            }
            $scope.uiText = config.ui.list;
        }

        function _setPermissions() {
            $scope.canReload = authService.hasPermission('manage');
        }

        function _getTask() {
            var task = $location.search().task;
            if (angular.isUndefined(task)) {
                return config.defaultTask;
            }
            return task;
        }

        function _loadTasks() {
            taskService.findAllTasks($scope.canReload).then(function(response) {
                $scope.taskList = response;
                $scope.refreshing = false;
                var task = _getTask();
                if(!_.isEmpty(task)) {
                    $timeout(function() {
                        var defaultTask = _.find($scope.taskList, {name:task});
                        if(defaultTask && defaultTask.available === true) {
                            $scope.selectTask(defaultTask);
                        }
                    });
                }
                usSpinnerService.stop('tasks-spinner');
            });
        }

        $scope.refreshTasks = function() {
            if (!$scope.refreshing) {
                $scope.refreshing = true;
                usSpinnerService.spin('tasks-spinner');
                taskService.refresh().then(function() {
                    _loadTasks();
                });
            }
        };

        $scope.selectTask = function(task) {
            task.isSelected = !task.isSelected;
            if(task.available === true) {
                task.isNew = true;
                _openTaskModal(task);
            }
        };

        function _openTaskModal(task) {
            var modalInstance = $modal.open({
                    templateUrl: 'src/taskrunner/task.html',
                    size: 'lg',
                    controller: 'TaskCtrl',
                    resolve: {
                        task: function() {
                            return task;
                        },
                        taskList: function() {
                            return $scope.taskList;
                        },
                        extent: function() {
                            return $scope.cartItemExtent;
                        }
                    }
                });

            modalInstance.result.then(function () {
                $location.search('task', null);
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        }

        _init();

    });
