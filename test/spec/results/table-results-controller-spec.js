describe('TableCtrl', function () {

    'use strict';

    var cfg = _.clone(config);

    beforeEach(function () {
        module('voyager.security'); //auth service module - apparently this is needed to mock the auth service
        module('voyager.results');
        module(function ($provide) {
            $provide.constant('config', cfg);
            //$provide.value('authService',{});  //mock the auth service so it doesn't call the init methods
        });
        module('voyager.tagging');
        module('voyager.details');
        module('voyager.component');
    });

    var scope, controllerService, q, location, timeout, $http, cartService, $window;

    beforeEach(inject(function ($rootScope, $controller, $q, $location, $timeout, searchService, _cartService_, configService, _$httpBackend_, _$window_) {
        scope = $rootScope.$new();
        q = $q;
        controllerService = $controller;
        location = $location;
        timeout = $timeout;
        $http = _$httpBackend_;
        cartService = _cartService_;
        $window = _$window_;
    }));

    $(document.body).append('<div ng-controller="TableCtrl"><table ng-table="tableParams"><tr ng-repeat="doc in $data"></tr></table>');

    function initCtrl(response, search, authResponse) {
        if (angular.isUndefined(authResponse)) {
            authResponse = {};
        }
        controllerService('TableCtrl', {$scope: scope});

        //$http.expectGET(new RegExp('auth')).respond(authResponse); //auth info call
        if (search) {
            $http.expectJSONP(new RegExp('solr\/v0')).respond(response);  //search call
            $http.flush();
            timeout.flush();
        }
        scope.$apply();
    }

    describe('Load', function () {

        it('should load with empty results', function () {

            location.search({disp:'disp', sort:'field asc'});

            var response = {docs:[], numFound:0};

            initCtrl({response: response}, false);

            var defer = q.defer();
            scope.setDefer(defer);

            scope.$emit('searchResults', {response:{docs:[{id:'id'}]},'extent.bbox':'0 0 0 0'});
            //TODO for some reason getData isn't fired the first time
            scope.$emit('searchResults', {response:{docs:[{id:'id'}]},'extent.bbox':'0 0 0 0'});

            //TODO how to assert??
        });

        it('should apply flag', function () {

            location.search({disp:'disp', sort:'field asc'});

            var response = {docs:[{id:'id'}], numFound:1};

            initCtrl({response: response}, false);

            scope.applyFlag('tag');

            expect(location.search().fq = 'tag_flags:tag');
        });

        it('should format field', function () {

            location.search({disp:'disp', sort:'field asc'});

            var response = {docs:[{id:'id'}], numFound:1};

            initCtrl({response: response}, false);

            var formatted = scope.formatField({format:'format'},{field:'format'});

            expect(formatted).toEqual('format');

            formatted = scope.formatField({modified:'1/1/2000'},{field:'modified'});

            expect(formatted).toEqual('1/1/2000, 12:00AM');

            formatted = scope.formatField({bytes:2000},{field:'bytes'});

            expect(formatted).toEqual('2.0 kB');

            formatted = scope.formatField({bytes:0},{field:'bytes'});

            expect(formatted).toEqual('0 bytes');

            formatted = scope.formatField({junk:'junk'},{field:'junk'});

            expect(formatted).toEqual('junk');
        });

        it('should hover', function () {

            location.search({disp:'disp', sort:'field asc'});

            var response = {docs:[{id:'id'}], numFound:1};

            scope.$on('resultHoverEvent', function(e, args) {
                expect(args.doc.id).toBe(response.docs[0].id);
            });

            initCtrl({response: response}, false);

            scope.hover(response.docs[0]);
        });

    });

});