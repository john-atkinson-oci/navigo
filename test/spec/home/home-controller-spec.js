'use strict';

describe('Controller: HomeCtrl', function () {

    var $scope, $timeout, $modal, usSpinnerService, $location, $http, $controller, leafletData, q;
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

        inject(function (_$controller_, _$timeout_, _$modal_, _usSpinnerService_, _$location_, $httpBackend , $rootScope, _leafletData_, _$q_) {
            $scope = $rootScope.$new();
            $timeout = _$timeout_;
            $modal = _$modal_;
            usSpinnerService = _usSpinnerService_;
            $location = _$location_;
            $http = $httpBackend;
            $controller = _$controller_;
            leafletData = _leafletData_;
            q = _$q_;
        });

        cfg.settings.data.display.showMap = true;
    });

    // Specs here

    function initController() {
        $controller('HomeCtrl', {$scope: $scope, $modalInstance: {}, resultTotalCount: 1, leafletData: leafletData});

        //$http.expectGET(new RegExp('auth')).respond({}); // auth call
        $http.expectJSONP(new RegExp('ssearch')).respond({response:{docs:[]}}); // saved searches
        $http.expectJSONP(new RegExp('ssearch')).respond({response:{docs:[]}}); // get default saved search
        $http.expectJSONP(new RegExp('v0')).respond({response:{docs:[]}}); // featured search

        $http.flush();
    }

    function getMapMock() {
        var map = new LeafletMapMock();
        map.vsSearchType = 'searchType';
        map.on = function (event, callback) {
            var e = {};
            e.layer = {};
            e.layer.getBounds = function () {
                return {
                    toBBoxString: function () {
                        return '0 0 0 0';
                    }
                };
            };
            if (callback) {
                callback(e);
            }
        };
        return map;
    }

    it('should init', function () {
        var map = getMapMock();
        spyOn(leafletData, 'getMap').and.callFake(function() {
            return q.when(map);
        });

        initController();

        //TODO failing after Cainkade merge
        //expect($scope.search['place.op']).toEqual('searchType');
    });

    it('should init with map hidden', function () {
        cfg.settings.data.display.showMap = false;

        initController();

       // expect($scope.containerStyle.indexOf('-60') > -1).toBeTruthy();
        expect($scope.mapTypes).toEqual(['Place']);
        expect($scope.showMap).toBeFalsy();
        expect($scope.selectedMapType).toBe('Place');
    });

    it('should init with place finder hidden', function () {
        cfg.homepage.showPlaceQuery = false;

        initController();

        expect($scope.mapTypes).toEqual(['Map']);
        expect($scope.showMap).toBeTruthy();
        expect($scope.selectedMapType).toBe('Map');

        delete cfg.homepage.showPlaceQuery; //reset to default
    });

    it('should init with place finder and map hidden', function () {
        cfg.homepage.showPlaceQuery = false;
        cfg.settings.data.display.showMap = false;

        initController();

        expect($scope.searchInputClass).toEqual('col-xs-12');
        expect($scope.showSpatialInput).toBeFalsy();

        delete cfg.homepage.showPlaceQuery; //reset to default
    });

    it('should showAll', function () {
        initController();

        $scope.search = {query:'text', location:'place'};

        $scope.selectedMapType = 'Place';

        $location.search().disp = 'disp';
        $location.search()['place.id'] = 'placeId';

        $scope.showAll();

        $http.expectJSONP(new RegExp('ssearch')).respond({response:{docs:[]}}); // get default saved search
        $http.flush();
    });
});