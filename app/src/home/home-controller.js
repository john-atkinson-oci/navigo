/*global angular, _, L */

'use strict';

angular.module('voyager.home')
	.controller('HomeCtrl', function(config, $scope, $window, $location, homeService, authService, leafletData, filterService, searchService, savedSearchService, sugar, configService, savedSearchQuery) {

        var _points;
        var _searchBoundaryLayer;
        var _searchBoundary;
        var _closeMarker;
        var _remove;

		$scope.search = {};
		$scope.mapTypes = ['Place', 'Map'];
		$scope.selectedMapType = 'Place';
		$scope.drawingTypes = ['Within', 'Intersects'];
		$scope.selectedDrawingType = 'Within';
		$scope.displayFormat = 'detail_format';
		$scope.showRecent = true; //show recent search
		$scope.changeTab = _changeSearchTab;
		$scope.submitSearch = _submitSearch;
		$scope.changeSelectedType = _changeSelectedType;
		$scope.applyCollection = _applyCollection;
		$scope.showPan = true;
		$scope.hideMap = !configService.showMap();
        $scope.featuredTitle = 'Featured';
        $scope.collectionsTitle = 'Collections';
		$scope.searchInputClass = 'col-md-6 col-xs-6';
		$scope.showSpatialInput = true;

		$scope.showAll = function() {
			var search = homeService.getFeaturedQuery();
			if (angular.isDefined(search)) {
				savedSearchService.applySavedSearch(search, $scope);
			} else {
				_submitSearch();
			}
		};

		if ($scope.hideMap) {
			$scope.containerStyle = 'margin-top: -60px; height: 180px';
		}

        if(config.homepage && angular.isDefined(config.homepage.featuredContentTitle)) {
            $scope.featuredTitle = config.homepage.featuredContentTitle;
        }

        if(config.homepage && angular.isDefined(config.homepage.sidebarLinksTitle)) {
            $scope.collectionsTitle = config.homepage.sidebarLinksTitle;
        }

        if(config.homepage && config.homepage.showPlaceQuery === false) {
            $scope.mapTypes = ['Map'];
            $scope.showMap = true;
            $scope.displayFormat = 'short_format';
            $scope.selectedMapType = 'Map';
        }

		if($scope.hideMap) {
			$scope.mapTypes = ['Place'];
			$scope.showMap = false;
			$scope.selectedMapType = 'Place';
		}

		if(config.homepage && config.homepage.showPlaceQuery === false && $scope.hideMap) {
			$scope.searchInputClass = 'col-xs-12';
			$scope.showSpatialInput = false;
		}

        $scope.hasPermission = function(permission) {
            return authService.hasPermission(permission);
        };

		function _reload(response) {
			if(response.action === 'login') {
				_init();
			}
		}
		authService.addObserver(_reload);

		_init();

		/**
		 * @function - on page load, fetch data
		 */
		function _init() {

			_createMap();

			//fetch for featured items and collections
			homeService.fetchCollections().then(function(respond) {
				$scope.collections = respond;
			});

			homeService.fetchFeatured().then(function(respond) {
				$scope.featured = respond;
			});

			$scope.$watch('selectedMapType', function(){
				if ($scope.selectedMapType === 'Map') {
					$scope.showMap = true;
					$scope.displayFormat = 'short_format';
				} else {
					$scope.showMap = false;
					$scope.displayFormat = 'detail_format';
				}
			});

			$scope.$on('updateSearchType', function (e, type) {
				$scope.selectedMapType = type;
			});

			$scope.$on('updateSearchDrawingType', function(event, args){
				$scope.selectedDrawingType = args;
			});
		}

		/**
		 * @function - toggle between recent and saved search list
		 */
		function _changeSearchTab(type) {
			$scope.showRecent = (type === 'recent');
		}

		/**
		 * @function - redirect user to search result page
		 */
		function _submitSearch() {
			var params = {};

			if (!_.isEmpty($scope.search.query)) {
				params.q = $scope.search.query;
			}

			if ($scope.selectedMapType === 'Place') {
				if (!_.isEmpty($scope.search.location)) {
					params.place = $scope.search.location;
                    var placeId = $location.search()['place.id'];
                    if(angular.isDefined(placeId)) {
                        params['place.id'] = placeId;
                    }
					params['place.op'] = $scope.selectedDrawingType.toLowerCase();
				}
			} else if ($scope.search.place !== undefined) {
				params.place = $scope.search.place;
				params['place.op'] = $scope.selectedDrawingType.toLowerCase();
			}

			var disp = $location.search().disp;
			if(angular.isDefined(disp)) {
				params.disp = disp;
			}

			//get the default saved search and apply to params
			savedSearchQuery.fetchDefaultParams().then(function(solrParams) {
				// these are overridden by the home page inputs
				delete solrParams.q;
				delete solrParams.place;
				delete solrParams['place.op'];
				delete solrParams['place.id'];

				params = _.extend(params, solrParams);
				$location.path('search').search(params);
			});

			return false;
		}

		function _addClearBoundaryMarker(map) {
            var closeIcon = L.icon({
                iconUrl: 'assets/img/close.png',
                iconSize:     [20, 20], // size of the icon
                iconAnchor:   [20, 0] // point of the icon which will correspond to marker's location
            });

            _closeMarker = L.marker(_points[2], {icon:closeIcon}).addTo(map);
            _closeMarker.on('mousedown', function () {
				map.removeLayer(_searchBoundaryLayer);
				map.removeLayer(_closeMarker);
				delete $scope.search.displayBBox;
				delete $scope.search.place;
				delete $scope.search['place.op'];
				_remove = true;
            });
        }

		/*
		 * @function - add map to the page and bind draw events
		 */
		function _createMap() {

			leafletData.getMap('search-map').then(function (map) {

				//TODO isn't this already done in the search map directive?
				map.on('draw:drawstop', function () {
					if (_.isEmpty(map.vsSearchType) || _searchBoundary === undefined || _remove) {
						_remove = false;
						return;
					}

					var placeType = map.vsSearchType;
					var bbox = _searchBoundary.replace(/,/g, ' ');

					$scope.search.displayBBox = sugar.formatBBox(bbox);
					$scope.search.place = bbox;
					$scope.search['place.op'] = placeType;

					var bounds = bbox.split(' ');

					if (angular.isDefined(_searchBoundaryLayer)) {
						map.removeLayer(_searchBoundaryLayer);
						map.removeLayer(_closeMarker);
					}

					//TODO use map util
					var color = (placeType === 'within') ? '#f06eaa' : '#1771b4';

					_searchBoundaryLayer = L.rectangle([[bounds[1], bounds[0]], [bounds[3], bounds[2]]], {color: color, weight: 4, 'stroke-color': color, 'stoke-opacity': 0.8, fill:false});
					_searchBoundaryLayer.addTo(map);
					_points = _searchBoundaryLayer.getLatLngs();
					_addClearBoundaryMarker(map);
				});

				map.on('draw:created', function (e) {
					_searchBoundary = e.layer.getBounds().toBBoxString();
				});
			});
		}

		/**
		 * @function - change selected map type
		 */
		function _changeSelectedType(type) {
			$scope.selectedMapType = type;
		}

		function _applyCollection(collection) {

			var solrParams = savedSearchService.getParams(collection);
			$location.path('search').search(solrParams);

		    filterService.applyFromUrl($location.search()).then(function() {
		        //$scope.$emit('addBboxEvent', {});  //updates map with bbox from url
		        //$scope.$emit('changeViewEvent', {});
		    });

		}

		$scope.$on('$destroy', function() {
			authService.removeObserver(_reload);
		});
	});