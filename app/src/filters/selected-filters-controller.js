/*global angular */

angular.module('voyager.filters')
    .controller('SelectedFiltersCtrl', function ($scope, filterService, $location, mapUtil, sugar) {

        'use strict';

        function _setSelectedFilters() {
            var params = $location.search();
            $scope.filters = filterService.getFilters().slice(0);

            if (params.q && params.q !== '*:*') {
                $scope.filters.push({'isInput': true, 'name': 'search', 'humanized': 'Search:' + params.q});
            }
            if (params.place) {
                var formattedPlace = params.place;
                var humanized;

                if(mapUtil.isBbox(params.place)) {
                    formattedPlace = sugar.formatBBox(params.place);
                }
                humanized = (params['place.op'] === 'within' ? 'Within' : 'Intersects') + ': ' + formattedPlace;
                $scope.filters.push({'isInput': true, 'name': 'place', 'humanized': humanized});
            }
        }

        $scope.removeFilter = function(facet) {
            if (facet.name === 'search') {
                $location.search('q', null);
                $scope.$emit('removeFilterEvent', {});
            }
            else if (facet.name === 'place') {
                var filterHumanized = facet.humanized.split(': ');
                filterHumanized.splice(0, 1);
                var args = {isBbox:mapUtil.isBbox(filterHumanized.join(': '))};
                $location.search('place', null);
                $location.search('place.op', null);
                $location.search('place.id', null);
                $scope.$emit('removeFilterEvent', args);
            }
            else {
                filterService.removeFilter(facet);
                $location.search('fq', filterService.getFilterAsLocationParams());  //remove filter from url
                $scope.$emit('removeFilterEvent', facet);  //fire filter event
            }

            _setSelectedFilters();
        };

        $scope.clearAllFilter = function() {
            $location.search('q', null);
            $location.search('place', null);
            $location.search('place.op', null);
            filterService.clear();
            $scope.$emit('removeFilterEvent', {});  //fire filter event
            _setSelectedFilters();
        };

        $scope.$on('filterChanged', function () {
            _setSelectedFilters();
        });

        // $scope.$on('changeView', function () {
        //     _setSelectedFilters();
        // });

        $scope.$on('clearSearch', function() {
            _setSelectedFilters();  //search cleared, update selected filters
        });

        if($location.search().fq) {
            filterService.setFilters($location.search().fq);
        }
        _setSelectedFilters();

    });
