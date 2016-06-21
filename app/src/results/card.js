/*global angular, $ */
'use strict';

angular.module('voyager.results')
    .directive('vgBindHtml', function ($compile) {
        return function (scope, element, attrs) {
            scope.$watch(
                function (scope) {
                    return scope.$eval(attrs.vgBindHtml);
                },
                function (value) {
                    element.html(value);
                    $compile(element.contents())(scope);
                }
            );
        };
    })
    .directive('vsCard', function (authService, cartService, config, $window, $analytics, $modal, actionManager, sugar, inView, $document, $location) {

        function _initActions(scope){
            var actionMap = {}, defaultAction = null, displayActions = [], actions = sugar.copy(config.docActions);  //copy so we don't change config and every card has separate instance of actions

            $.each(actions, function(index, action) {
                action.buttonType = 'btn-primary';
                actionManager.setAction(action, scope);
                actionMap[action.action] = action;

                if(action.action === 'preview' && $location.path() === '/home') {
                    action.visible = false;
                }

                if(action.visible) {
                    if(defaultAction === null) {
                        defaultAction = action;
                    } else {
                        displayActions.push(action);
                    }

                    if(action.action === 'download' && angular.isDefined(scope.doc.download)) {
                        if(sugar.canOpen(scope.doc)) {
                            action.text = action.alt;
                        }
                    }
                }
            });
            return {display:displayActions, defaultAction: defaultAction, types: actionMap};
        }

        return {
            templateUrl: 'src/results/card.html',
            link: function($scope, $element) {

                function _isInView() {
                    var visible = $element.is(':visible'), isIn = false, clientHeight, imageRect;
                    if (visible) {
                        clientHeight = $document[0].documentElement.clientHeight;
                        imageRect = $element[0].getBoundingClientRect();
                        //entire card in view, or bottom part, or top part
                        isIn = (imageRect.top >= 0 && imageRect.bottom <= clientHeight) || (imageRect.bottom >= 0 && imageRect.bottom <= clientHeight) || (imageRect.top >= 0 && imageRect.top <= clientHeight);
                    }

                    if(isIn) {
                        inView.add($scope.doc);
                    } else {
                        inView.remove($scope.doc);
                    }
                    //console.log('isIn ' + isIn);
                }

                if (angular.isDefined($scope.doc.geo)) {  //we don't care if there isn't a bbox to draw
                    inView.addCheckObserver(_isInView);
                }

            },
            controller: function ($scope, filterService, translateService, $timeout, $location, configService, $filter) {

                $scope.imagePrefix = config.root + 'meta/';
                $scope.link = sugar.copy(config.docLink);  //copy so we don't change config
                $scope.cardView = configService.getCardView();
                actionManager.setAction($scope.link, $scope);
                $scope.fields = configService.getCardViewFields();
                $scope.names = configService.getCardViewNames();
                
                if($scope.link.action === 'preview' && $location.path() === '/home') {
                    $scope.link.visible = false;
                }
                $scope.toggleCart = function(doc) {
                    if(doc.inCart) {
                        cartService.remove(doc.id);
                        $scope.cartAction = 'Add';
                        $scope.btnType = 'btn-primary';
                        doc.inCart = false;
                        $analytics.eventTrack('removeFromList', {
                            category: 'results', label: 'card'  // jshint ignore:line
                        });
                    } else {
                        cartService.addItem(doc);
                        $scope.cartAction = 'Remove';
                        $scope.btnType = 'btn-default';
                        doc.inCart = true;
                        $analytics.eventTrack('addToList', {
                            category: 'results', label: 'card'  // jshint ignore:line
                        });
                    }
                };

                $scope.canCart = function () {
                    return authService.hasPermission('process');
                };

                $scope.applyTag = function(tag) {
                    if ($location.path().indexOf('/search') > -1) {
                        filterService.clear();
                        $location.search('q', null);
                        $location.search('place', null);
                        $location.search('recent', null);
                        $scope.$emit('removeFilterEvent', {});  //fire filter event
                    }
                    else {
                        $location.path('search');
                    }

                    $location.search('fq', 'tag_flags:'+tag);
                    filterService.setFilters({'fq' : 'tag_flags:'+tag});
                    $scope.$emit('filterEvent');
                    return false;
                };

                $scope.hover = function(active) {
                    $scope.$emit('resultHoverEvent', {
                        doc: active ? $scope.doc : null
                    });
                };

                var actions = _initActions($scope);
                $scope.actions = actions.display;
                $scope.default = actions.defaultAction;

                $scope.$on('addAllToCart', function () {
                    $scope.cartAction = 'Remove';
                    $scope.btnType = 'btn-default';
                    $scope.doc.inCart = true;
                    actionManager.toggleDisplay(actions.types.add, $scope);
                });

                $scope.$on('removeAllCart', function () {
                    $scope.cartAction = 'Add';
                    $scope.btnType = 'btn-primary';
                    $scope.doc.inCart = false;
                    actionManager.toggleDisplay(actions.types.add, $scope);
                });

                $scope.$on('syncCard', function () {
                    if($scope.doc.inCart) {
                        $scope.cartAction = 'Remove';
                        $scope.btnType = 'btn-default';
                    } else {
                        $scope.cartAction = 'Add';
                        $scope.btnType = 'btn-primary';
                    }
                    actionManager.toggleDisplay(actions.types.add, $scope);
                });

                $scope.applyFilter = function(filter, value) {
                    if($location.path() === '/search') {
                        var facet = {field:value, filter:filter, humanized : translateService.getFieldName(filter) + ':' + value, name:value};
                        filterService.addFilter(facet);
                        $location.search('fq', filterService.getFilterAsLocationParams());
                        $timeout(function() {  //let scope digest and add url params
                            $scope.$emit('filterEvent',{});
                        });
                    } else {
                        $window.location.href = config.root + '#search?fq=' + filter + ':' + value + '&disp=' + $location.search().disp;
                    }
                };
                
                $scope.getNameToUse = function(doc, names) {
                    var selectedName = null;
                    $.each(names, function(idx, name){
                        if(selectedName === null && doc[name.field] !== null) {
                            selectedName = name;
                        }
                    });
                    return selectedName ? selectedName.field : null;
                };
                
                $scope.formatField = function(doc, facet) {
                    var formatted = '', value = doc[facet.field];
                    if(angular.isDefined(value)) {
                        if (facet.field === 'format') {
                            formatted = translateService.getTypeAbbr(value);
                        } else if (facet.field === 'modified') {
                            formatted = $filter('date')(Date.parse(value), 'M/d/yyyy, hh:mma');
                        } else if (facet.field === 'bytes') {
                            if (value > 0) {
                                formatted = $filter('bytes')(value);
                            } else {
                                formatted = '0 bytes';
                            }
                        } else if (sugar.isDate(value)) {
                            formatted = $filter('date')(Date.parse(value), 'M/d/yyyy, hh:mma');
                        } else {
                            formatted = value;
                        }
                    }
                    return formatted;
                };
            }
        };
    });