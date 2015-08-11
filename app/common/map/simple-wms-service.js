'use strict';
angular.module('voyager.map').
    factory('simpleWmsService', function (config, converter, $q, mapUtil, wmsLayerQuery) {

        var loaded = true;

        function _moveToExtent(map, layer, mapInfo) {
            var bounds = mapUtil.getBounds(mapInfo.bbox);
            layer.bounds = bounds;
            map.fitBounds(bounds);
            map.currentBounds = bounds;
        }

        function _addLayer(map, mapInfo) {

            var urlInfo = mapInfo.path.split('?');

            var layers = mapInfo.wms_layer_name;
            if(mapInfo.layerNames) {
                layers = mapInfo.layerNames;
            }
            var layer = L.tileLayer.wms(urlInfo[0], {
                layers: layers,
                format: 'image/png',
                transparent: true
            });

            layer.on('load', function () {  //wait until loaded until moving
                if (!loaded) {
                    loaded = true;
                }
            });

            layer.addTo(map);

            _moveToExtent(map, layer, mapInfo);

            return layer;
        }

        return {
            addToMap: function (mapInfo, map) {
                loaded = false;
                if(mapInfo.contains_name) {  //is service
                    return wmsLayerQuery.execute(mapInfo.id).then(function(layerNames) {
                        layerNames = layerNames.slice(0,10);  //limit layers on leaflet
                        mapInfo.layerNames = layerNames.join();
                        return _addLayer(map, mapInfo);
                    });
                } else {
                    var layer = _addLayer(map, mapInfo);
                    return $q.when(layer);  //this interface expects a promise
                }
            }
        };

    });