/*global describe, beforeEach, module, it, inject, config, EZSpy */

describe('SearchCtrl', function () {

    'use strict';

    beforeEach(function () {
        module('voyager.security'); //auth service module - apparently this is needed to mock the auth service
        module('voyager.results');
        module(function ($provide) {
            $provide.constant('config', config);
            $provide.value('authService',{});  //mock the auth service so it doesn't call the init methods
        });
        module('voyager.tagging');
        module('voyager.details');
    });

    var scope, controllerService, translateServiceMock, authServiceMock, detailServiceMock, q, tagServiceMock, location, timeout;

    //spies
    var $s = {'configService':{}, 'cartService':{}, searchService:{}};

    beforeEach(inject(function ($rootScope, $controller, $q, $location, $timeout, searchService, cartService, configService, searchModalService) {
        scope = $rootScope.$new();
        q = $q;
        controllerService = $controller;
        location = $location;
        timeout = $timeout;

        EZSpy.spyOnAll($s, [{searchService:searchService}, {cartService:cartService}, {configService:configService}, {searchModalService:searchModalService}]);
        $s.searchService.getPageIds.and.returnValue([1]);
        $s.searchService.testEsriGeocodeService.and.returnValue(q.when({}));
    }));

    describe('Load', function () {

        it('should load with empty results', function () {

            var response = {docs:[], numFound:0}, sort = {key:'key', value:'value'};

            $s.configService.getSortable.and.returnValue([sort]);
            $s.searchService.doSearch2.and.returnValue(q.when({data:{response:response}}));

            controllerService('SearchCtrl', {$scope: scope, 'cartService': $s.cartService, 'searchService': $s.searchService, 'translateService': translateServiceMock, 'authService': authServiceMock, 'detailService': detailServiceMock, 'configService':$s.configService, 'tagService':tagServiceMock});

            scope.$apply();

            expect(scope.results).toBe(response.docs);
            expect(scope.totalItems).toBe(response.numFound);
            expect(scope.displaySortField).toBe(sort.value);
            expect(scope.sortField).toBe(sort.key);

        });

        it('should sync cart state', function () {

            var response = {docs:[{id:'id'}], numFound:0}, sort = {key:'key', value:'value'};
            var items = [{id:'id'}];

            $s.configService.getSortable.and.returnValue([sort]);
            $s.searchService.doSearch2.and.returnValue(q.when({data:{response:response}}));
            $s.searchService.getPageIds.and.returnValue([1]);
            $s.searchService.getItemsPerPage.and.returnValue(12);

            $s.cartService.hasItems.and.returnValue(true);
            $s.cartService.fetchQueued.and.returnValue(q.when(items));

            spyOn(scope,'$broadcast');

            controllerService('SearchCtrl', {$scope: scope, 'cartService': $s.cartService, 'searchService': $s.searchService, 'translateService': translateServiceMock, 'authService': authServiceMock, 'detailService': detailServiceMock, 'configService':$s.configService, 'tagService':tagServiceMock});

            scope.$apply();

            expect(response.docs[0].inCart).toBe(true);
            expect(scope.$broadcast).toHaveBeenCalledWith('syncCard', {});

        });

        it('should sort by location sort param', function () {

            var response = {docs:[{id:'id'}], numFound:0}, sortField = {key:'key', value:'value'}, sortField2 = {key:'key2', value:'value2'};
            spyOn(location,'search').and.returnValue({sort:'key2'});

            $s.configService.getSortable.and.returnValue([sortField, sortField2]);
            $s.searchService.doSearch2.and.returnValue(q.when({data:{response:response}}));

            controllerService('SearchCtrl', {$scope: scope, 'cartService': $s.cartService, 'searchService': $s.searchService, 'translateService': translateServiceMock, 'authService': authServiceMock, 'detailService': detailServiceMock, 'configService':$s.configService, 'tagService':tagServiceMock});

            scope.$apply();

            expect(scope.displaySortField).toBe(sortField2.value);
            expect(scope.sortField).toBe(sortField2.key);

        });

    });

    describe('Events', function () {

        it('should handle doSearch', function () {

            var response = {docs:[], numFound:0}, sort = {key:'key', value:'value'};
            spyOn(location,'search').and.returnValue({sort:'key', sortdir:'asc'});

            $s.configService.getSortable.and.returnValue([sort]);
            $s.searchService.doSearch2.and.returnValue(q.when({data:{response:response}}));

            controllerService('SearchCtrl', {$scope: scope, 'cartService': $s.cartService, 'searchService': $s.searchService, 'translateService': translateServiceMock, 'authService': authServiceMock, 'detailService': detailServiceMock, 'configService':$s.configService, 'tagService':tagServiceMock});

            scope.$apply();

            scope.$emit('doSearch');

            timeout.flush();

            expect(scope.results).toBe(response.docs);
            expect(scope.totalItems).toBe(response.numFound);
            expect(scope.displaySortField).toBe(sort.value);
            expect(scope.sortField).toBe(sort.key);

            expect($s.searchService.setSort).toHaveBeenCalledWith('asc');

        });

        it('should handle filterChanged', function () {

            var response = {docs:[], numFound:0}, sort = {key:'key', value:'value'};

            $s.configService.getSortable.and.returnValue([sort]);
            $s.searchService.doSearch2.and.returnValue(q.when({data:{response:response}}));

            controllerService('SearchCtrl', {$scope: scope, 'cartService': $s.cartService, 'searchService': $s.searchService, 'translateService': translateServiceMock, 'authService': authServiceMock, 'detailService': detailServiceMock, 'configService':$s.configService, 'tagService':tagServiceMock});

            scope.$apply();

            scope.$emit('filterChanged');

            timeout.flush();

            expect(scope.results).toBe(response.docs);
            expect(scope.totalItems).toBe(response.numFound);

            expect($s.searchService.doSearch2).toHaveBeenCalled();

        });


        it('should change map size to small', function () {

            var response = {docs:[], numFound:0}, sort = {key:'key', value:'value'};

            $s.configService.getSortable.and.returnValue([sort]);
            $s.searchService.doSearch2.and.returnValue(q.when({data:{response:response}}));

            controllerService('SearchCtrl', {$scope: scope, 'cartService': $s.cartService, 'searchService': $s.searchService, 'translateService': translateServiceMock, 'authService': authServiceMock, 'detailService': detailServiceMock, 'configService':$s.configService, 'tagService':tagServiceMock});
            scope.$apply();
            spyOn(scope, 'switchMap').and.callThrough();

            scope.$emit('mapSizeChanged', 'small');

            timeout.flush();

            expect(scope.switchMap).toHaveBeenCalledWith('small');
            expect(scope.tableViewMapSize).toBe('small');
        });

        it('should open export CSV modal', function () {
            var response = {docs:[], numFound:0}, sort = {key:'key', value:'value'};

            $s.configService.getSortable.and.returnValue([sort]);
            $s.searchService.doSearch2.and.returnValue(q.when({data:{response:response}}));

            controllerService('SearchCtrl', {$scope: scope, 'cartService': $s.cartService, 'searchService': $s.searchService, 'translateService': translateServiceMock, 'authService': authServiceMock, 'detailService': detailServiceMock, 'configService':$s.configService, 'tagService':tagServiceMock, 'searchModalService':$s.searchModalService});
            scope.$apply();

            scope.exportResultsList();
            expect($s.searchModalService.exportResultsList).toHaveBeenCalled();
        });

    });

});