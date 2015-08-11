/*global angular, $, L */

angular.module('voyager.map').
    factory('mapControls', function ($compile, leafletData, mapUtil, configService) {
        'use strict';

        var container = '<div class="leaflet-bar leaflet-draw-toolbar">';
        var rectangle = '<a class="leaflet-draw-draw-rectangle" id="clip-rectangle" target="_self" ng-click="startDraw($event)" title="Clip Rectangle" style="cursor: pointer;"></a>';
        var polygon = '<a class="leaflet-draw-draw-polygon" id="clip-polygon" target="_self" ng-click="startDraw($event)" title="Clip Polygon" style="cursor: pointer;"></a>';
        var endContainer = '</div>';

        var zoomContainer = '<div class="leaflet-control-zoom leaflet-bar leaflet-control">';
        var zoomIn = '<a class="leaflet-control-zoom-in {{zoomInClass}}" href="#" ng-click="zoomIn($event)" ng-dblClick="preventDoubleClick($event)" title="Zoom in" style="cursor: pointer;">+</a>';
        var pan = '<a class="voyager-pan" ng-click="cancelDraw($event)" title="Pan"><span class="icon-map_pan"><span class="path1"></span><span class="path2"></span></span></a>';
        var zoomOut = '<a class="leaflet-control-zoom-out {{zoomOutClass}}" href="#" ng-click="zoomOut($event)" ng-dblClick="preventDoubleClick($event)" title="Zoom out" style="cursor: pointer;">-</a>';
        var defaultExtent = '<a class="voyager-default-extent" id="default-extent" ng-click="defaultExtent($event)" title="Default Extent" style="cursor: pointer;"><span class="glyphicon glyphicon-home"></span></a>';

        var _bbox;
        var _bounds;
        var _extent = configService.getDefaultMapView();

        function _getControls(template, $scope) {
            var controls = L.control();
            controls.setPosition('topleft');
            controls.onAdd = function () {
                return $compile($(template))($scope)[0];
            };
            return controls;
        }

        function _toggleState(map, $scope, zoomLevel) {
            if (zoomLevel === undefined) {
                zoomLevel = map.getZoom();
            }

            if(zoomLevel === map.getMaxZoom()) {
                $scope.zoomInClass = 'leaflet-disabled';
            } else {
                $scope.zoomInClass = '';
            }

            if(zoomLevel === map.getMinZoom()) {
                $scope.zoomOutClass = 'leaflet-disabled';
            } else {
                $scope.zoomOutClass = '';
            }
        }

        return {
            setBbox: function(val) {
                _bbox = val;
            },
            setBounds: function(bounds) {
                _bounds = bounds;
            },
            init: function($scope, mapId) {
                $scope.zoomOutClass = '';
                $scope.zoomInClass = '';
                _bbox = null;
                _bounds = null;

                $scope.zoomIn = function(e) {
                    e.preventDefault();
                    leafletData.getMap(mapId).then(function (map) {
                        var zoomLevel = map.getZoom();
                        if (zoomLevel < map.getMaxZoom()) {
                            map.zoomIn();
                            _toggleState(map, $scope, zoomLevel + 1);
                        }
                    });
                    $('.leaflet-draw-actions').hide();
                    $('.voyager-draw-intersect').removeClass('selected');
                };

                $scope.zoomOut = function(e) {
                    e.preventDefault();
                    leafletData.getMap(mapId).then(function (map) {
                        var zoomLevel = map.getZoom();
                        if (zoomLevel > map.getMinZoom()) {
                            map.zoomOut();
                            _toggleState(map, $scope, zoomLevel - 1);
                        }
                    });
                    $('.leaflet-draw-actions').hide();
                    $('.voyager-draw-intersect').removeClass('selected');
                };

                $scope.defaultExtent = function (e) {
                    leafletData.getMap(mapId).then(function (map) {
                        if (_bbox) {
                            mapUtil.fitToBBox(map, _bbox);
                        } else if (_bounds) {
                            map.fitBounds(_bounds);
                        } else {
                            map.setView([_extent.lat, _extent.lng], _extent.zoom);
                        }
                    });
                };

                $scope.startDraw = function(e) {mapUtil.startDraw(e,mapId);};

                $scope.preventDoubleClick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                };

                $scope.cancelDraw = function(e) {
                    e.preventDefault();
                    $scope.$emit('cancelledDraw');
                };
            },

            getClipControls: function (withPolygon, $scope) {
                var template = container + rectangle;
                if (withPolygon) {
                    template += polygon;
                }
                template += endContainer;
                return _getControls(template, $scope);
            },

            getZoomControls: function ($scope) {
                var template = zoomContainer + zoomIn + zoomOut + defaultExtent;
                if ($scope.showPan) {
                    template += pan;
                }
                return _getControls(template, $scope);
            },

            toggleState: function(map, $scope) {
                _toggleState(map, $scope);
            }
        };

    });