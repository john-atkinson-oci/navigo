/*global angular */
'use strict';

angular.module('voyager.search')
    .directive('saveLocationDialog', function() {

        return {
            restrict: 'E',
            templateUrl: 'src/saved-location/save-location-dialog.html',
            link: function(scope) {
                scope.savedLocation = {};

                scope.ok = function () {

                    if (_.isEmpty(scope.savedLocation.name)) {
                        return;
                    }

                    // @TODO: integrate with api call

                    // savedSearchService.saveSearch(scope.savedLocation, searchedLocation).then(function(response) {

                    //     $modalInstance.close();
                    //     $analytics.eventTrack('saved-location', {
                    //         category: 'save'
                    //     });

                    //     scope.$emit('saveLocationSuccess', response.data);

                    // }, function(error) {
                    //     console.log(error.data);
                    // });
                };

                scope.cancel = function () {
                    scope.$dismiss();
                };
            }
        };

    });
