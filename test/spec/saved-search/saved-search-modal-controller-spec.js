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

    var modalMock = {close:function(){}, dismiss:function(){}};

    // Specs here
    function initCtrl() {

        spyOn(modalMock, 'dismiss');

        $controller('SavedSearchModalCtrl', {
            $scope: $scope,
            $modalInstance:modalMock,
            tab:'tab'
        });
        //
        ////TODO why twice??
        $http.expectGET(new RegExp('auth')).respond({permissions:{}, user:{groups:[]}}); //auth call
        //$http.expectGET(new RegExp('auth')).respond({permissions:permission, user:{groups:[]}}); //auth call
        //
        //if(permission.manage) {
        //    $http.expectGET(new RegExp('groups')).respond({groups:[]}); //auth call
        //} else if (permission.share_saved_search) {
        //    //$http.expectGET(new RegExp('auth')).respond({permissions:permission, user:{groups:[]}}); //auth call
        //}

        $http.flush();
        $timeout.flush();
    }

    it('should init', function () {
        initCtrl();

        expect($scope.showTab).toBe('suggested');
    });

    it('should change tab', function () {
        initCtrl();

        $scope.changeTab('junk');

        expect($scope.showTab).toBe('junk');
    });

    it('should cancel', function () {
        initCtrl();

        $scope.$emit('filterChanged');

        expect(modalMock.dismiss).toHaveBeenCalled();
    });

});