'use strict';

describe('Controller: HomeSavedSearchCtrl', function () {

    var $scope, $timeout, $location, $http, $controller, authService, savedSearchService, recentSearchService;
    var cfg = _.clone(config);

    var dispConfigMock = {};
    dispConfigMock.getDisplayConfig = function() {};

    beforeEach(function () {

        module('voyager.security');
        module('voyager.search');
        module('voyager.util');
        module('voyager.filters');
        module('voyager.config');
        module('voyager.config');
        module('vs.tools.displayConfig');
        module(function ($provide) {
            $provide.constant('config', cfg);
            $provide.constant('displayConfigResource', dispConfigMock);
        });

        inject(function (_$controller_, _$timeout_, _authService_, _$location_, $httpBackend, _savedSearchService_, _recentSearchService_, $rootScope, _displayConfigResource_, $q) {
            $scope = $rootScope.$new();
            $timeout = _$timeout_;
            $location = _$location_;
            $http = $httpBackend;
            $controller = _$controller_;
            authService = _authService_;
            savedSearchService = _savedSearchService_;
            recentSearchService = _recentSearchService_;

            spyOn(_displayConfigResource_,'getDisplayConfig').and.returnValue($q.when({data:{defaultView: 'view'}}));
        });

    });

    // Specs here
    var item = {id: 'id', place: '0 0 0 0'};

    function initCtrl() {
        $controller('HomeSavedSearchCtrl', {
            $scope: $scope
        });

        //$http.expectGET(new RegExp('auth')).respond({response: {docs: []}}); //auth call

        //TODO are observers causing multiple to fire?
        //$http.expectJSONP(new RegExp('ssearch')).respond({response: {docs: [item]}});
        $http.expectJSONP(new RegExp('ssearch')).respond({response: {docs: [item]}});

        $http.flush();
        $timeout.flush();
    }

    it('should init', function () {
        //cartService.addItems([{id:'id'}]);
        initCtrl();

        expect($scope.personalSavedSearches).toEqual([item]);

    });

    it('should apply saved search', function () {
        //cartService.addItems([{id:'id'}]);
        initCtrl();

        spyOn(savedSearchService,'applySavedSearch').and.callThrough();

        var saved = {id: 'id', query:'query'};
        $scope.applySavedSearch(saved);

        $http.expectJSONP(new RegExp('ssearch')).respond({response: {docs: [item]}});  // why?
        $scope.$apply();

        expect(savedSearchService.applySavedSearch).toHaveBeenCalledWith(saved, $scope);

        //TODO problem here, why are there 3 recent???
        recentSearchService.deleteSearch(0); //so thi doesn't bleed over to other specs
        recentSearchService.deleteSearch(0); //so thi doesn't bleed over to other specs
        recentSearchService.deleteSearch(0); //so thi doesn't bleed over to other specs
    });

    it('should delete saved search', function () {
        //cartService.addItems([{id:'id'}]);
        initCtrl();

        spyOn(savedSearchService,'deleteSearch').and.callThrough();

        var saved = {id: 'id', query:'query'};
        $http.expectDELETE(new RegExp('ssearch')).respond({response: {docs: [item]}});
        $http.expectJSONP(new RegExp('ssearch')).respond({response: {docs: [item]}}); //reload
        $http.expectJSONP(new RegExp('ssearch')).respond({response: {docs: [item]}}); //TODO firing too many?

        $scope.deleteSearch(saved.id);

        $http.flush();

        expect(savedSearchService.deleteSearch).toHaveBeenCalledWith(saved.id);
    });

});