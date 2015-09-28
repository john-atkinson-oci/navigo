/*global angular, _, L, $ */
// this controller wraps the search map directive - TODO: refactor - its confusing since the direcive has its own controller method
angular.module('voyager.search')
    .controller('SearchMapCtrl', function ($scope, filterService, $location, searchService, $stateParams, mapUtil, usSpinnerService, $compile, $timeout, dialogs, config, leafletData, $analytics, mapServiceFactory, inView, heatmapService, $rootScope) {

        'use strict';
        var _points;
        var _searchBoundary;
        var _searchBoundaryLayer;
        var _resultsBoundary;
        var loaded = false;
        var layersControl = null;
        var layers = {};
        var addedLayer = false;
        var _geoGroup;
        var _cancelledDraw = false;
        var _geoHighlightLayer;


        $scope.hasMapError = config.hasMapError;
        $rootScope.$on('SELECTED_DRAWING_TYPE_CHANGED', function(event, args){
            $scope.selectedDrawingType = args;
        });
        $scope.selectedDrawingType = ($location.search())['place.op'] === 'intersects' ? 'Intersects' : 'Within';

        leafletData.getMap('search-map').then(function(map) {
            $scope.map = map;
        });

        function _compileLayersControl() {
            var elem = $('.leaflet-control-layers-overlays');
            $compile(elem.contents())($scope);
            $('.leaflet-control-layers .leaflet-control-layers-toggle').addClass('icon-map_layers').parents('.leaflet-right').removeClass('leaflet-top').addClass('leaflet-bottom leaflet-bottom-search');
        }

        $scope.removeLayer = function (layerName) {
            if (layersControl !== null && angular.isDefined(layers[layerName])) {
                var layer = layers[layerName];
                delete layers[layerName];
                layersControl.removeLayer(layer);
                $scope.map.removeLayer(layer);

                if(layerName === 'Place') {
                    $location.search('place', null);
                    $location.search('place.op', null);
                    $location.search('place.id', null);
                    $scope.$emit('removeFilterEvent', {isBbox:true});  //fire filter event
                }
                if (_.isEmpty(layers)) {
                    $scope.map.removeControl(layersControl);
                    layersControl = null;
                    delete $scope.map.currentBounds;
                } else {
                    //recompile after dom change
                    _compileLayersControl();
                }
            }
        };

        function _addToLayerControl(layer, map, mapInfo, permanent) {
            addedLayer = true;
            layers[mapInfo.mapKey] = layer;
            if (layersControl === null) {
                layersControl = L.control.layers(null, null).addTo(map);
            }

            var template = ' <a class="btn btn-xs" style="cursor: pointer;" ng-click="removeLayer(\'' + mapInfo.mapKey + '\')">X</a>';
            if(permanent) {
                template = '';
            }
            layersControl.addOverlay(layer, mapInfo.mapKey + template);
            $timeout(function() {  //wait for scope to digest so control is added to leaflet
                _compileLayersControl();
            });
        }

        function _addBbox(map, bbox, type) {
            _searchBoundaryLayer = mapUtil.drawBBox(map, bbox, false, type);
            _points = _searchBoundaryLayer.getLatLngs();
            if(angular.isUndefined($stateParams.vw)) {
                $timeout(function () {  //workaround for leaflet bug:  https://github.com/Leaflet/Leaflet/issues/2021
                    mapUtil.fitToBBox(map,bbox, true);
                }, 200);
            }
        }

        function _removeSearchBoundary() {
            if(layersControl) {
                delete layers.Place;
                layersControl.removeLayer(_searchBoundaryLayer);
            }
            $scope.map.removeLayer(_searchBoundaryLayer);
            _searchBoundaryLayer = null;
            if (_.isEmpty(layers) && layersControl) {
                $scope.map.removeControl(layersControl);
                layersControl = null;
                delete $scope.map.currentBounds;
            } else if(layersControl) {
                //recompile after dom change
                _compileLayersControl();
            }
            $scope.map.currentBounds = null;
        }

        $scope.$on('clearBbox', function () {
            if(_searchBoundaryLayer) {
                _removeSearchBoundary();
            }
        });

        $scope.$on('addToMap', function () {
            if (angular.isDefined(layers[$scope.mapInfo.name])) {
                return;
            }
            usSpinnerService.spin('map-spinner');
            $scope.addToMap();
        });

        $scope.$on('addBbox', function () {
            if (_searchBoundaryLayer) {  //remove existing
                _removeSearchBoundary();
            }
            _searchBoundary = filterService.getBounds();
            var searchBoundaryType = filterService.getBoundsType();
            //console.log(_searchBoundary);
            if(angular.isDefined(_searchBoundary) && _searchBoundary !== null) {
                _addBbox($scope.map, _searchBoundary, searchBoundaryType);
            } else {
                $scope.map.setView([config.mapDefault.lat, config.mapDefault.lng], config.mapDefault.zoom);
            }
        });

        function _addGeoJson(docs) {
            if(_geoGroup) {
                $scope.map.removeLayer(_geoGroup);
                _geoGroup = null;
            }
            var boxes = [];
            _.each(docs, function(doc) {
                if (angular.isDefined(doc.geo)) {
                    boxes.push(mapUtil.getGeoJson(doc.geo));
                }
            });
            if(boxes.length > 0) {
                _geoGroup = L.featureGroup(boxes);
                _geoGroup.vgCount = boxes.length;
                $scope.map.addLayer(_geoGroup);
            }
        }

        inView.setViewObserver(_addGeoJson);

        $scope.$on('searchResults', function (event, results) {
            if (results.scrolled === true) {  //ignore when scrolling
                return;
            }

            if(results.placefinder && results.placefinder.match) {
                if (_searchBoundaryLayer) {
                    _removeSearchBoundary();
                }
                var place = results.placefinder.match;
                _searchBoundary = place.extent.join(' ');
                _searchBoundaryLayer = mapUtil.drawGeoJson($scope.map, place.geo, true, results.placefinder.search.op);
                _addToLayerControl(_searchBoundaryLayer, $scope.map, {mapKey:'Place'});
            } else if(_searchBoundaryLayer) {  //if no place remove the search boundary layer
                _removeSearchBoundary();
                if (angular.isDefined(results['extent.bbox'])) {
                    _resultsBoundary = results['extent.bbox'];
                    mapUtil.fitToBBox($scope.map, _resultsBoundary);
                }
            } else if (angular.isDefined(results['extent.bbox'])) {
                _resultsBoundary = results['extent.bbox'];
                mapUtil.fitToBBox($scope.map, _resultsBoundary);
            } else {
                _searchBoundary = null;
                _resultsBoundary = null;
            }

            //TODO only show what is in the viewport?
            _addGeoJson(results.response.docs);
        });

        function _showError(error) {
            var message = null;
            if(angular.isDefined(error.details)) {
                message = error.details[0];
            }
            dialogs.error(error.message, message);
        }

        $scope.addToMap = function () {
            addedLayer = true;

            $scope.map.invalidateSize(false);  //workaround when initially hidden

            var mapService = mapServiceFactory.getMapService($scope.mapInfo);
            mapService.addToMap($scope.mapInfo, $scope.map).then(function (layer) {
                $scope.mapInfo.mapKey = $scope.mapInfo.name.replace(/'/g, '');
                if (layer.isValid !== false) {
                    loaded = false;
                    layer.on('loading', function () {
                        if(loaded === false) {
                            usSpinnerService.spin('map-spinner');
                        }
                    });
                    _addToLayerControl(layer, $scope.map, $scope.mapInfo);
                    usSpinnerService.stop('map-spinner');
                    layer.on('load', function () {
                        loaded = true;
                        usSpinnerService.stop('map-spinner');
                    });
                    $analytics.eventTrack('addToMap', {
                        category: 'results', label: $scope.mapInfo.format // jshint ignore:line
                    });
                } else {
                    usSpinnerService.stop('map-spinner');
                    $analytics.eventTrack('addToMap', {
                        category: 'error', label: $scope.mapInfo.format // jshint ignore:line
                    });
                    _showError(layer.error);
                }
            }, function (error) {
                usSpinnerService.stop('map-spinner');
                $analytics.eventTrack('addToMap', {
                    category: 'error', label: $scope.mapInfo.format // jshint ignore:line
                });
                _showError(error.error);
            });
        };

        $scope.$watch('map',function(old) {  //fires when map is created in directive

            if(angular.isUndefined(old)) {
                return;
            }

            $scope.map.on('overlayadd', function (e) {
                //html is added dynamically by leaflet so need to compile it here
                _compileLayersControl();
                e.target.fitBounds(e.layer.bounds);
            });

            $scope.map.on('layeradd', function () {
                if (addedLayer) {
                    addedLayer = false;
                    //html is added dynamically by leaflet so need to compile it here
                    _compileLayersControl();
                }
            });

            $scope.map.on('draw:drawstart', function () {
//                if (_searchBoundaryLayer) {  //remove existing
//                    $scope.map.removeLayer(_searchBoundaryLayer);
//                    _searchBoundaryLayer = null;
//                }
                _cancelledDraw = false;
            });

            $scope.map.on('draw:drawstop', function () {
                $timeout(function() {  //wait for scope digest
                    if (!_cancelledDraw) {
                        if (_searchBoundaryLayer) {  //remove existing
                            _removeSearchBoundary();
                        }

                        //update url params
                        $location.search('place', $scope._bbox);
                        var placeType = $scope.selectedDrawingType.toLowerCase();
                        $location.search('place.op', placeType);
                        var point = $scope.map.getCenter();
                        var vw = point.lng + ' ' + point.lat + ' ' + $scope.map.getZoom();
                        $location.search('vw', vw);
                        searchService.setMapView(vw);

                        //search controller will capture this event and fire a search
                        $scope.$emit('bboxChangeEvent', {'bbox': $scope._bbox, 'bboxt': placeType, 'vw': vw, 'place':$scope._bbox, 'place.op':placeType});
                    }
                });

            });

            $scope.$on('cancelledDraw', function() {
                _cancelledDraw = true;
            });

            $scope.map.on('draw:created', function (e) {
                _cancelledDraw = false;
                if ($scope.toolType === 'point') {
                    _points = e.layer.getLatLng();
                    _searchBoundary = e.layer.getLatLng();
                }
                else {
                    _points = e.layer.getLatLngs();
                    _searchBoundary = e.layer.getBounds().toBBoxString();
                }
            });

            //@TODO: add search on map move feature
            // $scope.map.on('dragend', function (e){
            //     if ($scope.moveMapOption.value) {
            //         $scope.$emit('searchEvent', {});
            //     }
            // });

            $scope.$on('resultHover', function(evt, data) {
                if (!_geoHighlightLayer) {
                    _geoHighlightLayer = L.geoJson(null, {
                        style: {
                            color: '#e6e600',
                            weight: 6,
                            fill: true
                        },
                        pointToLayer: function(f, ll) {
                            return L.circleMarker(ll, {
                                radius: 6,
                                color: '#e6e600',
                                fillOpacity: 0.65
                            });
                        }
                    }).addTo($scope.map);
                }

                if (data.doc && data.doc.geo) {
                    try {
                        _geoHighlightLayer.addData(data.doc.geo);
                    } catch(err) {
                        console.log('WARNING: failed adding geojson layer to search map');
                    }
                }
                else {
                    _geoHighlightLayer.clearLayers();
                }
            });

            // set up the heatmap layer, but first check there is actual data to
            // render (ie. the geo field is configured and populated)
            heatmapService.fetch('-180,-90,180,90', 1).then(function(hm) {
                if (!_.isEmpty(hm.counts_ints2D)) {
                    var heatmapLayer = heatmapService.init($scope.map);
                    _addToLayerControl(heatmapLayer, $scope.map, {mapKey: 'Heatmap'}, true);
                }
            });
        });

        $scope.$on('filterChanged', function() {
            var params = _.pick($location.search(), function(val, key) {
                return 'q' === key || 'fq' === key || key.indexOf('place') === 0;
            });
            heatmapService.filter(params);

        });
    });