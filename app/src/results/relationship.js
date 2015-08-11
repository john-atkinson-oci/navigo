/*global angular, $ */

angular.module('voyager.results')
    .directive('vsRelationship', function (authService, cartService, config, $window, $analytics, $modal, actionManager, sugar) {
        'use strict';

        function _initActions(scope){
            var actionMap = {}, defaultAction = null, displayActions = [], actions = sugar.copy(config.docActions);  //copy so we don't change config and every card has separate instance of actions

            $.each(actions, function(index, action) {
                action.buttonType = 'btn-primary';
                actionManager.setAction(action, scope);
                actionMap[action.action] = action;

                if(action.visible) {
                    if(defaultAction === null) {
                        defaultAction = action;
                    } else {
                        displayActions.push(action);
                    }
                }
            });
            return {display:displayActions, defaultAction: defaultAction, types: actionMap};
        }

        return {
            templateUrl: 'src/results/relationship.html',
            controller: function ($scope) {

                $scope.imagePrefix = config.root + 'meta/';
                $scope.link = sugar.copy(config.docLink);  //copy so we don't change config
                actionManager.setAction($scope.link, $scope);

                $scope.toggleCart = function(doc) {
                    if(cartService.isInCart(doc.id)) {
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

            }
        };
    });