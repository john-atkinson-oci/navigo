/*global angular, L, config */

angular.module('portalApp', [
        'ngResource',
		'ngSanitize',
        'ngTable',
        'ngTableResizableColumns',
        'ngAria',
        'angularSpinner',
        'ui.router',
        'pascalprecht.translate',
        'ui.bootstrap',
        'ui.select2',
        'ui.sortable',
		'LocalStorageModule',
		'cart',
		'taskRunner',
        'clipFactory',
		'voyager.config',
		'voyager.security',
		'voyager.filters',
		'voyager.map',
		'voyager.util',
		'voyager.layout',
		'voyager.home',
		'voyager.search',
        'voyager.results',
        'voyager.details',
        'voyager.tagging',
		'voyager.component',
        'tree.directive',
        'angulartics',
        'angulartics.google.analytics',
        'voyager.common.featured'
    ])
    .factory('httpRequestInterceptor', function ($analytics, $q, $injector) {
        'use strict';
        return {
            response: function(response) {
                var newToken = response.headers('x-access-token-exchange');
                if(newToken) {
                    var $http = $injector.get('$http');
                    $http.defaults.headers.common['x-access-token'] = newToken;
                }
                return response;
            },
            responseError: function(response) {
                if (response.status === 419) { // token timed out
                    var $state = $injector.get('$state');
                    $state.go('login');
                    return $q.reject(response);
                } else {  // call analytics and reject
                    var url = 'unknown';
                    if(response.config) {
                        url = response.config.url;
                    }
                    $analytics.eventTrack('error', {
                        category: 'http', label: url, value:response.status  // jshint ignore:line
                    });
                    return $q.reject(response);
                }
            }
        };
    })
    .config(function ($stateProvider, $httpProvider, $urlRouterProvider) {
        'use strict';

        function _loadIfAllowed(authService, $q, configLoader, $location) {
            return authService.getPrivileges().then(function() {
                if(!authService.hasPermission('view')) {
                    return $q.reject('Not Authorized');
                } else {
                    return configLoader.load($location.search().disp);
                }
            });
        }

        function _canProcess(authService, $q) {
            return authService.getPrivileges().then(function() {
                if(!authService.hasPermission('process')) {
                    return $q.reject('Not Authorized');
                } else {
                    return $q.when({});
                }
            });
        }

        $stateProvider
            .state('search', {
                url: '/search?fq&q&vw&place',
                reloadOnSearch: false,
                views: {
                    '' : {
                        templateUrl: 'src/search/search.html'
                    },
                    'filters@search': {
                        'templateUrl':'src/filters/filters.html',
                        'controller':'FiltersCtrl'
                    },
                    'card-results@search': {
                        'templateUrl':'src/results/card-results.html'
                    },
                    'table-results@search': {
                        'templateUrl':'src/results/table-results.html'
                    },
                    'selected-filters@search': {
                        'templateUrl':'src/filters/selected-filters.html',
                        'controller':'SelectedFiltersCtrl'
                    }
                },
                resolve: {
                    load: function (configLoader, $location, $q, authService) {
                        return _loadIfAllowed(authService, $q, configLoader, $location);
                    }
                }
            })
            .state('home', {
                url: '/home',
                templateUrl: 'src/home/home.html',
                resolve: {
                    load: function (configLoader, $location, $q, authService) {
                        if(config.homepage.showHomepage === true) {
                            return _loadIfAllowed(authService, $q, configLoader, $location);
                        } else {
                            return $q.reject('Not Visible');
                        }
                    }
                }
            })
            .state('details', {
                url: '/show/:id?disp&shard',
                views: {
                    '': {
                        templateUrl: 'src/details/details.html'
                    },
                    'preview@details': {
                        templateUrl: 'src/preview/preview.html'
                    }
                },
                resolve: {
                    load: function (detailConfig, $location, $q, authService) {
                        return _loadIfAllowed(authService, $q, detailConfig, $location);
                    }
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: 'common/security/login.html',
                controller: 'AuthPageCtrl',
                resolve: {
                    load: function ($q, authService) {
                        return authService.loadPrivileges();
                    }
                }
            })
            .state('queue', {
                url: '/queue',
                templateUrl: 'src/cart/cart.html',
                resolve: {
                    load: function ($q, authService) {
                        return _canProcess(authService, $q);
                    }
                }
            })
            .state('history', {
                url: '/history',
                templateUrl: 'src/jobs/view-jobs.html',
                resolve: {
                    load: function ($q, authService) {
                        return _canProcess(authService, $q);
                    }
                }
            })
            .state('status', {
                url: '/status/:id',
                templateUrl: 'src/taskrunner/status.html',
                resolve: {
                    load: function ($q, authService) {
                        return _canProcess(authService, $q);
                    }
                }
            })
            .state('chart', {
                url: '/chart',
                templateUrl: 'src/chart/chart.html'
            });

        $urlRouterProvider.otherwise(function($injector){
            $injector.invoke(function($state, config) {
                if (config.homepage.showHomepage === true) {
                    $state.go('home');
                } else {
                    $state.go('search');
                }
            });
        });

        //maintain session state
        $httpProvider.defaults.withCredentials = true;
        //cors
//        $httpProvider.defaults.useXDomain = true;
//        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        //disable rest calls caching
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
//        //$httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';  // jshint ignore:line
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';  // jshint ignore:line
        $httpProvider.interceptors.push('httpRequestInterceptor');

    }).run(function ($rootScope, $location, authService, $state, config, $http) { // instance-injector
        'use strict';

        authService.addObserver(function(response) {
            if(response.user && response.user.token) {
                $http.defaults.headers.common['x-access-token'] = response.user.token.encoding;
            }
        });

        if($location.search().widget === 'true') {
            $rootScope.isWidget = true;
        }

        _.mixin(_.str.exports());

        $rootScope.title = config.title;

        $rootScope.footer = config.homepage.footerHTML;
        if($rootScope.footer.indexOf('<li>') !== 0) {
            $rootScope.footer = '<li>' + $rootScope.footer + '</li>';
        }

        $rootScope.$on('searchEvent', function (event, args) {
            $rootScope.$broadcast('doSearch', args);
        });
        $rootScope.$on('bboxChangeEvent', function(event, args){
            $rootScope.$broadcast('updateBBox', args);
        });
        $rootScope.$on('saveSearchSuccess', function(event, args){
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

        $rootScope.$on('searchDrawingTypeChanged', function(event, args) {
            $rootScope.$broadcast('updateDrawingTool', args);
        });

        $rootScope.$on('drawingToolChanged', function(event, args) {
            $rootScope.$broadcast('updateSearchDrawingType', args);
        });

        $rootScope.$on('searchTypeChanged', function(event, args) {
            $rootScope.$broadcast('updateSearchType', args);
        });

        $rootScope.$on('$stateChangeError', function(e, toState, toParams, fromState, fromParams, error) {
            if (error === 'Not Authorized') {
                $state.go('login');
            } else if (error === 'Not Visible') {
                $state.go('search');
            }
        });

        L.Icon.Default.imagePath = 'assets/img';

    }).constant('config',config);
