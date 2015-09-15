/*global angular, $, _, alert, L */
'use strict';
angular.module('voyager.map').
    factory('simpleMapService', function (mapUtil, $q) {

        var loaded = true;

        function _getOptions(mapInfo) {
            var options = {};
            options.url = mapInfo.root;
            if (mapInfo.isLayer) {
                options.layers = [mapInfo.layer];
            }
            return options;
        }

        function _createDynamicLayer(map, mapInfo, spatialReference) {
            var layer = L.esri.dynamicMapLayer(_getOptions(mapInfo));
            layer.addTo(map);

//            if (spatialReference.wkid !== 102100 && spatialReference.wkid !== 102113) {
//                //workaround for old servers that don't support leaflet's default projection
//                layer.options.bboxSR = 102100;
//                layer.options.imageSR = 102100;
//                layer._update(); // private method but will be exposed in the next version.
//            }
            return layer;
        }

        function _createTiledLayer(map, mapInfo) {
            var layer = L.esri.tiledMapLayer(_getOptions(mapInfo));
            layer.addTo(map);
            return layer;
        }

        function _createImageLayer(map, mapInfo, spatialReference) {
            var layer = new L.esri.imageMapLayer({
                url: mapInfo.path
            });
            map.addLayer(layer);
            return layer;
        }

        function _moveToExtent(map, layer, mapInfo) {
            var bounds = mapUtil.getBounds(mapInfo.bbox);
            layer.bounds = bounds;
            map.fitBounds(bounds);
            map.currentBounds = bounds;
        }

        function _addMapServerLayer(map, mapInfo) {
            var layer;  //, spatialReference = _getSpatialReference(data);
            if (mapInfo.format.indexOf('application/x-arcgis-image-server') > -1) {
                layer = _createImageLayer(map, mapInfo);
            } else {
                if (mapInfo.ags_fused_cache === true) {
                    layer = _createTiledLayer(map, mapInfo);
                } else {
                    layer = _createDynamicLayer(map, mapInfo);
                }
            }
            _moveToExtent(map, layer, mapInfo);
            return layer;
        }

        return {
            addToMap: function (mapInfo, map) {
                loaded = false;
                var layer = _addMapServerLayer(map, mapInfo);
                return $q.when(layer);  //this interface expects a promise
            }
        };

    });