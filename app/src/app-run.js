angular.module('portalApp')
    .run(function ($rootScope, $location, authService, $state, config) { // instance-injector
        'use strict';

        if ($location.search().widget === 'true') {
            $rootScope.isWidget = true;
        }

        _.mixin(_.str.exports());

        $rootScope.title = config.title;

        $rootScope.footer = config.homepage.footerHTML;
        if ($rootScope.footer.indexOf('<li>') !== 0) {
            $rootScope.footer = '<li>' + $rootScope.footer + '</li>';
        }

        $rootScope.$on('searchEvent', function (event, args) {
            $rootScope.$broadcast('doSearch', args);
        });
        $rootScope.$on('bboxChangeEvent', function (event, args) {
            $rootScope.$broadcast('updateBBox', args);
        });
        $rootScope.$on('saveSearchSuccess', function (event, args) {
            $rootScope.$broadcast('updateSearchSaveStatus', args);
        });
        $rootScope.$on('filterEvent', function (event, args) {
            $rootScope.$broadcast('filterChanged', args);
        });
        $rootScope.$on('removeFilterEvent', function (event, args) {
            $rootScope.$broadcast('removeFilter', args);
        });
        $rootScope.$on('clearSearchEvent', function (event, args) {
            //$rootScope.$broadcast('clearBbox', args);
            $rootScope.$broadcast('clearSearch', args);
        });
        $rootScope.$on('clearBboxEvent', function (event, args) {
            $rootScope.$broadcast('clearBbox', args);
        });
        $rootScope.$on('addBboxEvent', function (event, args) {
            $rootScope.$broadcast('addBbox', args);
        });
        $rootScope.$on('changeViewEvent', function (event, args) {
            $rootScope.$broadcast('changeView', args);
        });
        $rootScope.$on('searchComplete', function (event, args) {
            $rootScope.$broadcast('searchResults', args);
        });
        $rootScope.$on('addAllToCartEvent', function (event, args) {
            $rootScope.$broadcast('addAllToCart', args);
        });
        $rootScope.$on('removeAllCartEvent', function (event, args) {
            $rootScope.$broadcast('removeAllCart', args);
        });
        $rootScope.$on('resultHoverEvent', function (event, args) {
            $rootScope.$broadcast('resultHover', args);
        });

        $rootScope.$on('searchDrawingTypeChanged', function (event, args) {
            $rootScope.$broadcast('updateDrawingTool', args);
        });

        $rootScope.$on('drawingToolChanged', function (event, args) {
            $rootScope.$broadcast('updateSearchDrawingType', args);
        });

        $rootScope.$on('searchTypeChanged', function (event, args) {
            $rootScope.$broadcast('updateSearchType', args);
        });

        $rootScope.$on('$stateChangeError', function (e, toState, toParams, fromState, fromParams, error) {
            if (error === 'Not Authorized') {
                $state.go('login');
            } else if (error === 'Not Visible') {
                $state.go('search');
            }
        });

        L.Icon.Default.imagePath = 'assets/img';
    });