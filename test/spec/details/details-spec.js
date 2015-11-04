'use strict';

describe('DetailsCtrl', function () {

    beforeEach(function () {
        module('voyager.security');
        module('voyager.results');
        module(function ($provide) {
            $provide.constant('config', config);
        });
        module('voyager.tagging');
        module('voyager.details');
    });

    var scope, controller, q, authServiceSpy, $location, $http, detailService, stateParams, $timeout, searchService;

    beforeEach(inject(function ($rootScope, $controller, $q, authService, _$location_, $httpBackend, _detailService_, _$stateParams_, _$timeout_, _searchService_) {
        scope = $rootScope.$new();
        controller= $controller;
        q = $q;
        authServiceSpy = EZSpy.spyOn(authService);
        $location = _$location_;
        $http = $httpBackend;
        detailService = _detailService_;
        stateParams = _$stateParams_;
        $timeout = _$timeout_;
        searchService = _searchService_;
    }));

    var doc = {id:'doc1', format: 'application/x-arcgis-map-server', fullpath:'z:/x/y', folder: 'x/y', bbox:'1 2 3 4', schema:'{"hash":"hash"}', download:'file://junk', layerURL:'bunk', hasMetadata:true, tree:'{"children":[{"mime":"mime"}]}', links:'{"links":[{"relation":"rel"}]}'};
    var lookupResponse = {data:{response: {docs:[doc]}, 'shards.info':[{shardAddress:'localhost/solr'}], to:['to_type'], from: ['from_type']}};

    describe('Load', function () {

        beforeEach(function() {
            // order of http calls (not mocking services here yet)

            $http.expectGET(new RegExp('auth')).respond({response: {docs:[]}});  // auth call
            $http.expectJSONP(new RegExp('solr\/fields')).respond({response: {docs:[]}}); // fields call
            $http.expectJSONP(new RegExp('solr\/v0')).respond(lookupResponse.data); // lookup call
            $http.expectJSONP(new RegExp('solr\/usertags')).respond({facet_counts: {facet_fields:{fss_tag_tags:[]}}}); // tags call

            $http.expectJSONP(new RegExp('tree')).respond(lookupResponse.data); // tree call

            $http.expectGET(new RegExp('links')).respond(lookupResponse.data); // link types call
            $http.expectJSONP(new RegExp('links.from')).respond(lookupResponse.data); // links from call

            $http.expectJSONP(new RegExp('fq=id')).respond(lookupResponse.data); // queue call

            $http.expectJSONP(new RegExp('links.to')).respond(lookupResponse.data); // links to call
        });

        it('should load', function () {
            controller('DetailsCtrl', {$scope: scope});
        });

        it('should call detail service with id', function() {
            spyOn(detailService, 'lookup').and.callThrough();
            controller('DetailsCtrl', {$scope: scope, $stateParams: {id: 'foo'}, authService: authServiceSpy});
            expect(detailService.lookup).toHaveBeenCalledWith('foo', ',*', undefined, undefined);
        });

        it('should load with shard', function() {
            spyOn(detailService, 'lookup').and.callThrough();
            $location.search('shard','shard');
            controller('DetailsCtrl', {$scope: scope, $stateParams: {id: 'foo', shard:'shard'}, authService: authServiceSpy});
            expect(detailService.lookup).toHaveBeenCalledWith('foo', ',*', 'shard', undefined);
        });

    });

    describe('Functions', function () {

        var doc = {id:'doc1', format: 'format'};
        var lookupResponse = {data:{response: {docs:[doc]}}};

        beforeEach(function() {
            // order of http calls (not mocking services here yet)

            $http.expectGET(new RegExp('auth')).respond({response: {docs:[]}});  // auth call
            $http.expectJSONP(new RegExp('solr\/fields')).respond({response: {docs:[]}}); // fields call
            $http.expectJSONP(new RegExp('solr\/v0')).respond(lookupResponse.data); // lookup call
            $http.expectJSONP(new RegExp('solr\/usertags')).respond({facet_counts: {facet_fields:{fss_tag_tags:[]}}}); // tags call

            $http.expectJSONP(new RegExp('solr\/v0')).respond(lookupResponse.data); // search call
        });

        function expectLinksAndQueue() {
            $http.expectGET(new RegExp('links')).respond(lookupResponse.data); // link types call
            $http.expectJSONP(new RegExp('fq=id')).respond(lookupResponse.data); // queue call
            $http.expectGET(new RegExp('links')).respond(lookupResponse.data); // link types call
        }

        it('should get next', function() {
            $http.expectJSONP(new RegExp('tree')).respond(lookupResponse.data); // tree call
            expectLinksAndQueue();
            controller('DetailsCtrl', {$scope: scope, $stateParams: {id: 'foo'}, authService: authServiceSpy});
            scope.getNext();
        });

        it('should get previous', function() {
            expectLinksAndQueue();

            spyOn(searchService,'getPreviousId').and.returnValue('id');
            controller('DetailsCtrl', {$scope: scope, $stateParams: {id: 'foo'}, authService: authServiceSpy});

            scope.$apply();
            scope.getPrevious();
        });

    });

    afterEach(function(){
        scope.$apply();
        $http.flush();
        $timeout.flush();
    });
});
