/*global angular, $, _, alert, L */
angular.module('voyager.map').
    factory('simpleFeatureServer', function (config, converter, $q) {
        'use strict';

        var _loaded = true;

        function _addFeatureServiceLayer(map, mapInfo) {
            var layer = null;
            var layerCount = 1;
            if (angular.isDefined(mapInfo.linkcount__children)) {
                layerCount = mapInfo.linkcount__children;
            }
            if (mapInfo.isLayer) {
                layer = new L.esri.Services.featureLayerService({url:mapInfo.path}).addTo(map);
            } else {  //add each layer to map
                $.each(new Array(layerCount), function (index, value) {
                    var url = mapInfo.path + "/" + index;
                    layer = new L.esri.FeatureLayer({url:url}).addTo(map);
                });
            }
            //move to last layer TODO replace with zoom to provided bbox?
            layer.on('load', function () {  //wait until loaded until moving
                if (!_loaded) {
                    _loaded = true;
                    layer.query().bounds(function (error, latlngbounds) {
                        layer.bounds = latlngbounds;
                        map.fitBounds(latlngbounds);
                        map.currentBounds = latlngbounds;
                    });
                }
            });
            return layer;  //TODO - bug - should return all layers so the TOC control shows all of them and they can all be removed
        }

        return {
            addToMap: function (mapInfo, map) {
                _loaded = false;
                var layer = _addFeatureServiceLayer(map, mapInfo);
                return $q.when(layer);
            }
        };

    });