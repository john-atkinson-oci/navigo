'use strict';
angular.module('simpleSearch')
    .directive('vgScroll', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var raw = element[0];
                var lastSpot = 0;

                function _scroll() {
                    var spot = raw.scrollTop + raw.offsetHeight;
                    if (spot >= raw.scrollHeight - 50 && spot >= lastSpot) {
                        scope.$emit('resultsBottom', {});
                        scope.$apply();
                    }
                    lastSpot = spot;
                }

                element.bind('scroll', _scroll);

                scope.$on('simpleSearch', function() {
                    element[0].scrollTop = 0;
                });

                scope.$on("$destroy", function() {
                    element.unbind('scroll', _scroll);
                });
            }
        };
    })
    .controller('SimpleSearchCtrl', function ($scope, $http, config, $window, $document, usSpinnerService, simpleSearch, $timeout, translateService) {

        var _busy = false;
        var _page = 1;

        var selectedFacets = {};
        var lastSelected = '';

        $scope.filterState = "Show";
        $scope.fields = ['name', 'format'];

        var showFields = $scope.queryCriteria.fields;
        if (showFields && showFields.length > 0) {
            $scope.fields = showFields;
        }
        $scope.displayFields = [];
        _.each($scope.fields, function(field) {
            $scope.displayFields.push(translateService.getFieldName(field));
        });

        if ($scope.queryCriteria.query && $scope.queryCriteria.query['facet.field']) {
            $scope.facetFields = $scope.queryCriteria.query['facet.field'];
        }

        $scope.fieldWidth = 100 / $scope.fields.length;

        $scope.docs = [];

        $('#voyagerSearch').removeClass('container');

        function _flagSelected() {
            _.each($scope.facetFields, function(filter) {
                _.each(filter.facets, function(facet) {
                    if(selectedFacets[facet.name]) {
                        facet.isSelected = true;
                        if(lastSelected === filter.filter) {
                            filter.displayState = 'in';
                        }
                    }
                });
            });
        }

        function _search(page) {
            usSpinnerService.spin('simple-spinner');
            simpleSearch.search($scope.searchInput, $scope.queryCriteria.query, page, $scope.docs).then(function(data) {
                _busy = false;
                $scope.facetFields = data.facetFields;
                _flagSelected();
                if(page === 1) {
                    $scope.$broadcast('simpleSearch', {});
                }
                usSpinnerService.stop('simple-spinner');
            });
        }

        $timeout(function () {  // spinner doesn't work initially, workaround
            _search(1);
        });

        $scope.searchClick = function() {
            _search(1);
        };

        $scope.clearSearch = function() {
            delete $scope.searchInput;
            _search(1);
        };

        $scope.toggleFilters = function() {
            $scope.showFilters = !$scope.showFilters;
            $scope.filterState = $scope.showFilters ? 'Hide' : 'Show';
        };

        function _initQuery() {
            if(!$scope.queryCriteria.query) {
                $scope.queryCriteria.query = {};
            }
            if(!$scope.queryCriteria.query.fq) {
                $scope.queryCriteria.query.fq = [];
            }
        }
        function _addFilter(facet) {
            lastSelected = facet.filter;
            facet.isSelected = true;
            selectedFacets[facet.name] = facet;
            _initQuery();
            $scope.queryCriteria.query.fq.push(facet.filter + ':' + facet.name);
        }

        function _removeFilter(facet) {
            facet.isSelected = false;
            delete selectedFacets[facet.name];
            _initQuery();
            $scope.queryCriteria.query.fq = _.without($scope.queryCriteria.query.fq, facet.filter + ':' + facet.name);
        }

        $scope.filterResults = function(facet) {
            if(!facet.isSelected) {
                _addFilter(facet);
            } else {
                _removeFilter(facet);
            }
            _search(1);
        };

        $scope.toggleDisplayState = function (filter) {
            //timeout allows the directive to fire first
            $timeout(function() {
                _.each($scope.facetFields, function(f) { // accordion behavior because of limited space
                    if(filter.filter !== f.filter) {
                        f.displayState = '';
                    }
                });
                if(filter.displayState !== 'in') {
                    filter.displayState = 'in';
                } else {
                    filter.displayState = '';
                }
            }, 0);
        };

        $scope.handleEnter = function (ev) {
            if (ev.which === 13) {
                _search(1);
            }
        };

        function _loadNextChunk() {
            _page += 1;
            _busy = true;
            _search(_page);
        }

        $scope.$on('resultsBottom', function() {
            if(_busy === false) {
                _loadNextChunk();
            }
        });

        $scope.setItem = function(item) {
            $('#voyagerSearch').trigger('selectedItem', $scope.item);
            $scope.ok(item); //if inside modal
        };

        $scope.closeBrowser = function () {
            $('#voyagerSearch').trigger('cancelSearch');
            $scope.cancel(); //if inside modal
        };
    });
