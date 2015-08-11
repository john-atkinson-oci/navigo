/*global angular, $, _*/

angular.module('taskRunner')
    .controller('TaskCtrl', function ($scope, $modalInstance, taskService, usSpinnerService, paramService, localStorageService, task, taskList) {
        "use strict";

        //$scope.task = {};

        $scope.task = task;
        $scope.taskList = taskList;

        $scope.params = [];
        $scope.hasMap = true;
        $scope.showAdvanced = false;

        var _init = function () {
            $scope.hasError = false;
            $scope.errors = {};
            $scope.hasAdvanced = false;
            usSpinnerService.spin('tasks-spinner');
            taskService.lookupTaskType($scope.task.name).then(function (response) {
                $scope.task.display = response[1].data.display;
                //breadcrumbs.options = {'Task': $scope.task.display};
                $scope.task.description = response[1].data.description;

                var params = paramService.initParams(response, $scope.task.reload);
                params.reload = $scope.task.reload;
                $scope.hasAdvanced = params.hasAdvanced;
                $scope.params = params.params;
                $scope.mapParams = params.mapParams;
                $scope.hasMap = params.hasMap;
                usSpinnerService.stop('tasks-spinner');

            }, function(error) {
                $scope.setError('Error occurred loading task');
                usSpinnerService.stop('tasks-spinner');
            });
        };

        function _resetView() {
            $scope.params = [];
            $scope.mapParams = [];
        }

        function _syncParamError(errorParam) {
            var params = $scope.params.concat($scope.mapParams);
            $.each(params, function (index, param) {
                if (param.name === errorParam.name) {
                    param.error = errorParam.error;
                    return;
                }
            });
        }

        function _validate() {
            var isValid = true;
            var params = $scope.params.concat($scope.mapParams);
            $.each(params, function (index, param) {
                if (!angular.isUndefined(param) && param.required && (param.value === '' || angular.isUndefined(param.value))) {
                    if(param.type !== 'VoyagerResults') {
                        //_syncParamError(param);
                        param.error = "Required! Please set a value";
                        isValid = false;
                    }
                }
                if (!angular.isUndefined(param)) {
                    if(param.type === 'Projection') {
                        param.code = param.selected.id;
                        param.value = param.code;
                    }
                }
            });
            return isValid;
        }

        function _errorHandler(response) {
            $scope.isRunning = false;
            $scope.hasError = true;
            $scope.errors = response.data.errors;
            var params = response.data.params;
            $.each(params, function (index, param) {
                if (param.error) {
                    _syncParamError(param);
                }
            });
            usSpinnerService.stop('tasks-spinner');
        }

        _init();

        $scope.cancel = function() {
            $modalInstance.close();
        };

        $scope.selectTask = function(task) {
            if(task.name !== $scope.task.name && task.available === true) {
                task.isNew = true;
                $scope.task = $.extend({},task);  //clone so watcher always fires
                _init();
            }
        };

        $scope.execTask = function () {
            if(_validate()) {
                var params = $scope.params.concat($scope.mapParams);
                var request = {'task': $scope.task.name, 'params': params};
                $scope.executeTask(request).then(function() {
                    $scope.task.isSelected = false; //so the map is reset or it gets in a weird state
                });
            }
        };

        $scope.executeTask = function (request) {
            usSpinnerService.spin('tasks-spinner');
            if(_.isUndefined(request)) {
                request = {'task': $scope.task.name, 'params': paramService.getAllParams()};
            }
            var params = paramService.getStorable();
            localStorageService.add(request.task, params);
            $scope.isRunning = true;
            $scope.hasError = false;
            return taskService.execute(request).then(function (response) {
                $scope.jobId = response.data.id;
                $scope.$broadcast('doTask', response.data.id);
                $scope.isRunning = false;
                usSpinnerService.stop('tasks-spinner');
            }, _errorHandler);
        };
    });
