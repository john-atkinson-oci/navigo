/*global angular, alert, config*/

angular.element(document).ready(function () {
    'use strict';

    var slash = config.root.charAt(config.root.length - 1);
    if (slash !== '/') {
        alert('Configuration Error: Your config.root needs a forward slash '/' at the end.');
        return;
    }

});
