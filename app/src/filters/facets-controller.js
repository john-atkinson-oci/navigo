/*global angular */
angular.module('voyager.filters')
    .controller('FacetsCtrl', function ($scope, $modalInstance, selectedFilter, facetService, $location, translateService, usSpinnerService) {

        'use strict';
        $scope.selectedFilter = translateService.getFieldName(selectedFilter.field);

        $scope.predicate = '-count';

        facetService.doLookup(selectedFilter, $location.search(), function (facets) {
            $scope.facets = facets;
            usSpinnerService.stop('facets-spinner');
        });

        $scope.filterResults = function (facet) {
            $modalInstance.close(facet);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });