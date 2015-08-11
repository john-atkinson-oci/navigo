/*global angular, $, _, window, Sugar, document */

angular.module('taskRunner')
    .controller('StatusCtrl', function ($scope, taskService, $stateParams, $timeout, config, leafletData, $location, paramService, $window, usSpinnerService, $analytics) {

        'use strict';

        $scope.messageType = 'alert-info';
        $scope.state = "RUNNING";
        //$scope.id = $routeParams.id;
        $scope.spin = 'fa-cog fa-spin';
        $scope.allowNotify = false;
        $scope.email = "";
        $scope.emailButtonText = "Notify Me When Done";
        $scope.isRunning = true;
        $scope.hasItems = false;
        $scope.isSuccess = false;
        $scope.downloadUrl = '';
        $scope.messages = [];
        $scope.isDetailsOpen = true;
        $scope.statusMessage = "";
        $scope.isDetailsCollapsed = true;
        $scope.showLog = true;
        $scope.logFiles = [];
        $scope.showFile = false;

        //var info = "This task as well as a list of your recent tasks can be found under the Home > Processing > History page should you need to access the download of the log after this session.";
        var info = '';

        var _self = this;
        var attempts = 0;
        var mapSet = false;
        var timer;
        var canNotify = true;

        var done = function (messageType) {
            attempts = 0;
            $scope.spin = '';
            $scope.messageType = messageType;
            $scope.allowNotify = false;
            $scope.isRunning = false;
        };

        this.statusError = function (data) {
            done("alert-danger");
            $scope.messages.push({'message': data.error, 'trace': data.error});
            $scope.state = "FAILED";
        };

        this.startCheckStatus = function (response) {
            $scope.copyUrl = taskService.getCopyUrl($scope.id);
            //$scope.task = response.data.task;
            taskService.lookupTaskDisplay(response.data.task).then(function(res) {
                $scope.type = res.data.display;

                if(!_.isUndefined(response.data.params)) {
                    var readOnlyParams = paramService.initReadOnly(response, res.data);

                    $scope.params = readOnlyParams.params;
                    $scope.inputItems = readOnlyParams.inputItems;
                    $scope.hasMap = readOnlyParams.hasMap;
                }

                updateStatusCallback(response.data.id);
            });
            //var wkt = data.params[0].wkt;
            //$scope.$broadcast("receivedStatus", wkt);
        };

        function _showFailureInfo(data) {
            done("alert-danger");
            if(data.state === "FAILED") {
                if(!angular.isUndefined(data.status)) {
                    $scope.errorMessage = data.status.text + ' for ' +  $scope.type + ' Task ' + data.taskId;
                } else {
                    $scope.errorMessage = $scope.type + ' Task ' + data.taskId + ' ' + data.state;
                }
                $scope.hasError = true;
                $scope.statusMessage = "Could not be Completed";
                $scope.statusDetail = "Unfortunately, your task could not be completed. A link to a complete log file will show you the errors that occurred. " + info;
            } else {
                $scope.statusMessage = "was Cancelled";
            }

            taskService.checkStatus($scope.id).then(function(statusResponse) {
                    $scope.messages = statusResponse.data.errors;
                    $scope.files = taskService.getFiles(statusResponse);
                    $scope.logFiles = taskService.getLogFiles(statusResponse);
                    $scope.warnings = statusResponse.data.warnings;
                    if (!angular.isUndefined($scope.warnings) && $scope.warnings.length > 0) {
                        $scope.hasWarning = true;
                    }
                },
                _self.statusError);

            $analytics.eventTrack('process', {
                category: $scope.type , label: data.state  // jshint ignore:line
            });
        }

        function _showActivityInfo(data) {
            $scope.statusMessage = " is " + _.str.classify(data.state);
            if (!_.isUndefined(data.status)) {
                $scope.progressMessage = data.status.text;
                $scope.hasProgressMessage = true;
            }
            if (!_.isUndefined(data.progress)) {
                $scope.progress = data.progress;
            }
            $scope.messageType = "alert-info";
        }

        function _showSuccessInfo(data, statusResponse) {
            $scope.files = taskService.getFiles(statusResponse);
            $scope.logFiles = taskService.getLogFiles(statusResponse);
            $scope.statusMessage = "Was Completed";
            if(data.state === "WARNING") {
                $scope.statusMessage += ", but With Warnings";
                $scope.statusDetail = "To view the error messages for this deliver, please review the log files. ";
            } else {
                $scope.statusMessage += " Successfully!";
                $scope.statusDetail = "";
            }

            if($scope.files.length > 0) {
                $scope.statusDetail = "You can now download your data by clicking the link below. " + $scope.statusDetail;
            }
            $scope.statusDetail += info;

            done("alert-success");

            $analytics.eventTrack('process', {
                category: $scope.type, label: data.state  // jshint ignore:line
            });
        }

        this.updateStatus = function (response) {
            var data = response.data;
            $scope.hasItems = true;
            $scope.state = _.str.classify(data.state);

            if (data.state === "FAILED" || data.state === "CANCELED") {
                _showFailureInfo(data);
            } else if (data.state === "RUNNING" || data.state === "PENDING") {
                _showActivityInfo(data);
                attempts++;
                if (attempts > 5 && $scope.allowNotify === false && config.enableEmail === true && canNotify === true) {
                    $scope.allowNotify = true;
                }
                timer = $timeout(function () {
                    updateStatusCallback(data.taskId);
                }, 1000);
            } else {  //success
                $scope.isSuccess = true;
                taskService.checkStatus($scope.id).then(function(statusResponse) {
                    $scope.warnings = statusResponse.data.warnings;
                    if (!angular.isUndefined($scope.warnings) && $scope.warnings.length > 0) {
                        $scope.hasWarnings = true;
                    }
                    _showSuccessInfo(data, statusResponse);
                    $scope.files = taskService.getFiles(statusResponse);
                }, _self.statusError);
            }
        };

        var updateStatusCallback = function (id) {
            //console.log($scope.id + " " + id);
            if(_.isUndefined(id)) {
                id = $scope.id;
            }
            if ($scope.id === id) {
                //taskService.checkStatus(id).then(_self.updateStatus);
                taskService.checkProgress(id).then(_self.updateStatus);
            }
        };

        $scope.showDetails = function() {
            $scope.isDetailsCollapsed = !$scope.isDetailsCollapsed;
            if(!$scope.isDetailsCollapsed) {
                leafletData.getMap("read-only-map").then(function (map) {
                    var width = $('#showDetailsContainer').width()/2;
                    var height = width/3*2;
                    if($(map.getContainer()).height() === 0) {
                        $(map.getContainer()).css('height',height);
                        $timeout(function () {  //workaround for leaflet bug:  https://github.com/Leaflet/Leaflet/issues/2021
                            map.invalidateSize();  //workaround when initially hidden
                            map.fitBounds(map.moveToLater);  //workaround when can't fit when hidden
                            map.moveToLater = null;
                        }, 200);
                    }

                });
            }
        };

        function _reset(isRunning) {
            $scope.params = [];  //clear params so tab resets (this should destroy map directive and unresolve the map)
            $scope.inputItems = [];
            $scope.files = [];
            $scope.statusDetail = '';
            $scope.progressMessage = '';
            $scope.isRunning = isRunning;
            $scope.hasProgressMessage = false;
            $scope.hasProgressMessage = "";
            $scope.statusMessage = "is Initializing";
            $scope.progress = [];
            $scope.hasError = false;
            $scope.hasWarning = false;
            $scope.spin = '';
            $scope.showFile = false;
            $scope.messages = [];
            $scope.logFiles = [];
            $scope.warnings = [];
            if(isRunning) {
                $scope.spin = 'fa-cog fa-spin';
            }
        }

        $scope.$on('doTask', function (event, args) {
            canNotify = true;
            if (timer) {
                $timeout.cancel(timer);
            }
            $scope.id = args;
            _reset(true);
            taskService.checkStatus($scope.id).then(_self.startCheckStatus, _self.statusError);
        });

        $scope.$on('tabSelected', function (event, args) {
            if (timer && args.tab !== 2) {  //tabbed away
                $timeout.cancel(timer);
                leafletData.unresolveMap("read-only-map");
                //leafletData.clear();  //workaround for bug
            }
        });

        if($location.path().indexOf("status") > -1) {  //standalone
            $scope.id = $stateParams.id;
            taskService.checkStatus($scope.id).then(_self.startCheckStatus, _self.statusError);
            $scope.isStandalone = true;
        }

        $scope.hasMessage = function () {
            return $scope.messages && $scope.messages.length > 0;
        };

        $scope.emailClick = function () {
            if ($scope.emailButtonText === "Cancel Notify") {
                taskService.cancelNotify($scope.id, $scope.email);
                $scope.emailButtonText = "Notify Me When Done";
            } else {
                taskService.notify($scope.id, $scope.email);
                $scope.emailButtonText = "Cancel Notify";
            }
        };

        $scope.cancelClick = function () {
            usSpinnerService.spin('status-spinner');
            if (timer) {
                $timeout.cancel(timer);
            }
            _reset(false);
            $scope.statusMessage = "was Cancelled";
            taskService.cancel($scope.id).then(function() {
                usSpinnerService.stop('status-spinner');
                //TODO this is slow to update the status so just forcing status to cancelled above
                //taskService.checkProgress($scope.id).then(_self.updateStatus);
            }, function(error) {
                //this errors out but seems to work
                usSpinnerService.stop('status-spinner');
                //TODO this is slow to update the status so just forcing status to cancelled above
                //taskService.checkProgress($scope.id).then(_self.updateStatus);
            });
        };

        $scope.hideEmail = function () {
            $scope.allowNotify = false;
            canNotify = false;
        };

        $scope.$on("$destroy", function() {
            //console.log("destroy!");
            if (timer) {
                $timeout.cancel(timer);
            }
        });

        $scope.getData = function(file) {
            taskService.getFileData(file).then(function(response) {
                $scope.showFile = true;
                $scope.logFileData = response.data;
            });
        };

        function _getParams(inputItems) {
            var params = '';
            if (inputItems.query) {
                params = $.param(inputItems.query, true);
            } else {
                params = 'id=' + inputItems.ids.join('&id=');
            }
            return params;
        }

        $scope.rerun = function() {
            if(angular.isDefined($scope.tabs)) {
                $scope.task.reload = true;
                $scope.selectTask($scope.task);
            } else {
                var params = _getParams($scope.inputItems[0]); //this is an array so it doesn't get rendered if empty (could use ng-if instead)
                $window.location.href = '#/cart?' + params + '&rerun=' + $stateParams.id;
            }
        };

        $scope.showUrl = function() {
            $scope.showCopyUrl = true;
            $timeout(function() {
                document.getElementById('copy-url').select();
            }, 0);
        };

    });
