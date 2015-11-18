'use strict';

describe('Controller: SavedSearchDialogCtrl', function () {

    var $scope, $timeout, $location, $http, $controller, authService, savedSearchService, recentSearchService;
    var cfg = _.clone(config);

    beforeEach(function () {

        module('voyager.security');
        module('voyager.search');
        module('voyager.util');
        module('voyager.filters');
        module('voyager.config');
        module('ui.bootstrap');
        module(function ($provide) {
            $provide.constant('config', cfg);
        });

        inject(function (_$controller_, _$timeout_, _authService_, _$location_, $httpBackend, _savedSearchService_, _recentSearchService_, $rootScope) {
            $scope = $rootScope.$new();
            $timeout = _$timeout_;
            $location = _$location_;
            $http = $httpBackend;
            $controller = _$controller_;
            authService = _authService_;
            savedSearchService = _savedSearchService_;
            recentSearchService = _recentSearchService_;
        });

    });

    // Specs here
    var item = {id: 'id', place: '0 0 0 0'};

    function initCtrl(permission) {
        $controller('SaveSearchDialog', {
            $scope: $scope,
            $modalInstance:{close:function(){}},
            searchItem:{query:{}}
        });

        //TODO why twice??
        $http.expectGET(new RegExp('auth')).respond({permissions:permission, user:{groups:[]}}); //auth call
        $http.expectGET(new RegExp('auth')).respond({permissions:permission, user:{groups:[]}}); //auth call

        if(permission.manage) {
            $http.expectGET(new RegExp('groups')).respond({groups:[]}); //auth call
        } else if (permission.share_saved_search) {
            //$http.expectGET(new RegExp('auth')).respond({permissions:permission, user:{groups:[]}}); //auth call
        }

        $http.flush();
        $timeout.flush();
    }

    it('should init as admin', function () {
        initCtrl({manage:true});
    });

    it('should init as sharer', function () {
        $http.expectGET(new RegExp('auth')).respond({manage:false, share_saved_search: true}); //auth call
        initCtrl({manage:false, share_saved_search: true});
    });

    it('should save', function () {
        $http.expectGET(new RegExp('auth')).respond({manage:false, share_saved_search: true}); //auth call
        initCtrl({manage:false, share_saved_search: true});

        $scope.savedSearch.title = 'junk';
        $scope.savedSearch.makeDefault = true;

        $http.expectPOST(new RegExp('ssearch')).respond({manage:false, share_saved_search: true}); //auth call

        $scope.ok();

        $http.flush();

    });

    //it('should apply saved search', function () {
    //    //cartService.addItems([{id:'id'}]);
    //    initCtrl();
    //
    //    spyOn(savedSearchService,'applySavedSearch').and.callThrough();
    //
    //    var saved = {id: 'id', query:'query'};
    //    $scope.applySavedSearch(saved);
    //
    //    expect(savedSearchService.applySavedSearch).toHaveBeenCalledWith(saved, $scope);
    //
    //    //TODO problem here, why are there 3 recent???
    //    recentSearchService.deleteSearch(0); //so thi doesn't bleed over to other specs
    //    recentSearchService.deleteSearch(0); //so thi doesn't bleed over to other specs
    //    recentSearchService.deleteSearch(0); //so thi doesn't bleed over to other specs
    //});
    //
    //it('should delete saved search', function () {
    //    //cartService.addItems([{id:'id'}]);
    //    initCtrl();
    //
    //    spyOn(savedSearchService,'deleteSearch').and.callThrough();
    //
    //    var saved = {id: 'id', query:'query'};
    //    $http.expectDELETE(new RegExp('ssearch')).respond({response: {docs: [item]}});
    //    $http.expectJSONP(new RegExp('ssearch')).respond({response: {docs: [item]}}); //reload
    //    $http.expectJSONP(new RegExp('ssearch')).respond({response: {docs: [item]}}); //TODO firing too many?
    //
    //    $scope.deleteSearch(saved.id);
    //
    //    $http.flush();
    //
    //    expect(savedSearchService.deleteSearch).toHaveBeenCalledWith(saved.id);
    //});

});