/*global angular, $, L */

angular.module('voyager.search')
	.directive('vsSearchMap', function ($compile, config, mapUtil, $timeout, mapControls, configService, $window, $http) {
		'use strict';

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

				var _drawedShape;
				var _cancelledDraw = false;
				var _drawing = false;
				var _searchBoundaryLayer;
				var _searchBoundary;
				var _remove;
				var _closeMarker;
				var _editMarker;
				var _bufferBoundaryLayer;


				$scope.toolType = 'rectangle';
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
					if(_drawedShape) {
						_drawedShape.disable();
					}
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

				$scope.addDrawingTool = function() {
					searchControls.setPosition('topleft');
					searchControls.onAdd = function () {
						var template = '<div class="leaflet-draw-section"><div class="leaflet-bar">';
						template += '<a class="voyager-draw-rect" ng-click="toggleDrawingOption($event)"><i class="svg_map_icon icon-map_draw_{{toolType}}"></i></a>';
						template += '</div>';
						template += '<div class="leaflet-bar drawing-option-cont" ng-if="showDrawingTools">';
						template += '<ul id="drawingTools">';
						template += '<li><a ng-click="selectDrawingTool($event, \'rectangle\')" title="Rectangle"><i class="svg_map_icon icon-map_draw_rectangle"></i></a></li>';
						template += '<li><a ng-click="selectDrawingTool($event, \'polygon\')" title="Polygon"><i class="svg_map_icon icon-map_draw_polygon"></i></a></li>';
						template += '<li><a ng-click="selectDrawingTool($event, \'polyline\')" title="Line"><i class="svg_map_icon icon-map_draw_polyline"></i></a></li>';
						template += '<li><a ng-click="selectDrawingTool($event, \'point\')" title="Marker"><i class="svg_map_icon icon-map_draw_point"></i></a></li>';
						template += '</ul>';
						template += '</div></div>';

						return $compile($(template))($scope)[0];
					};
				};

				$scope.addDrawingTool();

				$scope.toggleDrawingOption = function($event) {
					// open drawing tools
					$event.preventDefault();
					$scope.showDrawingTools = !$scope.showDrawingTools;
				};

				$scope.selectDrawingTool = function($event, toolType) {
					$event.preventDefault();
					var color = ($scope.selectedDrawingType === 'within') ? '#f06eaa' : '#1771b4';

					$scope.toolType = toolType;
					$scope.showDrawingTools = false;

					if(_drawing) {
						_cancelDraw();
					}

					_drawing = true;

					switch (toolType) {
						case 'polyline':
							$scope.drawLine(color);
							break;
						case 'polygon':
							$scope.drawPloygon(color);
							break;
						case 'point':
							$scope.drawPoint(color);
							break;
						default:
							$scope.drawRectangle(color);
							break;
					}
				};

				var _map;
				var markerIcon = L.icon({
					iconUrl: 'assets/img/marker-icon.png',
					iconSize: [14, 14]
				});

				leafletData.getMap('search-map').then(function (map){

					_map = map;

					map.on('draw:created', function (e) {
						_searchBoundary = e;
					});

					_mapEvents(map);
				});

				$scope.drawLine = function(color) {

					leafletData.getMap('search-map').then(function (map) {
						map.vsSearchType = $scope.selectedDrawingType;

						$timeout(function() {
							if(_drawedShape) {
								_drawedShape.disable();
							}
							_drawedShape = new L.Draw.Polyline(map,{shapeOptions: _shapeOptions(color), repeatMode:false, showArea: false});
							_drawedShape.enable();
						});
					});
				};

				$scope.drawPloygon = function(color) {

					leafletData.getMap('search-map').then(function (map) {
						map.vsSearchType = $scope.selectedDrawingType;

						$timeout(function() {
							if(_drawedShape) {
								_drawedShape.disable();
							}
							_drawedShape = new L.Draw.Polygon(map,{shapeOptions: _shapeOptions(color), repeatMode:false, showArea: true});
							_drawedShape.enable();
						});
					});
				};

				$scope.drawPoint = function() {

					leafletData.getMap('search-map').then(function (map) {
						map.vsSearchType = $scope.selectedDrawingType;

						$timeout(function() {
							if(_drawedShape) {
								_drawedShape.disable();
							}

							_drawedShape = new L.Draw.Marker(map,{icon: markerIcon});
							_drawedShape.enable();
						});
					});
				};

				$scope.drawRectangle = function(color) {
					leafletData.getMap('search-map').then(function (map) {
						map.vsSearchType = $scope.selectedDrawingType;

						$timeout(function() {
							if(_drawedShape) {
								_drawedShape.disable();
							}
							_drawedShape = new L.Draw.Rectangle(map,{shapeOptions: _shapeOptions(color), repeatMode:false, showArea: false});
							_drawedShape.enable();
						});
					});
				};

				function _shapeOptions(color) {
					return {color: color, fillColor: color, strokeOpacity: 0.8, fillOpacity: 0.0};
				}


				function _option() {
					var color = ($scope.selectedDrawingType === 'within') ? '#f06eaa' : '#1771b4';
					return {color: color, weight: 4, 'stroke-color': color, 'stoke-opacity': 0.8, fill: false};
				}


				function convertBuffer(geoJSON) {
					var color = ($scope.selectedDrawingType === 'within') ? '#f06eaa' : '#1771b4';

					$http.post(config.root + 'api/rest/spatial/buffer?distance=' + $scope.buffer.distance, geoJSON.geometry).then(function(response){

						geoJSON.geometry = response.data;
						if (_bufferBoundaryLayer) {
							_map.removeLayer(_bufferBoundaryLayer);
						}
						_bufferBoundaryLayer = L.geoJson(geoJSON, {
						    style: {color: color, weight: 0, fill: true, opacity: 0.8}
						}).addTo(_map);
					});
				}

				function _mapEvents(map) {

					map.on('draw:drawstop', function () {
						if (_.isEmpty(map.vsSearchType) || _searchBoundary === undefined || _remove) {
							_remove = false;
							return;
						}

						var placeType = map.vsSearchType;
						var bbox;
						var latLngs;
						var pointInx = 0;

						$scope.search['place.op'] = placeType;

						if (angular.isDefined(_searchBoundaryLayer)) {
							_removeLayers();
						}

						if ($scope.toolType === 'rectangle') {
							latLngs = _searchBoundary.layer.getLatLngs();
							bbox = _searchBoundary.layer.getBounds().toBBoxString().replace(/,/g, ' ');
							_searchBoundaryLayer = L.rectangle(_searchBoundary.layer.getBounds(), _option());
							pointInx = 2;
						} else if ($scope.toolType === 'polyline') {
							latLngs = _searchBoundary.layer.getLatLngs();
							// bbox = _searchBoundary.layer.getLatLngs().toBBoxString().replace(/,/g, ' ');
							_searchBoundaryLayer = L.polyline(latLngs, _option());
							pointInx = 1;
						} else if ($scope.toolType === 'polygon') {
							latLngs = _searchBoundary.layer.getLatLngs();
							_searchBoundaryLayer = L.polygon(latLngs, _option());

						} else if ($scope.toolType === 'point') {
							latLngs = _searchBoundary.layer.getLatLng();
							_searchBoundaryLayer = L.marker(latLngs, {icon: markerIcon});
						}

						// $scope.search.displayBBox = mapUtil.formatWkt(_searchBoundaryLayer);
						// $scope.search.place = $scope.search.displayBBox.replace(/\s+/g, '+');

						_searchBoundaryLayer.addTo(map);

						if ($scope.toolType !== 'point') {
							_addEditBufferMarker(map, _searchBoundaryLayer.getLatLngs()[pointInx]);
							_addClearBoundaryMarker(map, _searchBoundaryLayer.getLatLngs()[pointInx]);
						} else {
							_addEditBufferMarker(map, _searchBoundaryLayer.getLatLng());
							_addClearBoundaryMarker(map, _searchBoundaryLayer.getLatLng());
						}
					});
				}

				function getGeoJSONType() {
					if ($scope.toolType === 'polyline') {
						return 'LineString';
					} else if ($scope.toolType === 'point') {
						return 'Point';
					}

					return 'Polygon';
				}


				function _addEditBufferMarker(map, pointPosition) {

					var anchor = [40, 0];
					if ($scope.toolType === 'rectangle') {
						anchor = [-2, 2];
					} else if ($scope.toolType === 'point') {
						anchor = [0, 25];
					}

					var editIcon = L.icon({
						iconUrl: 'assets/img/icon_edit.png',
						iconSize:     [20, 20], // size of the icon
						iconAnchor:   anchor // point of the icon which will correspond to marker's location
					});

					_editMarker = L.marker(pointPosition, {icon:editIcon}).addTo(map).bindPopup(addBufferOption());
					_editMarker.on('click', function () {
						_editMarker.openPopup();
					});
				}

				function _addClearBoundaryMarker(map, pointPosition) {

					var anchor = [20, 0];
					if ($scope.toolType === 'rectangle') {
						anchor = [-22, 2];
					} else if ($scope.toolType === 'point') {
						anchor = [-20, 25];
					}

					var closeIcon = L.icon({
						iconUrl: 'assets/img/icon_x.png',
						iconSize:     [20, 20], // size of the icon
						iconAnchor:   anchor // point of the icon which will correspond to marker's location
					});

					_closeMarker = L.marker(pointPosition, {icon:closeIcon}).addTo(map);
					_closeMarker.on('mousedown', function () {
						_removeLayers();
						_remove = true;
					});
				}

				$scope.bufferMeasures = ['miles'];

				function _removeLayers() {
					_map.removeLayer(_searchBoundaryLayer);
					_map.removeLayer(_closeMarker);
					_map.removeLayer(_editMarker);
					if (angular.isDefined(_bufferBoundaryLayer)) {
						_map.removeLayer(_bufferBoundaryLayer);
					}
				}

				function addBufferOption() {
					var markup;

					markup = '<div class="buffer-option">';
					markup += '<form name="bufferOption">';
					markup += '<div class="buffer-content"><div class="buffer-label semi">Buffer distance</div>';
					markup += '<input type="text" ng-model="buffer.distance" />';
					markup += '<select ui-select2="{dropdownAutoWidth: \'true\', minimumResultsForSearch: -1}" ng-model="buffer.measure">';
					markup += '<option ng-repeat="type in ::bufferMeasures">{{::type}}</option>';
					markup += '</select></div>';
					markup += '<div class="buffer-footer">';
					markup += '<input type="submit" value="Done" class="btn btn-primary" ng-click="addBuffer()" />';
					markup += '<a href="#" ng-click="bufferCancel($event)" class="link_secondary">Cancel</a>';
					markup += '</div>';
					markup += '</form>';
					markup += '</div>';

					return $compile($(markup))($scope)[0];
				}

				addBufferOption();

				$scope.addBuffer = function() {
					angular.element('.leaflet-popup-close-button')[0].click();
					convertBuffer(_searchBoundaryLayer.toGeoJSON(), getGeoJSONType());
				};

				$scope.bufferCancel = function($event) {
					$event.preventDefault();
					$scope.buffer = {};
					angular.element('.leaflet-popup-close-button')[0].click();
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
						var mapSizeTemplate = '<div class="leaflet-control-map-size-toggle leaflet-bar leaflet-control">';
						mapSizeTemplate += '<div class="map-size-drop-down">';
						mapSizeTemplate += '<div class="icon-arrow flyout-trigger" ng-click="toggleMapSizeDropDown()"><span class="icon-search_map"></span></div>';
						mapSizeTemplate += '<div class="flyout"><div class="arrow"></div><div class="flyout_inner">';
						mapSizeTemplate += '<ul><li><a href="javascript:;" ng-click="switchMap(\'large\')">Large map</a></li>';
						mapSizeTemplate += '<li><a href="javascript:;" ng-click="switchMap(\'small\')">Small map</a></li>';
						mapSizeTemplate += '<li><a href="javascript:;" ng-click="switchMap(\'no\')">No map</a></li>';
						mapSizeTemplate += '</ul></div></div></div></div>';

						return $compile($(mapSizeTemplate))($scope)[0];
					};

					$scope.controls.custom.push(mapSizeControl);
				};

				if ($attrs.control) {
					$scope.addMapSizeToggleControl();
				}

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
					}
				});

				$scope.$watch('selectedDrawingType', function(){
					_triggerDrawingTool();
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

				function _triggerDrawingTool() {
					if (angular.isDefined($scope.selectedDrawingType)) {
						$scope.selectedDrawingType = $scope.selectedDrawingType.toLowerCase();
					}
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

				$scope.preventDoubleClick = function(event) {
					event.stopPropagation();
				};

				$scope.cancelDraw = function(event) {
					_cancelDraw();
					event.preventDefault();
					$('.voyager-pan').addClass('selected').parents('.leaflet-control').siblings().find('a').not('#searchByMap').removeClass('selected');
				};

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