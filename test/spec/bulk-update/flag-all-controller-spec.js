'use strict';

describe('Controller: FlagAllCtrl', function () {

    var $scope, $timeout, $modal, usSpinnerService, $location, $http, $controller;
    var cfg = _.clone(config);

    beforeEach(function () {
        module('voyager.search');
        module('voyager.tagging');
        module('ui.bootstrap');
        module('voyager.config');
        module(function ($provide) {
            $provide.constant('config', cfg);
        });

        inject(function (_$controller_, _$timeout_, _$modal_, _usSpinnerService_, _$location_, $httpBackend) {
            $scope = {};
            $timeout = _$timeout_;
            $modal = _$modal_;
            usSpinnerService = _usSpinnerService_;
            $location = _$location_;
            $http = $httpBackend;
            $controller = _$controller_;
        });

    });

    // Specs here

    it('should init', function () {
        $controller('FlagAllCtrl', {$scope: $scope, $modalInstance: {}, resultData: {totalItemCount:1}});
        $http.expectJSONP(new RegExp('usertags')).respond({facet_counts:{facet_fields:{fss_tag_flags:['flag']}}});
        $http.flush();

        expect($scope.select2Options.tags).toEqual(['flag']);
    });

    it('should validate', function () {
        $controller('FlagAllCtrl', {$scope: $scope, $modalInstance: {}, resultData: {totalItemCount:1}});
        $http.expectJSONP(new RegExp('usertags')).respond({facet_counts:{facet_fields:{fss_tag_flags:['flag']}}});
        $http.flush();

        expect($scope.validate()).toBeFalsy();

        $scope.flag = 'flag2';

        expect($scope.validate()).toBeTruthy();
    });

    it('should save all', function () {
        $controller('FlagAllCtrl', {$scope: $scope, $modalInstance: {close:function(){}}, resultData: {totalItemCount:1}});
        $http.expectJSONP(new RegExp('usertags')).respond({facet_counts:{facet_fields:{fss_tag_tags:['tag']}}});
        $http.flush();

        $scope.flag = 'flag2';

        $scope.save();

        $http.expectPOST(new RegExp('usertag')).respond({tagging:''});
        $http.flush();

        $timeout.flush();
    });

    // *NOTE this is the remove controller - just adding here
    it('should remove all', function () {
        $controller('RemoveAllFlagsCtrl', {$scope: $scope, $modalInstance: {close:function(){}}, resultData: {totalItemCount:1}});

        $scope.save();

        $http.expectPOST(new RegExp('usertag')).respond({tagging:''});
        $http.flush();

        $timeout.flush();
    });

    it('should cancel', function () {
        $controller('RemoveAllFlagsCtrl', {$scope: $scope, $modalInstance: {dismiss:function(){}}, resultData: {totalItemCount:1}});

        $scope.cancel();

        expect($scope.successMessage).toBeFalsy();
    });
});