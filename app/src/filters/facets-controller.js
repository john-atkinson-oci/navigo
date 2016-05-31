/*global angular */
angular.module('voyager.filters')
    .controller('FacetsCtrl', function ($scope, $uibModalInstance, selectedFilter, updateFilters, facetService, $location, translateService, usSpinnerService) {

        'use strict';
        $scope.selectedFilter = translateService.getFieldName(selectedFilter.field);
        $scope.updateFilters = updateFilters;

        $scope.predicate = '-count';

        facetService.doLookup(selectedFilter, $location.search(), function (facets) {
            if(facets.length > 0 && facets[0].style === 'CHECK') {
                // iterate through and make sure the 'isSelected' value is set on the facets
                for(var idx = 0; idx < facets.length; idx++) {
                    for( var i=0; i < selectedFilter.values.length; i++) {
                        if(facets[idx].name === selectedFilter.values[i].name) {
                            facets[idx].isSelected = selectedFilter.values[i].isSelected;
                            break;
                        }
                    }
                }
            }
            $scope.facets = facets;
            usSpinnerService.stop('facets-spinner');
        });

        $scope.filterResults = function (facet, evt) {
            if (facet.style !== 'CHECK') {
                $uibModalInstance.close(facet);
            } else {
                // facet.checked - for the filterscontroller $scope.filterResults
                // if checked is defined, will set isSelected to the reverse of the checked value.
                // then will look at the 'isSelected' and remove from the array if true.
                facet.checked = evt.currentTarget.checked;
                $scope.updateFilters(facet);
            }
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    });