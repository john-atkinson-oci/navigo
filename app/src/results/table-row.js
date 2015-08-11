'use strict';
angular.module('voyager.results')
    .directive('vsTableRow', function (inView, $document) {

        return {
            link: function($scope, $element) {

                function _isInView() {
                    var visible = $element.is(':visible'), isIn = false, clientHeight, imageRect;
                    if (visible) {
                        clientHeight = $document[0].documentElement.clientHeight;
                        imageRect = $element[0].getBoundingClientRect();
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
            }
        };
    });