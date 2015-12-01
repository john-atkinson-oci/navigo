'use strict';

describe('Controller: SavedLocationCtrl', function () {

    var $scope, $timeout, $location, $http, $controller;
    var cfg = _.clone(config);

    beforeEach(function () {

        module('voyager.security');
        module('voyager.search');
        module(function ($provide) {
            $provide.constant('config', cfg);
        });

        inject(function (_$controller_, _$timeout_, _$location_, $httpBackend, $rootScope) {
            $scope = $rootScope.$new();
            $timeout = _$timeout_;
            $location = _$location_;
            $http = $httpBackend;
            $controller = _$controller_;
        });

    });

    // Specs here
    var item = {id: 'id', place: '0 0 0 0'};

    function initCtrl() {
        var ctrl = $controller('SavedLocationsCtrl', {
            $scope: $scope
        });

        $http.expectJSONP(new RegExp('slocation')).respond({response: {docs: [item]}});

        $http.flush();
        $timeout.flush();

        return ctrl;
    }

    it('should init personal locations', function () {
        var ctrl = initCtrl();

        expect(ctrl.personalSavedLocations).toEqual([item]);

    });

    it('search should load all when empty', function () {
        var ctrl = initCtrl();

        ctrl.search();
    });

    it('search should load matches', function () {
        var ctrl = initCtrl();

        ctrl.savedTerm = 'term';

        $http.expectJSONP(new RegExp('slocation')).respond({response: {docs: [item]}});
        ctrl.search();

        $http.flush();

        expect(ctrl.personalSavedLocations).toEqual([item]);
    });

    it('should apply saved location', function () {
        var ctrl = initCtrl();

        ctrl.applySavedLocation({id:'id',value:'val'}, $scope);

        $timeout.flush();
    });

    it('should delete saved location', function () {
        var ctrl = initCtrl();

        $http.expectDELETE(new RegExp('slocation\/id')).respond({response: {docs: [item]}});
        $http.expectJSONP(new RegExp('slocation')).respond({response: {docs: [item]}});  //reload after delete

        ctrl.deleteLocation('id');

        $http.flush();
    });

    it('should re-order', function () {
        var ctrl = initCtrl();

        expect(ctrl.personalSavedLocations).toEqual([item]);

        $http.expectPOST(new RegExp('slocation')).respond({response: {docs: [item]}});  //reload after delete

        var enabled = ctrl.dragLocationControlListeners.accept();
        ctrl.dragLocationControlListeners.orderChanged({dest:{index:0}});

        expect(enabled).toBeTruthy();

        $http.flush();
    });
});