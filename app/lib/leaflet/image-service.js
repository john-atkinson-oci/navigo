/*global L */

L.AgsImageLayer = L.Class.extend({
    includes: L.Mixin.Events,

    options: {
        minZoom: 0,
        maxZoom: 18,
        attribution: '',
        opacity: 1,
        format: 'PNG8',
        bandids: '',
        compressionquality: 0,
        interpolation: 'RSP_NearestNeighbor',
        pixelType: 'U8',

        unloadInvisibleTiles: L.Browser.mobileWebkit
    },

    initialize: function (/*String*/url, /*Object*/options) {
        L.Util.setOptions(this, options);
        this._url = url;
    },

    //public properties that modify the map

    setInterpolation: function (interpolation) {
        this.options.interpolation = interpolation;
    },

    getInterpolation: function () {
        return this.options.interpolation;
    },

    bringToFront: function () {
        if (this._image) {
            this._map._panes.overlayPane.appendChild(this._image);
        }
        return this;
    },

    setOpacity: function (opacity) {
        //set it immediately
        if (this._image) {
            this._image.style.opacity = opacity;
            // stupid webkit hack to force redrawing of tiles
            this._image.style.webkitTransform += ' translate(0,0)';
        }
        this.options.opacity = opacity;
    },

    getOpacity: function () {
        return this.options.opacity;
    },

    reset: function () {
        this._reset();
    },

    update: function () {
//        var topLeft = this._map.latLngToLayerPoint(this._map.getBounds().getNorthWest()),
//                bottomRight = this._map.latLngToLayerPoint(this._map.getBounds().getSouthEast()),
//                size = bottomRight.subtract(topLeft);

//        L.DomUtil.setPosition(this._image, topLeft);
//        this._image.style.width = size.x + 'px';
//        this._image.style.height = size.y + 'px';

        this._image.updating = false;
        this._updateLayer();
    },

    show: function () {
        this._image.style.display = 'block';
        this._image.style.visibility = 'visible';
    },

    hide: function () {
        this._image.style.display = 'none';
    },

    isVisible: function () {
        return this._image.style.display === 'block';
    },

    onAdd: function (map) {
        this._map = map;

        this._reset();

        map.on('viewreset', this._reset, this);
        map.on('moveend', this._moveEnd, this);
        map.on('zoomend', this._zoomEnd, this);
    },

    onRemove: function (map) {
       // map.getPanes().mapPane.removeChild(this._image);
        this._map._panes.overlayPane.removeChild(this._image);
        map.off('viewreset', this._reset, this);
        map.off('moveend', this._moveEnd, this);
        map.off('zoomend', this._zoomEnd, this);
    },

    _initImage: function () {
        this._image = L.DomUtil.create('img', 'leaflet-image-layer');

        this._image.style.visibility = 'hidden';
        this._image.style.opacity = this.options.opacity;
        this._image.style.display = 'block';
        //TODO createImage util method to remove duplication
        L.Util.extend(this._image, {
            onselectstart: L.Util.falseFn,
            onmousemove: L.Util.falseFn,
            onload: this._onImageLoad,
            src: this._getImageUrl(),
            updating: false,
            agsLayer: this,
            map: this._map
        });
        //this._map.getPanes().mapPane.appendChild(this._image);
        this._map._panes.overlayPane.appendChild(this._image);
    },

    _getImageUrl: function () {
        //construct the export image url
        var bnds = this._map.getBounds();
        var sz = this._map.getSize();
        //bboxsr &amp; imagesr params need to be specified like so to avoid alignment problems on some map services - not sure why
        var bbox = 'bbox=' + bnds.getSouthEast().lng + '%2C' + bnds.getSouthEast().lat + '%2C' + bnds.getNorthWest().lng + '%2C' + bnds.getNorthWest().lat + '&bboxsr=4326&imageSR=3857';
        var size = '&size=' + sz.x + '%2C' + sz.y;
        var format = '&format=' + this.options.format;
        var pixeltype = '&pixelType=' + this.options.pixelType;
        var interpolation = '&interpolation=' + this.options.interpolation;
        //Some of the following parameters are supported by ArcGIS Server Image Services but not implemented here.
        //They have been included as placeholders.
        var nodata = '&noData=';
        var compressionquality = '&compressionQuality=' + this.options.compressionquality;
        var bandids = '&bandIds=' + this.options.bandids;
        var mosaicprops = '&mosaicProperties=';
        var viewpointprops = '&viewpointProperties=';
        var url = this._url + '/exportImage?' + bbox + size + format + pixeltype + nodata + interpolation + compressionquality + bandids + mosaicprops + viewpointprops + '&f=image';
        return url; // this._url + '/export?' + bbox + size + layers + format + transparent + '&amp;f=image';
    },

    _updateLayer: function () {
        if (!this._image.updating) {
            //console.log('Updating layer NW: ' + map.getBounds().getNorthWest());
            this._image.updating = true;

            //update the src based on the new location
            this._image.src = this._getImageUrl();
            //reset the image location on the map
            //            //hang the info on the image, we'll actually update it onload to make sure we don't reposition it before the new image comes down
            //this doesn't seem to work on mobile
            //            this._image.topLeft = this._map.latLngToLayerPoint(this._map.getBounds().getNorthWest());
            //            var bottomRight = this._map.latLngToLayerPoint(this._map.getBounds().getSouthEast());
            //            this._image.size = bottomRight.subtract(this._image.topLeft);

            var topLeft = this._map.latLngToLayerPoint(this._map.getBounds().getNorthWest()),
                bottomRight = this._map.latLngToLayerPoint(this._map.getBounds().getSouthEast()),
                size = bottomRight.subtract(topLeft);
            L.DomUtil.setPosition(this._image, topLeft);
            this._image.style.width = size.x + 'px';
            this._image.style.height = size.y + 'px';
        }
    },

    _moveEnd: function () {
        //console.log('in _moveEnd : NW: ' + map.getBounds().getNorthWest());
        //don't set display:none for moves - makes for smoother panning - no flicker
        //oops, that didn't work on mobile


        this._image.style.display = 'none';
        this._updateLayer();
    },

    _zoomEnd: function () {
        //console.log('in _moveEnd');

        //        //zoom the image...(animate it?)
        //        //L.DomUtil.setPosition(this, this.topLeft);
        //        //debugger;
        //        //it's gonna be something like this but it's not quite right - also will need to get/ calculate the correct factor (using 1.5 below) and change it for zoom out
        //        //and we need to properly calculate the new left and top - just hard coded approximate values below
        //        this._image.style.left = '-420px';
        //        this._image.style.top = '-228px';
        //        this._image.style.width = this._image.width * 1.5 + 'px';
        //        this._image.style.height = this._image.height * 1.5 + 'px';


        //for now, we'll just do this
        this._image.style.display = 'none';
        this._updateLayer();
    },

    _reset: function () {
        if (this._image) {
//            var node = this._map.getPanes().mapPane;
//            //var child = $(node).children()
//            var img = $(node).find(this._image);
//            img.remove();
            this._map._panes.overlayPane.removeChild(this._image);
//            if (node.contains(this._image)) {
//                this._map.getPanes().mapPane.removeChild(this._image);
//            }
        }
        this._initImage();
        this._updateLayer();
    },

//    _reset: function () {
//        var image   = this._image,
//            topLeft = this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
//            size = this._map.latLngToLayerPoint(this._bounds.getSouthEast())._subtract(topLeft);
//
//        L.DomUtil.setPosition(image, topLeft);
//
//        image.style.width  = size.x + 'px';
//        image.style.height = size.y + 'px';
//    },

    _onImageLoad: function () {
        //        //reset the image location on the map - doing it this way does not seem to work on mobile
        //        L.DomUtil.setPosition(this, this.topLeft);
        //        this.style.width = this.size.x + 'px';
        //        this.style.height = this.size.y + 'px';


        //this is the image

        //make sure it's visible and reset the updating flag
        this.style.visibility = 'visible';
        this.style.display = 'block';
        this.updating = false;
    }
});