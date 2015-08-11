/*global angular, $, _, Sugar, alert */

angular.module('taskRunner')
    .controller('TaskRunnerCtrl', function ($scope, searchService, $stateParams, usSpinnerService, taskService, leafletData, paramService, localStorageService, $location) {
        'use strict';

        var tabIndex = 0;
        var error = null;

        $scope.task = {};
        $scope.jobId = '';

        $scope.tabs = [
            {title:"List", contentUrl:"src/cart/cart-items.html", index:0},
            {title:"Run Task", contentUrl:"common/taskrunner/task-list.html", index:1},
            {title:"Task Status", contentUrl:"common/taskrunner/status.html", index:2, disabled:true}
        ];

        $scope.lastSearch = searchService.getLastSearch();

        $scope.tabSelected = function(index) {
            if($scope.tabs[index].disabled === true && $scope.tabs[index].active === false) {
                return;
            }
            if(index === 0) {
                //$scope.tabs[1].disabled = true;
                $scope.tabs[2].disabled = true;
                //$scope.tabs[3].disabled = true;
            }
            if (index !== tabIndex) {
                tabIndex = index;
                $scope.tabs[index].disabled = false;
                var args = {'tab':index, 'error': error};
                $scope.$broadcast('tabSelected', args);
            }
        };

        $scope.switchTab = function(index) {
            $scope.tabs[index].active = true;
        };

        $scope.$watch('tabs', function(newVal, oldVal) {
            var newIndex = $scope.tabs.filter(function(tab){
                return tab.active;
            })[0];
            if(!_.isUndefined(newIndex) && newIndex.index !== tabIndex) {
                $scope.tabSelected(newIndex.index);
            }
        }, true);

//        $scope.selectTask = function(task) {
//            //$routeParams.t = task.name;
//            if(task.available === true) {
//                //$scope.task = {'name':task.name,'isNew':true};
//                task.isNew = true;
//                $scope.task = $.extend({},task);  //clone so watcher always fires
//                $scope.tabs[1].active = true;
//                var results = searchService.getResults();
//                $scope.$emit('searchResultsComplete', results);  //fire search results complete
//            }
//        };

        $scope.$on('taskExecuted', function (event, args) {
            $scope.$broadcast('doTask', args);
        });

        function _errorHandler(response) {
            error = response;
            $scope.tabs[1].active = true;
            usSpinnerService.stop('task-spinner');
            $scope.isRunning = false;
        }

        function _resetWizard() {
            error = null;
            $scope.errorMessage = '';
            $scope.hasError = false;
            leafletData.unresolveMap("clip-map");
            leafletData.unresolveMap("view-map");
            leafletData.unresolveMap("read-only-map");
        }

        $scope.executeTask = function (request) {
            usSpinnerService.spin('task-spinner');
            if(_.isUndefined(request)) {
                request = {'task': $scope.task.name, 'params': paramService.getAllParams()};
            }
            var params = paramService.getStorable();
            localStorageService.add(request.task, params);
            $scope.isRunning = true;
            $scope.hasError = false;
            return taskService.execute(request).then(function (response) {
                _resetWizard();

                $scope.jobId = response.data.id;
                $scope.tabs[2].active = true;
                $scope.$broadcast('doTask', response.data.id);
                $scope.isRunning = false;
                usSpinnerService.stop('task-spinner');
            }, _errorHandler);
        };

        $scope.setError = function(val) {
            $scope.errorMessage = val;
            $scope.hasError = true;
        };

        $scope.clearError = function() {
            $scope.errorMessage = '';
            $scope.hasError = false;
        };

        function _init() {
            if(angular.isDefined($stateParams.rerun)) {
                taskService.checkStatus($stateParams.rerun).then(function(statusResponse) {
                    taskService.lookupTaskDisplay(statusResponse.data.task).then(function(response) {
                        localStorageService.add(statusResponse.data.task, null);
                        var params = paramService.initParams([statusResponse,response]);
                        localStorageService.add(statusResponse.data.task, params);
                        $location.search('rerun',null); //remove rerun param from url
                        var task = response.data;
                        task.available = true;
                        task.reload = true;
                        $scope.selectTask(task);
                    });
                }, function(error) {
                    alert('Failed to reload Task');
                });
            }
        }

        _init();
    });