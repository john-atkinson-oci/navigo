'use strict';

describe('Factory: cartService', function () {

    var $http, $q, sut, $state;

    var cfg = _.clone(config);

    beforeEach(function () {
        module('portalApp');
        module(function ($provide) {
            $provide.constant('config', cfg);
        });

        inject(function (_$http_, _$q_, httpRequestInterceptor, _$state_) {
            $http = _$http_;
            $q = _$q_;
            $state = _$state_;
            sut = httpRequestInterceptor;
        });
    });

    // Specs here

    it('should go to login on token error', function () {
        spyOn($state,'go');

        sut.response({headers:function(){return 'error';}});

        expect($state.go).toHaveBeenCalledWith('login');
    });

    it('should go to login on error', function () {
        spyOn($state,'go');

        sut.responseError({status:419});

        expect($state.go).toHaveBeenCalledWith('login');
    });

    it('should post error to analytics', function () {
        spyOn($state,'go');

        sut.responseError({config:{url:'url'}});

        expect($state.go).not.toHaveBeenCalled();
    });
});