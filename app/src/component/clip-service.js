/*global angular, $, alert */

angular.module('clipFactory', []).
    factory('clipService', function ($http, config) {
        'use strict';

        //TODO - controller should handle this
        var successCallback = function (response) {
            window.location.href = '#/status/' + response.data.id;
        };

        var defaultErrorCallback = function (response) {
            if (response.error) {
                alert(response.error);
            } else {
                alert('failed');
            }
        };

        var buildRequest = function (geometry, projection, format, items) {

            var data = 'clip_geometry=' + geometry;
            data += '&output_projection=' + projection;
            data += '&output_format=' + format;

            $.each(items, function (index, value) {
                data += '&input_items.id=' + value;
            });
            return data;
        };

        return {
            doClip: function (geometry, projection, format, items, errorHandler) {

                var request = buildRequest(geometry, projection, format, items);

                $http({
                    method: 'POST',
                    url: config.root + 'api/rest/process/task/clip_data.json',
                    data: request,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).then(successCallback, errorHandler);

            },

            checkStatus: function (id, callback, errorcallback) {
                var errorHandler = defaultErrorCallback;
                if (errorcallback) {
                    errorHandler = errorcallback;
                }
                $http.get(config.root + 'api/rest/process/job/' + id + '.json').success(callback).error(errorHandler);
            },

            cancel: function (id) {
                $http['delete'](config.root + 'api/rest/process/job/' + id + '.json').success(function () {
                }).error(defaultErrorCallback);
            },

            notify: function (id, email) {
                $http.put(config.root + 'api/rest/process/job/' + id + '/callback.json?email=' + email).success(function () {
                }).error(defaultErrorCallback);
            },

            cancelNotify: function (id, email) {
                $http['delete'](config.root + 'api/rest/process/job/' + id + '/callback.json?email=' + email).success(function () {
                }).error(defaultErrorCallback);
            },

            getFileUrl: function (id, name) {
                return config.root + 'api/rest/process/job/' + id + '/output/' + name;
            }
        };

    });
