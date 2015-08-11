/*global angular, $, Spinner */
//TODO replace with usSpinnerService
angular.module('voyager.util').
    factory('loading', function ($timeout) {
        'use strict';
        var spinner;
        var isLoading = false;

        var delayedShow = function (element) {
            if (isLoading && !spinner) {
                spinner = new Spinner({radius: 3}).spin();
                var indicatorDiv = $(element);
                indicatorDiv.append(spinner.el);
            }
        };

        return {
            show: function (element) {
                isLoading = true;
                $timeout(function () {
                    delayedShow(element);
                }, 250);
            },

            done: function () {
                isLoading = false;
                if (spinner) {
                    spinner.stop();
                    spinner = null;
                }
            }
        };
    });
