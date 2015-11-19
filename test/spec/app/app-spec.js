'use strict';

describe('portalApp', function() {

    var $rootScope, $state, $injector, $http, state = 'myState';

    beforeEach(function() {
        module('templates');
        module('portalApp');

        inject(function(_$rootScope_, _$state_, _$injector_, _$httpBackend_) {
            $rootScope = _$rootScope_;
            $state = _$state_;
            $injector = _$injector_;
            $http = _$httpBackend_;
        });
    });

    it('should goto login when no permissions', function() {
        $http.expectGET(new RegExp('auth')).respond({});

        $state.go('search');

        //TODO why 3 auth calls
        $http.expectGET(new RegExp('auth')).respond({});
        $http.expectGET(new RegExp('auth')).respond({});
        $http.expectGET(new RegExp('auth')).respond({});

        $http.flush();

        expect($state.current.name).toBe('login');
    });

    it('should goto login when no permissions', function() {
        $http.expectGET(new RegExp('auth')).respond({});

        $state.go('search');

        //TODO why dup calls
        $http.expectGET(new RegExp('auth')).respond({permissions:{view:true}});
        $http.expectGET(new RegExp('auth')).respond({permissions:{view:true}});
        $http.expectGET(new RegExp('location')).respond({});
        $http.expectGET(new RegExp('location')).respond({});
        $http.expectJSONP(new RegExp('search')).respond({response:{docs:[]}});
        $http.expectJSONP(new RegExp('search')).respond({response:{docs:[]}});

        $http.flush();

        expect($state.current.name).toBe('home');
    });

    it('should goto details', function() {
        $http.expectGET(new RegExp('auth')).respond({});

        $state.go('details');

        //TODO why dup calls
        $http.expectGET(new RegExp('auth')).respond({permissions:{view:true}});
        $http.expectGET(new RegExp('auth')).respond({permissions:{view:true}});
        $http.expectGET(new RegExp('location')).respond({});
        $http.expectGET(new RegExp('location')).respond({});
        $http.expectGET(new RegExp('config')).respond({display:{path:'path',fields:[]}});
        $http.expectJSONP(new RegExp('search')).respond({response:{docs:[]}});

        $http.flush();

        expect($state.current.name).toBe('home');
    });

    it('should not goto queue when no process permission', function() {
        $http.expectGET(new RegExp('auth')).respond({});

        $state.go('queue');

        //TODO why dup calls
        $http.expectGET(new RegExp('auth')).respond({permissions:{view:true}});
        $http.expectGET(new RegExp('auth')).respond({permissions:{view:true}});
        $http.expectGET(new RegExp('location')).respond({});
        $http.expectJSONP(new RegExp('search')).respond({response:{docs:[]}});

        $http.flush();

        expect($state.current.name).toBe('home');
    });

});