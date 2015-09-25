/*global angular, $, L */

angular.module('voyager.search')
	.directive('vsSearchMap', function ($compile, config, mapUtil, $timeout, mapControls, configService, $window, $templateRequest) {
		'use strict';

		function getMapSizeTemplate() {
			var mapSizeTemplate = '<div class="leaflet-control-map-size-toggle leaflet-bar leaflet-control">';
				mapSizeTemplate += '<div class="map-size-drop-down">';
				mapSizeTemplate += '<div class="icon-arrow flyout-trigger" ng-click="toggleMapSizeDropDown()"><span class="icon-search_map"></span></div>';
				mapSizeTemplate += '<div class="flyout"><div class="arrow"></div><div class="flyout_inner">';
				mapSizeTemplate += '<ul><li><a href="javascript:;" ng-click="switchMap(\'large\')">Large map</a></li>';
				mapSizeTemplate += '<li><a href="javascript:;" ng-click="switchMap(\'small\')">Small map</a></li>';
				mapSizeTemplate += '<li><a href="javascript:;" ng-click="switchMap(\'no\')">No map</a></li>';
				mapSizeTemplate += '</ul></div></div></div></div>';

			return mapSizeTemplate;
		}

		function getExtent(params) {
			//copy mapDefault so it doesn't get modified
			var extent = $.extend({}, configService.getDefaultMapView());
			if (params.vw) {  //use query string if on url
				extent = configService.parseMapViewString(params.vw, ' ');
			}
			return extent;
		}

		function toggleMapMode($element, $scope, leafletData) {

			if ($scope.displayFormat === 'detail_format') {
				leafletData.getMap('search-map').then(function (map) {
					map.dragging.disable();
					map.doubleClickZoom.disable();
					map.scrollWheelZoom.disable();
					if (map.drawRectangle !== undefined) {
						map.drawRectangle.disable();
					}
					$element.addClass('dragging_disabled');
				});
			}
			else {
				leafletData.getMap('search-map').then(function (map) {
					map.dragging.enable();
					map.doubleClickZoom.enable();
					map.scrollWheelZoom.disable();
					$element.removeClass('dragging_disabled');
					$scope.resizeMap(true);
				});

				$('#searchByMap').addClass('selected').siblings().removeClass('selected');
			}
		}

		return {
			compile: function(element, attr) {
				element.append('<leaflet style="height: 100%" center="clientDefault" defaults="defaults" controls="controls" layers="layers" id="search-map" watch-markers="no"></leaflet>');

				return function (scope) {           //<- This is link function
					if(angular.isDefined(attr.zoom)) {
						scope.clientDefault.zoom = parseInt(attr.zoom);
					}
				};
			},
			controller: function ($scope, $element, $attrs, leafletData, $stateParams) {

				var _rectangle;
				var _cancelledDraw = false;
				var _drawing = false;

				$scope.clientDefault = getExtent($stateParams, config);
				$scope.defaults = mapUtil.getDefaultConfig();
				$scope.layers = mapUtil.getLayers($attrs.origin);
				$scope.controls = {
					custom: []
				};

				mapControls.init($scope, 'search-map');

				function _cancelDraw() {
					$scope.$emit('cancelledDraw');
					_drawing = false;
					_cancelledDraw = true;
					if(_rectangle) {
						_rectangle.disable();
					}
					$('.voyager-draw-intersect').removeClass('selected');
				}

				$scope.$on('removeFilter', function() {
					_cancelDraw();
				});

				var zoomIn = $scope.zoomIn;
				$scope.zoomIn = function(e) {
					_cancelDraw();
					zoomIn(e);
					_unbindResize();
				};

				var zoomOut = $scope.zoomOut;
				$scope.zoomOut = function(e) {
					_cancelDraw();
					zoomOut(e);
					_unbindResize();
				};

				var defaultExtent = $scope.defaultExtent;
				$scope.defaultExtent = function(e) {
					_cancelDraw();
					defaultExtent(e);
				};

				$scope.toggleDisplayFormat = function(type, event) {
					event.preventDefault();
					event.stopPropagation();

					if ($scope.selectedMapType !== type) {
						$scope.selectedMapType = type;
						$(event.currentTarget).addClass('selected').siblings().removeClass('selected');
						$scope.$emit('searchTypeChanged', type);
						if(type !== 'Map') {
							_cancelDraw();
						}
					}
				};

				var searchControls = L.control();
				searchControls.setPosition('topleft');
				searchControls.onAdd = function () {
					var template = '<div class="leaflet-draw-section"><div class="leaflet-bar">';
					template += '<a class="voyager-draw-intersect" id="is-within" ng-click="drawRectangle(\'within\', $event)" title="Search Within"><i class="svg_map_icon svg_map_contain"></i> </a>';
					template += '<a class="voyager-draw-intersect" id="intersects" ng-click="drawRectangle(\'intersects\', $event)" title="Intersect"><i class="svg_map_icon svg_map_intersect"></i></a>';
					template += '</div>';
					template += '</div>';

					return $compile($(template))($scope)[0];
				};

				var mapTypeToggleControls = L.control();
				mapTypeToggleControls.setPosition('topleft');
				mapTypeToggleControls.onAdd = function () {
					var template = '<div class="leaflet-map-toggle-section"><div class="leaflet-bar">';
					template += '<a ng-click="toggleDisplayFormat(\'Place\', $event)" id="searchByPlace" class="selected" title="Search by place"><span class="icon-place_search"></span></a>';
					template += '<a ng-click="toggleDisplayFormat(\'Map\', $event)" id="searchByMap" title="Search by map"><span class="icon-search_map"></span></a>';
					template += '</div>';
					template += '</div>';

					return $compile($(template))($scope)[0];
				};

				if($attrs.resize !== 'false') {
					$scope.sizeIcon = 'glyphicon-resize-full';

					var sizeControl = L.control();
					sizeControl.setPosition('bottomright');
					sizeControl.onAdd = function () {

						var template = '<div class="leaflet-bar leaflet-draw-toolbar">';
						template += '<a class="voyager-default-extent" target="_self" ng-click="resize()" title="Resize" style="cursor: pointer"><span class="glyphicon {{sizeIcon}}"></span></a>';
						template += '</div>';

						return $compile($(template))($scope)[0];
					};
					$scope.controls.custom.push(sizeControl);
				}

				$scope.addMapSizeToggleControl = function() {

					var mapSizeControl = L.control();

					mapSizeControl.setPosition('bottomright');
					mapSizeControl.onAdd = function () {
						return $compile(getMapSizeTemplate())($scope)[0];
					};

					$scope.controls.custom.push(mapSizeControl);
				};

				// @TODO where does map spinner go?  When adding map service layer etc
				//var spinControl = L.control();
				//spinControl.setPosition('topright');
				//spinControl.onAdd = function () {
				//	var template = '<div class="leaflet-bar leaflet-draw-toolbar">';
				//	template += '<span us-spinner="{top:\'0px\',left:\'-5px\',radius:4, width:3, length: 5}" spinner-key="map-spinner"></span>';
				//	template += '</div>';
				//	return $compile($(template))($scope)[0];
				//};

				// @TODO: add search on map move feature
				// var moveMapOption = L.control();
				// moveMapOption.setPosition('bottomleft');
				// moveMapOption.onAdd = function () {
				// 	var template = '<div class="leaflet-bar leaflet-draw-toolbar move-map-option">';
				// 	template += '<label ng-dblClick="preventDoubleClick($event)"><input type="checkbox" ng-model="moveMapOption.value" />Search when I move map</label>';
				// 	template += '</div>';
				// 	return $compile($(template))($scope)[0];
				// };
				//$scope.controls.custom.push(moveMapOption);

				if ($attrs.control) {
					$scope.addMapSizeToggleControl();
				}

				if ($scope.displayFormat) {
					$scope.controls.custom.push(mapTypeToggleControls);
				}

				$scope.controls.custom.push(mapControls.getZoomControls($scope));
				$scope.controls.custom.push(searchControls);
				//$scope.controls.custom.push(spinControl);

				// comment out click event that allows user to switch to map view by clicking anywhere on the map
				$element.on('click', function(e){
					if (angular.isDefined($scope.displayFormat) && $element.hasClass('dragging_disabled')) {
						$scope.toggleDisplayFormat('Map',e);
						$scope.$apply();
					}
				});

				$element.on('keydown', function(e){
					if(e.keyCode === 27) {
						_cancelDraw();
					}
				});

				$scope.$watch('displayFormat', function(){
					if (angular.isDefined($scope.displayFormat)) {
						toggleMapMode($element, $scope, leafletData);
						_triggerDrawingTool();
					}
				});

				$scope.$watch('selectedDrawingType', function(){
					_triggerDrawingTool();
				});

				$scope.$on('updateDrawingTool', function(event, args){
					if (args === 'Within') {
						_drawRectangle('within', $('#is-within'));
					} else {
						_drawRectangle('intersects', $('#intersects'));
					}
				});

				function _triggerDrawingTool() {
					$timeout(function(){
						if ($scope.displayFormat === 'short_format') {
							if ($scope.selectedDrawingType === 'Within') {
								$('#is-within').trigger('click');
							} else {
								$('#intersects').trigger('click');
							}
						}
					}, 10);
				}

				$scope.$watch('view', function(view){
					_cancelDraw();

					leafletData.getMap('search-map').then(function (map) {
						if(view === 'map') {
							map.options.minZoom = 2;  //keep from zooming out too far when the map is big
						} else {
							map.options.minZoom = 1;
						}
						//have to wait for angular to refresh scope
						$timeout(function () {  //workaround for leaflet bug:  https://github.com/Leaflet/Leaflet/issues/2021
							map.invalidateSize();  //workaround when initially hidden
							// console.log('view change - moving');
							if(!angular.isDefined(map.currentBounds)) {
								$scope.resizeMap();
							}
						}, 200);
					});
				});

		        $scope.switchMap = function(size) {
		            $scope.$emit('mapSizeChanged', size);
		        };

		        $scope.toggleMapSizeDropDown = function() {
		            var dropDownEl = angular.element('.map-size-drop-down');

		            if (!dropDownEl.hasClass('opened')) {
		                dropDownEl.addClass('hover_flyout bottom opened');
		            } else {
		                dropDownEl.removeClass('hover_flyout bottom opened');
		            }
		        };

				$scope.preventDoubleClick = function(event) {
					event.stopPropagation();
				};

				$scope.cancelDraw = function(event) {
					_cancelDraw();
					event.preventDefault();
					$('.voyager-pan').addClass('selected').parents('.leaflet-control').siblings().find('a').not('#searchByMap').removeClass('selected');
				};

				$scope.drawRectangle = function(type, $event) {
					var selectedType = (type === 'within') ? 'Within' : 'Intersects';
					if (angular.isDefined($scope.displayFormat) && $scope.selectedDrawingType !== selectedType) {
						$scope.selectedDrawingType = selectedType;
						$scope.$emit('drawingToolChanged', $scope.selectedDrawingType);
					}
					_drawRectangle(type, $($event.currentTarget));
				};

				function _drawRectangle(type, drawingToolEl) {
					if(_drawing) {
						_cancelDraw();
					}

					_drawing = true;

					drawingToolEl.addClass('selected').siblings().removeClass('selected');
					drawingToolEl.parents('.leaflet-control').siblings().find('a').not('#searchByMap').removeClass('selected');

					var searchForm = $element.next('.short_format');
					if (searchForm.length) {
						searchForm.find('.location_fieldset').addClass('focused').siblings().removeClass('focused');
					}

					leafletData.getMap('search-map').then(function (map) {
						map.vsSearchType = type;

						var color = (type === 'within') ? '#f06eaa' : '#1771b4';
						$timeout(function() {
							if(_rectangle) {
								_rectangle.disable();
							}
							_rectangle = new L.Draw.Rectangle(map,{shapeOptions: {color: color, fillColor: color, strokeOpacity: 0.8, fillOpacity: 0.0}, repeatMode:true, showArea: false});
							_rectangle.enable();
							map.searchRectangle = _rectangle;
						});
					});
				}

				$scope.resize = function() {
					var zoom = 10;
					if ($scope.sizeIcon === 'glyphicon-resize-full') {
						$scope.sizeIcon = 'glyphicon-resize-small';
						zoom = 2;
					} else {
						$scope.sizeIcon = 'glyphicon-resize-full';
					}

					$scope.toggleMap();
					leafletData.getMap('search-map').then(function (map) {
						//have to wait for angular to refresh scope
						$timeout(function () {  //workaround for leaflet bug:  https://github.com/Leaflet/Leaflet/issues/2021
							map.invalidateSize();  //workaround when initially hidden
							if(angular.isDefined(map.currentBounds)) {
								//map.fitBounds(map.currentBounds);
							} else {
								map.setZoom(zoom);
							}
						}, 200);
					});
				};

				var windowEl = angular.element($window);
				$scope.resizeMap = function(isFull) {
					leafletData.getMap('search-map').then(function (map) {
						if (!map.currentBounds) {
							var ratio;
							$timeout(function() {
								if (isFull) {
									ratio = (windowEl.innerHeight() - 85) / 256;
								} else {
									ratio = $element.outerHeight() / 256;
								}

								var emptySpace = Math.ceil(ratio - Math.floor(ratio)) + 1;
								if (emptySpace > 0) {
									map.setZoom(emptySpace);
								}

								if (isFull) {
									$timeout(function() {
										map.invalidateSize();
									}, 200);
								}
							}, 200);
						} else {
							map.invalidateSize();
						}
					});
				};

				var _unbindResize = function() {
					windowEl.unbind('resize', $scope.resizeMap);
				};

				//windowEl.bind('resize', $scope.resizeMap);
				$scope.$on('$destory', function(){
					_unbindResize();
				});
			}
		};
	});