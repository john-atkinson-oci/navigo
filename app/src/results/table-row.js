'use strict';
angular.module('voyager.results')
    .directive('vsTableRow', function (inView, $document, sugar, actionManager) {

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
                    displayActions.push(action);

                    if(action.action === 'download' && angular.isDefined(scope.doc.download)) {
                        if(scope.doc.download.indexOf('file:') === 0) {
                            action.text = action.alt;
                        }
                    }
                }
            });
            return {display:displayActions, defaultAction: defaultAction, types: actionMap};
        }

        return {
            link: function($scope, $element) {

                function _isInView() {
                    var visible = $element.is(':visible'), isIn = false, clientHeight, imageRect;
                    if (visible) {
                        clientHeight = $document[0].documentElement.clientHeight;
                        imageRect = $element.children()[0].getBoundingClientRect();
                        //entire image in view, or bottom part, or top part
                        isIn = (imageRect.top >= 0 && imageRect.bottom <= clientHeight) || (imageRect.bottom >= 0 && imageRect.bottom <= clientHeight) || (imageRect.top >= 0 && imageRect.top <= clientHeight);
                    }

                    if(isIn) {
                        inView.add($scope.doc);
                    } else {
                        inView.remove($scope.doc);
                    }
                }

                if (angular.isDefined($scope.doc.geo)) {  //we don't care if there isn't a bbox to draw
                    inView.addCheckObserver(_isInView);
                }
            },
            controller: function ($scope, filterService, translateService, $timeout, $location, $analytics, authService, cartService) {

                $scope.link = sugar.copy(config.docLink);  //copy so we don't change config
                actionManager.setAction($scope.link, $scope);
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

                $scope.getDetailsLink = function(doc) {
                    var link = '#/show/' + doc.id + '?disp=default';
                    if(angular.isDefined(doc.shard) && doc.shard !== '[not a shard request]') {
                        link += '&shard=' + doc.shard;
                    }

                    return link;
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
                    var facet = {field:value, filter:filter, humanized : translateService.getFieldName(filter) + ':' + value, name:value};
                    filterService.addFilter(facet);
                    $location.search('fq', filterService.getFilterAsLocationParams());
                    $timeout(function() {  //let scope digest and add url params
                        $scope.$emit('filterEvent',{});
                    });
                };

            }
        };
    });