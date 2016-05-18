'use strict';

angular.module('voyager.results').
factory('tableResultsService', function ($window) {

    return {

        setFixedWidths: function () {
            var windowWidth = angular.element($window).width();

            // keep the image and tools columns fixed
            var imgCol = $('th.semi.img');
            var imageWidth = (100/windowWidth) * 100;
            imgCol.css('width',imageWidth + '%');

            var toolsCol = $('#resultsTable').find('th').last();
            var toolsWidth = (85/windowWidth) * 100;
            toolsCol.css('width',toolsWidth + '%');
        },

        forceWidths: function() {
            var $tableHeaders = angular.element('.ng-table').find('th');
            var $header, width, toWidth;
            _.each($tableHeaders, function(header) {
                $header = angular.element(header);
                width = $header.css('width');
                toWidth = $header.data('width');
                if (angular.isDefined(toWidth) && width !== toWidth) {
                    $header.css('width', toWidth);
                }
            });
        }

    };

});
