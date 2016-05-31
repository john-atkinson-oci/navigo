/*global angular */
angular.module('cart')
    .controller('CartNavCtrl', function (config, $scope, $location, searchService, cartService, authService, usSpinnerService, $uibModal, taskService, $timeout, $state) {
        'use strict';

        function _init() {
            $scope.taskStatusIcon = 'fa fa-cog fa-spin';
            $scope.lastSearch = searchService.getLastSearch();
            var path = $location.path().split('/');
            $scope.page = path[1];

            if ($scope.page === 'history') {
                $scope.showTaskList = false;
            } else {
                $scope.showTaskList = cartService.getCount() > 0;
                _loadTasks();
                $scope.cartItemCount = cartService.getCount();

                cartService.addObserver(function () {
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
            if (angular.isUndefined(task) && $location.path().indexOf('status') <= -1 && $location.path().indexOf('tasks') <= -1 && $location.path().indexOf('task') <= -1 && $location.path().indexOf('tasks') <= -1) {
                return config.defaultTask;
            }
            return task;
        }

        function _loadTasks() {
            taskService.findAllTasks($scope.canReload).then(function (response) {
                $scope.taskList = response;
                $scope.refreshing = false;
                var task = _getTask();
                if (!_.isEmpty(task)) {
                    $timeout(function () {
                        var defaultTask;
                        if (_.isArray($scope.taskList)) {
                            defaultTask = _.find($scope.taskList, {name: task});
                        } else {
                            _.each($scope.taskList, function (category) {
                                if (!defaultTask) {
                                    defaultTask = _.find(category, {name: task});
                                }
                            });
                        }
                        if (defaultTask && defaultTask.available === true) {
                            $scope.selectTask(defaultTask);
                        }
                    });
                }
                usSpinnerService.stop('tasks-spinner');
            });
        }

        $scope.refreshTasks = function () {
            if (!$scope.refreshing) {
                $scope.refreshing = true;
                usSpinnerService.spin('tasks-spinner');
                taskService.refresh().then(function () {
                    _loadTasks();
                });
            }
        };

        $scope.selectTask = function (task) {
            task.isSelected = !task.isSelected;
            if (task.available === true) {
                task.isNew = true;
                var constraintFormats = taskService.getTaskConstraintFormats(task.constraints);
                taskService.validateTaskItems(task.constraints).then(function(severity){
                    if (severity === 0) {
                        task.error = false;
                        task.warning = false;
                        $state.go('task', {task: task});
                    }
                    else if (severity === 1) {
                        task.error = false;
                        task.warning = true;
                        $scope.hasInvalidItems = true;
                        $state.go('task', {task: task});
                    }
                    else if (severity === 2) {
                        taskService.showTaskValidationError(constraintFormats);
                    }
                });

            }
        };

        // Return the status icon for the message type.
        $scope.$on('taskStatusChanged', function (event, args) {
            $scope.loadDefaultTask = false;
            if (args === 'alert-running') {
                $scope.taskStatusIcon = 'fa fa-cog fa-spin';
            } else if (args === 'alert-success') {
                $scope.taskStatusIcon = 'glyphicon glyphicon-ok';
            } else if (args === 'alert-warning') {
                $scope.taskStatusIcon = 'icon-warning';
            } else {
                $scope.taskStatusIcon = 'icon-error';
            }
        });

        _init();

        //function _openTaskModal(task) {
        //    var modalInstance = $modal.open({
        //        templateUrl: 'src/taskrunner/task.html',
        //        size: 'lg',
        //        controller: 'TaskCtrl',
        //        resolve: {
        //            task: function () {
        //                return task;
        //            },
        //            taskList: function () {
        //                return $scope.taskList;
        //            },
        //            extent: function () {
        //                return $scope.cartItemExtent;
        //            }
        //        }
        //    });
        //
        //    modalInstance.result.then(function () {
        //        $location.search('task', null);
        //    }, function () {
        //        //$log.info('Modal dismissed at: ' + new Date());
        //    });
        //}

    });
