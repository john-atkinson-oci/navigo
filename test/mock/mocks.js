'use strict';

//var config = {fields:{data:{fields:[]}}};
config.fields = {data:{fields:[], FIELD:[], FIELD_DESCR:[]}};
config.fileFormats = {data:{VALUE:{format:''}}};
config.locations = {data:{VALUE:{location:''}}};
config.settings = {'data':{'display':{'fields':[{'name':'field'}]}}};
config.settings.data.pageElements = {showMap: true, showHeaderInfo: true};
config.settings.data.sorting = ['name'];
config.settings.data.filters = [];
config.settings.data.defaultView = 'card';
config.settings.data.details = {
	detailsTableFields : []
};
config.settings.data.listView = {fields :[{field: 'field', name: 'field'}]};

config.root = 'root/';
config.require = {locations:'api/rest/i18n/field/location.json'};
config.rawFields = {};
config.ui = {details:{}, list:{name:'Queue'}};
config.docActions = [
    {text:'Add to Queue', action:'add', visible:'canCart', toggle:'inCart', off:'Remove', onIcon:'icon-plus', offIcon:'icon-x'},
    {text:'Download', action:'download', visible:'hasDownload', alt:'Open'},
    {text:'Open in Map Viewer', action:'open', visible:'isService', url:'http://voyagerdemo.com/voyagerwidget/'},
    {text:'Open in ArcMap', action:'openArcMap', visible:'isEsriLayer'}
];
config.pageElements = {showMap: true};
//config.settings.data.showFederatedSerach = true;
config.homepage.bannerHTML = 'banner';

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

        },

        dragging: {
            disable: function() {}
        },

        doubleClickZoom: {
            disable: function() {}
        },

        scrollWheelZoom: {
            disable: function() {}
        },

        options: {
            minZoom:0
        }
    };
}

$(document.body).append('<div id="map" />');  //so we can trigger events wired
var map = $('#map');
map = $.extend(map,new LeafletMapMock());

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function ResponseMocks(){
    return {
        mockSavedSearchesResponse : {
            'responseHeader': {
                'status': 0,
                'QTime': 0,
                'params': { 'rand': '0.03541157837025821', 'json.wrf': 'angular.callbacks._4', 'rows': '150', 'wt': 'json' }
            },
            'security': [ 'query', 'share:(_EVERYONE _LOGGEDIN _ADMIN) OR owner:admin' ],
            'response': {
                'numFound': 17,
                'start': 0,
                'docs': [
                    { 'id': 'S1511B388E58', 'title': 'Voyager Default View', 'description': 'Voyager\'s default settings', 'owner': 'admin', 'path': '/disp=e93d0356/', 'share': [ '_EVERYONE' ], 'order': 1427453990000, 'saved': '2013-09-16T19:17:26Z', 'private': false, 'config': 'e93d0356', 'view': 'SUMMARY', 'query': '', '_version_': 1518191975143047200},
                    { 'id': 'S1511B388E57', 'title': 'Raster Properties', 'description': 'List of raster images with assorted properties.', 'owner': 'admin', 'path': '/f.geometry_type=Raster/view=GRID/disp=c13b4edb/', 'share': ['_EVERYONE'],'order': 1427453980000,'saved': '2010-07-21T22:25:45Z','private': false,'config': 'c13b4edb','view': 'GRID','param_fq': ['geometry_type:Raster'],'query': 'fq=geometry_type:Raster&', '_version_': 1518191974979469300 }
                ]
            }
        } 
    }
}

