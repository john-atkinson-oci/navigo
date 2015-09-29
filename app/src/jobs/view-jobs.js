/*global angular, $, _, Sugar */

angular.module('taskRunner')
    .controller('JobsCtrl', function ($scope, jobService, $stateParams, config, $window, taskService, sugar, usSpinnerService, urlUtil, $location, $modal) {
        'use strict';

        $scope.display = $location.search().disp || 'default';

        $scope.goBack = function() {
            var params = Sugar.retroParams($stateParams);
            $window.location.href = config.root + config.explorePath + '/#/' + params;
        };

        function getIcon(status) {
            switch(status)
            {
                case 'PENDING':
                    return {'icon':'icon-queue_status_waiting','color':'black'};
                case 'RUNNING':
                    return {'icon':'fa fa-cog fa-spin','color':'#337ab7'};
                case 'FAILED':
                    return {'icon':'icon-queue_status_error','color':'red'};
                case 'CANCELED':
                    return {'icon':'icon-queue_status_cancled','color':'black'};
                case 'WARNING':
                    return {'icon':'icon-queue_status_complete','color':'orange'};
                default:
                    return {'icon':'icon-queue_status_complete','color':'green'};
            }
        }

        jobService.fetchJobs().then(function (response) {
            var jobs = response[0].data.response.docs;
            var jobsDisplay = _.indexBy(response[1].data.response.docs, 'name');
            $.each(jobs, function (index, job) {
                job.statusIcon = getIcon(job.state);
                if (!angular.isUndefined(job.output_name)) {
                    $.each(job.output_name, function( index, value ) {
                        if(value.indexOf('_') === -1) {
                            job.hasDownload = true;
                        }
                    });
                }
                var jobDisplay = jobsDisplay[job.task];
                if (angular.isUndefined(jobDisplay)) {
                    job.displayName = _(job.task).chain().humanize().titleize().value();
                } else {
                    job.displayName = jobDisplay.display;
                }
            });
            $scope.jobs = jobs;
            usSpinnerService.stop('job-spinner');
        });

        function _getItems(list) {
            return _.find(list, function(item){ return item.type === 'VoyagerResults'; });
        }

        $scope.viewItems = function(job) {
            var data = JSON.parse(job.json);
            var resultsParam = _getItems(data.params);
            var params = $location.search();

            //bbox is being included twice
            resultsParam.query.fq = _.reject(resultsParam.query.fq, function(param){
                return param.indexOf('bbox:') > -1;
            });

            $window.location = '#/search?disp=' + params.disp + '&' + sugar.toQueryString(resultsParam.query);
        };

        function _getFiles(output) {
            var files = sugar.toArray(output);
            return _.filter(files, function(file){ return file.indexOf('_') === -1; });
        }

        $scope.download = function(job) {
            var files = _getFiles(job.output_name);
            if(files.length === 1) {
                var file = files[0];
                var downloadUrl = taskService.getFileUrl(job.id, file);
                $window.location.href = downloadUrl;
            } else {
                $window.location.href = '#/status/' + job.id;
            }
        };

        $scope.isDone = function(job) {
            return job !== 'PENDING' && job !== 'RUNNING';
        };

        $scope.run = function(job) {
            usSpinnerService.spin('job-spinner');
            jobService.execute(job).then(function(response) {
                var newJobId = response.data.id;
                $window.location.href = '#/status/' + newJobId;
            },
            function() {
                usSpinnerService.stop('job-spinner');
            });
        };

        $scope.schedule = function(job) {
            $scope.currentJobId = job.id;
            $modal.open({
                template: '<div><vs-schedule-task /></div>',
                size: 'md',
                scope: $scope,
                windowClass: 'modal-simple'
            });
        };

    });
