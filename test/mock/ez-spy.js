'use strict';

function EZSpy() {

    function _spy(obj) {
        var cls = (typeof obj === 'function') ? obj.prototype : obj;

        var functions = [];
        Object.getOwnPropertyNames(cls).filter(function(p){
            return typeof cls[p] === 'function';
        }).forEach(function(p) { functions.push(p); });

        return jasmine.createSpyObj('mock', functions);
    }

    function _spyOn(spies, toSpyOn) {
        _.each(toSpyOn, function(obj) {
            _.each(Object.keys(obj), function(key) {
                var toSpy = obj[key];
                spies[key] = _spy(toSpy);
            });
        });
    }

    return {
        spyOnAll:_spyOn,
        spyOn: _spy
    };
}

var EZSpy = new EZSpy();