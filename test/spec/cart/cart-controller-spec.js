'use strict';

describe('Controller: CartCtrl', function () {

    var $scope, $timeout, authService, cartService, searchService, $location, $http, $controller;
    var cfg = _.clone(config);

    beforeEach(function () {

        module('cart');
        module('voyager.security');
        module('voyager.search');
        module('voyager.util');
        module('voyager.filters');
        module('voyager.config');
        module('taskRunner');
        module(function ($provide) {
            $provide.constant('config', cfg);
        });

        inject(function (_$controller_, _$timeout_, _authService_, _cartService_, _searchService_, _$location_, $httpBackend) {
            $scope = {};
            $timeout = _$timeout_;
            authService = _authService_;
            cartService = _cartService_;
            searchService = _searchService_;
            $location = _$location_;
            $http = $httpBackend;
            $controller = _$controller_;
        });

    });

    // Specs here

    function initCartCtrl() {
        $controller('CartCtrl', {
            $scope: $scope
        });

        $http.expectGET(new RegExp('auth')).respond({response: {docs: []}}); //auth call
        $http.expectJSONP(new RegExp('solr')).respond({response: {docs: [{id:'id'}]}});
        $http.expectJSONP(new RegExp('solr')).respond({response: {docs: []}});  // queued items call
        $http.flush();
    }

    it('should init', function () {
        cartService.addItems([{id:'id'}]);
        initCartCtrl();
    });

    it('should remove item', function () {
        cartService.addItems([{id:'id'}]);
        initCartCtrl();

        $scope.removeItem('id');

        expect($scope.cartItemCount).toBe(0);
    });

    it('should remove by format', function () {
        //cartService.addItems([{id:'id', format:'format'}]);
        cartService.addQuery({params:{}});

        $controller('CartCtrl', {
            $scope: $scope
        });

        $http.expectGET(new RegExp('auth')).respond({response: {docs: []}}); //auth call
        var items = ['junk', 5, 'trunk', 3];
        $http.expectJSONP().respond({facet_counts:{facet_fields:{format:items}},response:{docs: [{id:'id'}], numFound: 5}});
        $http.flush();

        $scope.removeItemByFormat({id:'id', format:'format', key:'id'});

        $http.expectJSONP().respond({response: {docs: [{id:'id'}]}, numFound: 1});
        $http.flush();

        // TODO
        //expect($scope.cartItemCount).toBe(0);
        expect($scope.hasItems()).toBeFalsy();

        $scope.clearQueue();

        expect($scope.hasItems()).toBeFalsy();
    });

});