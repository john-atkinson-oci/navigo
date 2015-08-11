'use strict';
angular.module('voyager.heatmap')
    .service('colorizer', function() {

        function toHex(c) {
            var hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }

        /**
         * RGB constructor.
         *
         * @param {number} r The red value [0-255].
         * @param {number} g The green value [0-255].
         * @param {number} b The blue value [0-255].
         * @param {number} a The alpha value [0-1], defaults to 1.
         *
         */
        function RGB(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = angular.isDefined(a) ? a: 1;
            this.push(r, g, b, this.a);
        }
        RGB.prototype = new Array; // jshint ignore:line

        /**
         * Static method to create RGB instance from hex string.
         *
         * @param {string} hex 6 or 8 digit hex color string with optional '#'.
         *
         * @return {object} RGB instance.
         */
        RGB.fromHex = function(hex) {
            var res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
            return new RGB(
                parseInt(res[1], 16),
                parseInt(res[2], 16),
                parseInt(res[3], 16),
                typeof res[4] !== 'undefined' ? parseInt(res[4], 16)/255.0 : undefined
            );
        };

        /**
         * Returns the color as HSL.
         *
         * @return {object} HSL instance.
         */
        RGB.prototype.hsl = function() {
            var r = this.r/255;
            var g = this.g/255;
            var b = this.b/255;

            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2;

            if(max === min){
                h = s = 0; // achromatic
            }else{
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch(max){
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }

            return new HSL(h,s,l);
        };

        /**
         * Returns the color as a 6 digit hex string with '#'.
         *
         * @return {string} Hex color string.
         */
        RGB.prototype.hex = function() {
            return "#" + toHex(this.r) + toHex(this.g) + toHex(this.b);
        };

        /**
         * Returns the color as an rgba tuple.
         *
         * @return {string} Rgba color tuple.
         */
        RGB.prototype.rgba = function() {
            return 'rgba(' + this.join(',') + ')';
        };

        /**
         * Returns a new color with the specified opacity.
         *
         * @param {number} a Opacity value, [0-1].
         *
         * @return {object} RGB instance.
         */
        RGB.prototype.opacity = function(a) {
            return new RGB(this.r, this.g, this.b, a);
        };

        /**
         * Returns a new color with the specified opacity multiplied by the 
         * current opacity value.
         *
         * @param {number} a Opacity value, [0-1].
         *
         * @return {object} RGB instance.
         */
        RGB.prototype.opacify = function(a) {
            return new RGB(this.r, this.g, this.b, this.a * a);
        };

        /**
         * HSL constructor.
         *
         * @param {number} h The hue value as a fraction of 360 degrees [0-1].
         * @param {number} s The saturation value as a percentage [0-1].
         * @param {number} l The lightness value as a percentage [0-1].
         */
        function HSL(h,s,l) {
            this.h = h;
            this.s = s;
            this.l = l;
            this.push(h,s,l);
        }
        HSL.prototype = new Array; // jshint ignore:line

        /**
         * Returns the color as RGB.
         *
         * @return {object} RGB instance.
         */
        HSL.prototype.rgb = function() {
            var h = this.h;
            var s = this.s;
            var l = this.l;
            var r, g, b;

            if(s === 0){
                r = g = b = l; // achromatic
            }else{
                var hue2rgb = function hue2rgb(p, q, t){
                    if(t < 0) {
                        t += 1;
                    }
                    if(t > 1) {
                        t -= 1;
                    }
                    if(t < 1/6) {
                        return p + (q - p) * 6 * t;
                    }
                    if(t < 1/2) {
                        return q;
                    }
                    if(t < 2/3) {
                        return p + (q - p) * (2/3 - t) * 6;
                    }
                    return p;
                };

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }

            return new RGB(Math.round(r*255), Math.round(g*255), Math.round(b*255));
        };

        var self = this;

        /**
         * Creates an RGB color.
         *
         * @param {number|string} r The red value [0-255], or a hex string.
         * @param {number} g The green value [0-255].
         * @param {number} b The blue value [0-255].
         * @param {number} a The alpha value [0-1], defaults to 1.
         *
         * @return {object} RGB instance.
         */
        this.rgb = function(r,g,b,a) {
            if (typeof r === 'string') {
                return RGB.fromHex(r);
            }
            return new RGB(r,g,b,a);
        };

        /**
         * Creates an HSL color.
         *
         * @param {number} h The hue value as a fraction of 360 degrees [0-1].
         * @param {number} s The saturation value as a percentage [0-1].
         * @param {number} l The lightness value as a percentage [0-1].
         *
         * @return {object} HSL instance.
         */
        this.hsl = function(h,s,l) {
            return new HSL(h,s,l);
        };

        /**
         * Interpolates between two color values.
         *
         * @param {object} rgb1 First RGB color.
         * @param {object} rgb1 Second RGB color.
         * @param {number} val Value in range [0,1] specifying interpolation position.
         *
         * @return {object} Interpolated RGB color.
         */
        this.interpolate = function(rgb1, rgb2, val) {
            var hsl1 = rgb1.hsl();
            var hsl2 = rgb2.hsl();

            var hsl = hsl1.map(function(start, index) {
                return start + (val * (hsl2[index] - start));
            });
            var alpha = rgb1.a + val*(rgb2.a-rgb1.a);
            return new HSL(hsl[0], hsl[1], hsl[2]).rgb().opacity(alpha);
        };
    });