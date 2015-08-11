'use strict';
angular.module('voyager.util')
    .directive('iframeLoad', function () {
        return {
            link: function (scope, element, attrs) {
                scope.frameLoading = 'frame-loading';
                element.on('load', function () {
                    scope.frameLoading = '';
                    scope.$apply();
                });
                attrs.$observe('src', function(){
                    scope.frameLoading = 'frame-loading';
                });
            }
        };
    });