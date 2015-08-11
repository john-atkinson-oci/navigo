/*global angular, $, _, alert, L */
'use strict';
angular.module('voyager.map').
    factory('mapServiceFactory', function (config, converter, $q, simpleMapService, mapService, simpleFeatureServer, simpleWmsService) {

        var mappable = {'application/x-arcgis-image-server': true, 'application/x-arcgis-feature-server': true, 'application/x-arcgis-feature-server-layer': true, 'application/x-arcgis-map-server': true, 'application/x-arcgis-map-server-layer': true, 'application/vnd.ogc.wms_xml': true, 'application/vnd.ogc.wms_layer_xml': true};

        function _getRootPath(mapInfo) {
            var path = mapInfo.path;
            var index = path.lastIndexOf('/');
            var root = path.substring(0, index + 1);
            var layer = path.substring(index + 1, path.length);
            mapInfo.root = root;
            mapInfo.layer = layer;
        }

        return {
            getMapService: function (mapInfo) {
                mapInfo.path = mapInfo.path.replace(/\+/g, '%20');
                mapInfo.root = mapInfo.path;
                if (mapInfo.format.indexOf('layer') > -1) {
                    mapInfo.isLayer = true;
                    _getRootPath(mapInfo);
                }
                if (mapInfo.format.indexOf('application/x-arcgis-map-server') > -1 || mapInfo.format.indexOf('application/x-arcgis-image-server') > -1) {
                    if(angular.isDefined(mapInfo.bbox)) {
                        return simpleMapService;
                    } else {
                        return mapService;  //queries the map service to get the spatial reference and extent
                    }
                } else if (mapInfo.format.indexOf('application/x-arcgis-feature-server') > -1) {
                    if(angular.isDefined(mapInfo.linkcount__children)) {
                        return simpleFeatureServer;
                    } else {
                        return mapService;  //queries the map service to get the spatial reference and extent
                    }
                } else if (mapInfo.format.indexOf('application/vnd.ogc.wms') > -1) {
                    if(angular.isDefined(mapInfo.bbox)) {
                        return simpleWmsService;
                    } else {
                        return mapService;  //queries the map service to get the spatial reference and extent
                    }
                } else {
                    return {'isValid': false, 'error': 'Not Supported'};
                }
            },

            isMappable: function (format) {
                return mappable[format];
            }
        };

    });