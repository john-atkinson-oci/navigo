'use strict';

describe('Filters:', function () {

    var cfg = _.clone(config);

    function _flushHttp(httpMock) {
        httpMock.flush();
        httpMock.verifyNoOutstandingExpectation();
        httpMock.verifyNoOutstandingRequest();
    }
    //_.mixin(_.str.exports());  //this happens in the app.js, not fired here

    beforeEach(function () {
        module('voyager.util');
        module('voyager.security'); //auth service module - apparently this is needed to mock the auth service
        module(function ($provide) {
            $provide.constant('config', cfg);
            $provide.value('authService',{});  //mock the transitive auth service so it doesn't call the init methods
        });
        module('voyager.filters');
        module('ui.bootstrap');
    });

    describe('filtersController', function () {

        var httpMock, _configService, scope, controllerService, _filterService, q, _treeService;

        beforeEach(inject(function ($rootScope, configService, $httpBackend, $controller, filterService, $q, treeService) {
            httpMock = $httpBackend;
            _configService = configService;
            scope = $rootScope.$new();
            controllerService = $controller;
            _filterService = filterService;
            q = $q;
            _treeService = treeService;
        }));

        it('should load', function () {
            controllerService('FiltersCtrl', {$scope: scope});
            scope.$apply();

            expect(scope.maxFacets).toBe(10);
        });

        it('should fetch on search event', function () {

            var displayFilter = {name: 'junk', field: 'junkField'};
            var displayFacet = ['junkFacet', 5];

            cfg.settings.data.filters.push(displayFilter);

            //evalutating sinon vs jasmine
            sinon.stub(_filterService, 'applyFromUrl').returns(q.when({}));

            controllerService('FiltersCtrl', {$scope: scope, filterService: _filterService});
            scope.$apply();

            scope.$emit('doSearch');

            httpMock.expectJSONP().respond({facet_counts:{facet_fields:{junkField:displayFacet}}});

            scope.$apply();

            _flushHttp(httpMock);

            var actualFilter = scope.filters[0];
            expect(actualFilter.name).toBe(displayFilter.name);

            var facets = actualFilter.values;

            //This is more of a functional test it spans outside of the filtersController (trying to get more bang for buck)
            expect(facets[0].name).toBe(displayFacet[0]);
            expect(facets[0].count).toBe(displayFacet[1]);
            expect(facets[0].filter).toBe(displayFilter.field);
        });

        it('should fetch on filterChanged event', function () {

            var displayFilter = {name: 'junk', field: 'junkField'};
            var displayFacet = ['junkFacet', 5];

            cfg.settings.data.filters.push(displayFilter);

            //evalutating sinon vs jasmine
            sinon.stub(_filterService, 'applyFromUrl').returns(q.when({}));

            controllerService('FiltersCtrl', {$scope: scope, filterService: _filterService});
            scope.$apply();

            scope.$emit('filterChanged');

            httpMock.expectJSONP().respond({facet_counts:{facet_fields:{junkField:displayFacet}}});

            scope.$apply();

            _flushHttp(httpMock);

            var actualFilter = scope.filters[0];
            expect(actualFilter.name).toBe(displayFilter.name);
        });
    });
});