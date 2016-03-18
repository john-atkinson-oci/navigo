'use strict';
// TODO this duplicates a lot of the vsCard directive, create a base class
angular.module('voyager.results')
    .directive('vsTableRow', function (inView, $document, sugar, actionManager, config, $location) {

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
                    } else if (action.action === 'add') {
                        if (scope.doc.inCart) {
                            action.display = action.offList;
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
                    var action = _.find($scope.actions,{action:'add'});

                    if(doc.inCart) {
                        cartService.remove(doc.id);
                        $scope.cartAction = 'Add';
                        $scope.btnType = 'btn-primary';
                        doc.inCart = false;
                        $analytics.eventTrack('removeFromList', {
                            category: 'results', label: 'card'  // jshint ignore:line
                        });
                        action.display = action.text;
                    } else {
                        cartService.addItem(doc);
                        $scope.cartAction = 'Remove';
                        $scope.btnType = 'btn-default';
                        doc.inCart = true;
                        $analytics.eventTrack('addToList', {
                            category: 'results', label: 'card'  // jshint ignore:line
                        });
                        action.onList = action.display;
                        action.display = action.offList;
                    }
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
                    $scope.isTable = true;
                    actionManager.toggleDisplay(actions.types.add, $scope);
                });

            }
        };
    });