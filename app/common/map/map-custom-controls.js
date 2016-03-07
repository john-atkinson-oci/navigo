/*global angular, $, L */

angular.module('voyager.map').
    factory('mapCustomControls', function (config, $http) {
        'use strict';

        var dropdown = '<div class="hover_flyout" style="display: inline">';
        dropdown += '<span style="font-weight: bold; font-size: 15px; padding-right: 5px">{{buffer.measure}}</span>';
        dropdown += '<a href="javascript:;" class="fa fa-chevron-down underline flyout_trigger"></a>';
        dropdown += '<div class="flyout user_flyout">';
        dropdown += '<div class="arrow"></div>';
        dropdown += '<div class="flyout_inner">';
        dropdown += '<ul>';
        dropdown += '<li ng-repeat="type in ::bufferMeasures" role="menuitem"><a href="javascript:;" ng-click="buffer.measure = type.id">{{::type.text}}</a></li>';
        dropdown += '</ul></div></div></div>';

       function _bufferTemplate() {
            var markup = '<div class="buffer-option" style="min-width: 145px">';
            markup += '<form name="bufferOption">';
            markup += '<div class="buffer-content"><div class="buffer-label semi">Buffer distance</div>';
            markup += '<div style="white-space: nowrap;">';
            markup += '<input type="text" ng-model="buffer.distance" style="float: left"/>';
            //markup += '<select ui-select2="{dropdownAutoWidth: \'true\', minimumResultsForSearch: -1}" ng-model="buffer.measure">';
            //markup += '<option ng-repeat="type in ::bufferMeasures" value="{{::type.id}}">{{::type.text}}</option>';
            //markup += '</select></div>';
           markup += dropdown;
           markup += '</div>';
            markup += '<div class="buffer-footer">';
            markup += '<input type="submit" value="Done" class="btn btn-primary" ng-click="addBuffer()" style="width: 70px; padding-left: 15px"/>';
            markup += '<a href="#" ng-click="bufferCancel($event)" class="link_secondary">Cancel</a>';
            markup += '</div>';
            markup += '</form>';
            markup += '</div>';

            return markup;
        }

        function _drawingToolTemplate() {
            var template = '<div class="leaflet-draw-section"><div class="leaflet-bar">';
            template += '<a class="voyager-draw-rect" ng-class="{\'selected\': _drawing}" ng-mouseover="toggleDrawingOption($event)" ng-mouseleave="toggleDrawingTools(false)"><i class="icon-map_draw_{{toolType}}"></i></a>';
            template += '</div>';
            template += '<div class="leaflet-bar drawing-option-cont" ng-if="showDrawingTools" ng-mouseover="toggleDrawingTools(true)" ng-mouseleave="toggleDrawingTools(false)">';
            template += '<ul id="drawingTools">';
            template += '<li><a ng-click="selectDrawingTool($event, \'rectangle\')" title="Rectangle"><i class="icon-map_draw_rectangle"></i></a></li>';
            template += '<li><a ng-click="selectDrawingTool($event, \'polygon\')" title="Polygon"><i class="icon-map_draw_polygon"></i></a></li>';
            template += '<li><a ng-click="selectDrawingTool($event, \'polyline\')" title="Line"><i class="icon-map_draw_polyline"></i></a></li>';
            template += '<li><a ng-click="selectDrawingTool($event, \'point\')" title="Marker"><i class="icon-map_draw_point"></i></a></li>';
            template += '</ul>';
            template += '</div></div>';

            return template;
        }

        return {
            getBufferTemplate: function() {
                return _bufferTemplate();
            },
            getDrawingToolTemplate: function() {
                return _drawingToolTemplate();
            },
            convertBuffer: function(buffer, geoJSON) {
                return $http.post(config.root + 'api/rest/spatial/buffer?diff=true&distance=' + buffer.distance + '&units=' + buffer.measure, geoJSON);
            }
        };

    });