/*global angular */
angular.module('voyager.filters')
    .controller('FacetsCtrl', function ($scope, $modalInstance, selectedFilter, updateFilters, facetService, $location, translateService, usSpinnerService) {

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
                $modalInstance.close(facet);
            } else {
                // this logic has to be reversed - the actual filters will look as the isSelected and remove form the array of true. 
                facet.checked = evt.currentTarget.checked;
                $scope.updateFilters(facet);
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    });