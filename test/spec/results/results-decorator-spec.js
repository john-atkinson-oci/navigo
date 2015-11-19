'use strict';

describe('Factory: resultsDecorator', function () {

    var $http, $q, resultsDecorator, configService;

    var cfg = _.clone(config);

    beforeEach(function () {
        module('voyager.search');
        module('voyager.util');
        module(function ($provide) {
            $provide.constant('config', cfg);
        });

        inject(function (_$httpBackend_, _$q_, _resultsDecorator_, _configService_) {
            $http = _$httpBackend_;
            $q = _$q_;
            resultsDecorator = _resultsDecorator_;
            configService = _configService_;
        });
    });

    // Specs here

    it('should get files', function () {

        spyOn(configService,'getDisplayFields').and.returnValue([{value:'value, value2', name:'name', style:'style', raw:'contains_mime'}]);

        var doc = {id:'id',shard:'shard', bytes:1000, thumb:'vres/mime'};
        resultsDecorator.decorate([doc], []);

        //TODO add more expects
        expect(doc.defaultThumb).toBeTruthy();
    });

});