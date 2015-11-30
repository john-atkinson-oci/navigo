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
                var isBbox = false;
                var isWkt = false;

                if(mapUtil.isBbox(params.place)) {
                    formattedPlace = sugar.formatBBox(params.place);
                    isBbox = true;
                } else {
                    formattedPlace = mapUtil.formatWktForDisplay(params.place);
                    isWkt = true;
                }

                humanized = (params['place.op'] === 'within' ? 'Within' : 'Intersects') + ': ' + formattedPlace;
                $scope.filters.push({'isInput': true, 'name': 'place', 'humanized': humanized, 'isBbox' : isBbox, 'isWkt' : isWkt});
            }
        }

        function clearPlace(params) {
            delete params.place;
            delete params['place.op'];
            delete params['place.id'];
            return params;
        }

        $scope.removeFilter = function(facet) {
            if (facet.name === 'search') {
                $location.search('q', null);
                $scope.$emit('removeFilterEvent', {});
            }
            else if (facet.name === 'place') {
                var filterHumanized = facet.humanized.split(': ');
                filterHumanized.splice(0, 1);
                var args = {isBbox: facet.isBbox, isWkt: facet.isWkt};
                $location.search(clearPlace($location.search()));
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
            var params = $location.search();
            delete params.q;
            delete params.fq;
            $location.search(clearPlace(params));

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
