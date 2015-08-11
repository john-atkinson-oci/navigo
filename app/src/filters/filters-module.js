/*global angular */
'use strict';
angular.module('voyager.filters', ['voyager.util','ui-rangeSlider', 'voyager.config', 'blockUI'])
    .config(function(blockUIConfig) {

    // Change the default overlay message
    //blockUIConfig.message = 'Please stop clicking!';

    // Change the default delay to 100ms before the blocking is visible
    blockUIConfig.delay = 300;

    blockUIConfig.requestFilter = function(config) {

        if(config.url.indexOf('block=false') !== -1) {
            return false; // ... don't block if explicit
        }

        if(config.params && config.params.block === false) {
            return false;
        }

        if(config.url.indexOf('api/rest') !== -1) {
            return false; // ... don't block api calls
        }

    };

});