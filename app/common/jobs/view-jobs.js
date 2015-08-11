/*global angular, $, _, Sugar, console */

angular.module('taskRunner')
    .controller('JobsCtrl', function ($scope, jobService, $stateParams, config, $window, taskService, sugar, usSpinnerService) {
        'use strict';

        $scope.goBack = function() {
            var params = Sugar.retroParams($stateParams);
            $window.location.href = config.root + config.explorePath + '/#/' + params;
        };

        function getIcon(status) {
            switch(status)
            {
                case 'PENDING':
                    return {'icon':'fa-clock-o','color':'black'};
                case 'RUNNING':
                    return {'icon':'fa-cog fa-spin','color':'blue'};
                case 'FAILED':
                    return {'icon':'fa-thumbs-down','color':'red'};
                case 'CANCELED':
                    return {'icon':'fa-chain-broken','color':'black'};
                case 'WARNING':
                    return {'icon':'fa-thumbs-up','color':'orange'};
                default:
                    return {'icon':'fa-thumbs-up','color':'green'};
            }
        }

        jobService.fetchJobs().then(function (response) {
            var jobs = response[0].data.response.docs;
            var jobsDisplay = _.reduce(response[1].data.response.docs, function(o, v){
                o[v.name] = v.display;
                return o;
            }, {});
            $.each(jobs, function (index, job) {
                job.statusIcon = getIcon(job.state);
                if (!angular.isUndefined(job.output_name)) {
                    $.each(job.output_name, function( index, value ) {
                        if(value.indexOf('_') === -1) {
                            job.hasDownload = true;
                        }
                    });
                }
                var displayName = jobsDisplay[job.task];
                if (angular.isUndefined(displayName)) {
                    displayName = _(job.task).chain().humanize().titleize().value();
                }
                job.displayName = displayName;
            });
            $scope.jobs = jobs;
        });

        function _getItems(list) {
            return _.find(list, function(item){ return item.type === 'VoyagerResults'; });
        }

        $scope.viewItems = function(job) {
            var data = JSON.parse(job.json);
            var resultsParam = _getItems(data.params);
            var retro = Sugar.retroParams(resultsParam.query);
            $window.location.href = config.root + config.explorePath + '/#/' + retro;
        };

        function _getFiles(output) {
            var files = sugar.toArray(output);
            return _.filter(files, function(file){ return file.indexOf("_") === -1; });
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
            function(error) {
                console.log(error);
                usSpinnerService.stop('job-spinner');
            });
        };
    });
