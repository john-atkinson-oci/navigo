/*global angular, $, QueryBuilder */

angular.module('taskRunner').
    factory('taskService', function ($http, config, $q) {
        'use strict';

        var _items = [];

        function _buildQuery(isAdmin) {
            var filter = '&fq=available:true';
            if (isAdmin) {
                filter = '';
            }
            return config.root + 'solr/tasks/select?q=*:*' + filter + '&rows=1000&sort=display_sort+asc&wt=json&json.wrf=JSON_CALLBACK';
        }

        return {

            findAllTasks: function (isAdmin) {
                return $http.jsonp(_buildQuery(isAdmin));
            },

            lookupTaskType: function(type) {
                var taskPromise =  $http.get(config.root + 'api/rest/process/task/' + type + '/init.json');
                var taskDisplayPromise = $http.get(config.root + 'api/rest/process/task/' + type + '/display.json?lang=en');
                return $q.all([taskPromise,taskDisplayPromise]);
            },

            lookupTaskDisplay: function(type) {
                return $http.get(config.root + 'api/rest/process/task/' + type + '/display.json?lang=en');
            },

            execute: function (request) {
                return $http({
                    method: 'POST',
                    url: config.root + 'api/rest/process/task/',
                    data: request,
                    headers: {'Content-Type': 'application/json'}
                });
            },

            checkStatus: function (id) {
                return $http.get(config.root + 'api/rest/process/job/' + id + '.json');
            },

            checkProgress: function (id) {
                return $http.get(config.root + 'api/rest/process/job/' + id + '/status.json');
            },

            cancel: function (id) {
                return $http['delete'](config.root + 'api/rest/process/job/' + id + '.json');
            },

            notify: function (id, email) {
                return $http.put(config.root + 'api/rest/process/job/' + id + '/callback.json?email=' + email);
            },

            cancelNotify: function (id, email) {
                return $http['delete'](config.root + 'api/rest/process/job/' + id + '/callback.json?email=' + email);
            },

            getFileUrl: function (id, name) {
                return config.root + 'api/rest/process/job/' + id + '/output/' + name;
            },

            getFileDisplayName: function(name) {
                if (name.indexOf('stdout') > 0) {
                    return 'Processing Output';
                }
                if (name.indexOf('stderr') > 0) {
                    return 'Processing Error Log';
                }
                return name;
            },

            refresh: function (id) {
                return $http.post(config.root + 'api/rest/process/tasks/refresh.json');
            },

            getFileData: function(file) {
                return $http.get(file.downloadUrl + '?mime=application/json');
            },

            setItems: function(items) {
                _items = items;
            },

            getItems: function() {
                return _items;
            },

            getFiles: function (statusResponse) {
                var _self = this;
                var files = [];
                $.each(statusResponse.data.output.children, function (index, file) {
                    if (file.format && file.name.lastIndexOf("_", 0) !== 0) {
                        file.downloadUrl = _self.getFileUrl(statusResponse.data.id, file.name);
                        files.push(file);
                    }
                });
                return files;
            },

            getLogFiles: function (statusResponse) {
                var _self = this;
                var files = [];
                $.each(statusResponse.data.output.children, function (index, file) {
                    if (file.format && file.name.lastIndexOf("_", 0) === 0) {
                        if (file.name.indexOf("stderr") > -1 || file.name.indexOf("stdout") > -1) {
                            file.downloadUrl = _self.getFileUrl(statusResponse.data.id, file.name);
                            file.displayName = _self.getFileDisplayName(file.name);
                            files.push(file);
                        }
                    }
                });
                return files;
            },

            getCopyUrl: function(id) {
                return config.root + 'api/rest/process/job/' + id + '/run.json';
            }

        };

    });
