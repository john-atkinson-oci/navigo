/*global angular, $, QueryBuilder */

angular.module('taskRunner').
    factory('jobService', function ($http, config, $q) {
        'use strict';

        return {

            fetchJobs: function () {
                var jobsPromise = $http.jsonp(config.root + 'solr/jobs/select?q=*:*&sort=queue_time%20desc&wt=json&rows=100&json.wrf=JSON_CALLBACK');
                var displayPromise = $http.jsonp(config.root + 'solr/tasks/select?q=*:*&fl=name,display&wt=json&rows=1000&json.wrf=JSON_CALLBACK');
                return $q.all([jobsPromise,displayPromise]);
            },

            execute: function(job) {
                return $http.post(config.root + 'api/rest/process/job/' + job.id + '/run.json');
            },

            getCopyUrl: function(id) {
                return config.root + 'api/rest/process/job/' + id + '/run.json';
            }
        };

    });
