'use strict';

describe('Config:', function () {

    _.mixin(_.str.exports());  //this happens in the app.js, not fired here
    var cfg = _.clone(config);

    beforeEach(function () {
        module('voyager.util');
        module('voyager.filters');
        module('voyager.config');
        module(function ($provide) {
            $provide.constant('config', cfg);
        });
    });

    describe('configService', function () {

        var sut, httpMock;

        beforeEach(inject(function (configService, $rootScope, $httpBackend) {
            sut = configService;
            httpMock = $httpBackend;
        }));

        it('should set config', function () {

            var dispSettings = {
                details: {
                    detailsTableFields: [{name: 'format'},{name:'junk', style:'junk'}]
                },
                filtering:[{field: 'format'}, {field: 'junk', style:'junk'}]
            };
            // var dispSettings = {display:{fields:[{name: 'format'},{name:'junk', style:'junk'}]}, filters:[{field: 'format'}, {field: 'junk', style:'junk'}]};
            httpMock.expectGET().respond(dispSettings);
            httpMock.expectJSONP().respond({response: {docs:[{name:'format', stype:'string', multivalued:true}]}});  //data types call

            sut.setFilterConfig('configID');

            httpMock.flush();

            var displayFields = sut.getDisplayFields({format:'junk'});

            expect(displayFields[0].raw).toBe('format');

            var actual = sut.lookupFilter('format');

            expect(actual.field).toEqual(dispSettings.filtering[0].field);
            expect(actual.stype).toEqual('string');

            var style = sut.lookupFilterStyle('junk');

            expect(style).toEqual('junk');

        });

        it('should set default config when undefined', function () {

            // var dispSettings = {display:{fields:[{name: 'format'},{name:'junk', style:'junk'}]}, filters:[{field: 'format'}, {field: 'junk', style:'junk'}]};
            var dispSettings = {
                details: {
                    detailsTableFields: [{name: 'format'},{name:'junk', style:'junk'}]
                },
                filtering:[{field: 'format'}, {field: 'junk', style:'junk'}]
            };
            httpMock.expectGET().respond(dispSettings);
            httpMock.expectJSONP().respond({response: {docs:[{name:'format', stype:'string', multivalued:true}]}});  //data types call

            sut.setConfigId('junk');

            sut.setFilterConfig().then(function(config) {
                expect(config.id).toBe(cfg.defaultId);
            });

            httpMock.flush();

        });

        it('should use summary fields', function () {

            // var dispSettings = {display:{fields:[{name: 'format'},{name:'junk', style:'junk'}]}, filters:[{field: 'format'}, {field: 'summary'}, {field: 'junk', style:'junk'}], summary:{fields:[{field: 'summary', style:'junk',name:'name'}]}};
            var dispSettings = {
                details: {
                    detailsTableFields: [{name: 'format'},{name:'junk', style:'junk'}]
                },
                filtering:[{field: 'format'}, {field: 'junk', style:'junk'}]
            };
            httpMock.expectGET().respond(dispSettings);
            httpMock.expectJSONP().respond({response: {docs:[{name:'format', stype:'string', multivalued:true}]}});  //data types call

            sut.setFilterConfig('configID');

            httpMock.flush();

            // var displayFields = sut.getDisplayFields({name:'name'});

            // TODO
            // expect(displayFields[0].raw).toBe('name');

        });

    });
});