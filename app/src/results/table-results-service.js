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
        }

    };

});
