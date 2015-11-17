'use strict';

//var config = {fields:{data:{fields:[]}}};
config.fields = {data:{fields:[], FIELD:[], FIELD_DESCR:[]}};
config.fileFormats = {data:{VALUE:{format:''}}};
config.locations = {data:{VALUE:{location:''}}};
config.settings = {'data':{'display':{'fields':[{'name':'field'}]}}};
config.settings.data.filters = [];
config.root = 'root/';
config.require = {locations:'api/rest/i18n/field/location.json'};
config.rawFields = {};
config.ui = {details:{}, list:{name:'Queue'}};
config.docActions = [
    {text:'Add to Queue', action:'add', visible:'canCart', toggle:'inCart', off:'Remove', onIcon:'icon-plus', offIcon:'icon-x'},
    {text:'Download', action:'download', visible:'hasDownload', alt:'Open'},
    {text:'Open in Map Viewer', action:'open', visible:'isService', url:'http://voyagerdemo.com/voyagerwidget/'},
    {text:'Open in ArcMap', action:'openArcMap', visible:'isEsriLayer'}
]
//config.settings.data.showFederatedSerach = true;

var bounds = {};
bounds.toBBoxString = function() {return '0,0,0,0';};
bounds.getCenter = function() {return {'lat':0,'lng':0};};

function LeafletMapMock() {

    return {
        fitBounds: function() {
        },

        getBounds: function() {
            return bounds;
        },

        addLayer: function() {
        },

        removeLayer: function() {
        },

        getZoom: function() {
            return 0;
        },

        getMaxZoom: function() {
            return 10;
        },

        getMinZoom: function() {
            return 1;
        },

        getContainer: function() {
            return "<div style='height: 100px'></div>";
        },

        panTo: function() {

        },

        invalidateSize : function() {

        },

        setView: function() {

        },

        getCenter: function() {
            return 0;
        },

        removeControl: function() {

        }
    };
}

$(document.body).append('<div id="map" />');  //so we can trigger events wired
var map = $('#map');
map = $.extend(map,new LeafletMapMock());

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}