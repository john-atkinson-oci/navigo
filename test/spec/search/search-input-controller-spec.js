'use strict';

describe('Controller: SearchInpuCtrl', function () {

    var $scope, $timeout, usSpinnerService, $location, $http, $controller, q;
    var cfg = _.clone(config);

    beforeEach(function () {
        module('voyager.home');
        module('voyager.search');
        module('voyager.tagging');
        module('ui.bootstrap');
        module('voyager.config');
        module(function ($provide) {
            $provide.constant('config', cfg);
        });

        inject(function (_$controller_, _$timeout_, _usSpinnerService_, _$location_, $httpBackend , $rootScope, _$q_) {
            $scope = $rootScope.$new();
            $timeout = _$timeout_;
            usSpinnerService = _usSpinnerService_;
            $location = _$location_;
            $http = $httpBackend;
            $controller = _$controller_;
            q = _$q_;
        });

    });

    // Specs here

    function initController() {
        $controller('SearchInputCtrl', {$scope: $scope});

        $http.expectGET(new RegExp('auth')).respond({}); // auth call
        //$http.expectJSONP(new RegExp('ssearch')).respond({response:{docs:[]}}); // saved searches
        //$http.expectJSONP(new RegExp('ssearch')).respond({response:{docs:[]}}); // get default saved search
        //$http.expectJSONP(new RegExp('v0')).respond({response:{docs:[]}}); // featured search

        $http.flush();
    }

    it('should init', function () {

        $location.path('/search');
        $location.search({place:'0 0 0 0', 'place.op':'within'})
        initController();

        expect($scope.search.place).toEqual('0.00 0.00 0.00 0.00');
    });

    it('should search', function () {

        $location.path('/search');
        //$location.search({place:'0 0 0 0', 'place.op':'within'});
        initController();

        $scope.search.q = 'text';
        $scope.submitSearch();

        var params = $location.search();

        expect(params.q).toBe('text');

    });

    it('should clear search input', function () {

        $location.path('/search');
        $location.search({place:'0 0 0 0', 'place.op':'within'});
        initController();

        $scope.search.q = 'text';
        $scope.clearField('place', true);

        var params = $location.search();

        expect(params.q).toBeUndefined();
        expect(params.place).toBeUndefined();
    });

    it('should clear search all', function () {

        $location.path('/search');
        $location.search({place:'0 0 0 0', 'place.op':'within'});
        initController();

        $scope.search.q = 'text';
        $scope.$emit('clearSearch');

        var params = $location.search();

        expect(params.q).toBeUndefined();
        expect(params.place).toBeUndefined();
    });

});