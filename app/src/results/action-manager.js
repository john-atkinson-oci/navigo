(function() {
    'use strict';

    angular.module('voyager.results')
        .factory('actionManager', actionManager);

    function actionManager($window, $analytics, config, $modal) {

        function _isVisible(action, scope) {
            if (action.visible === true) {
                return true;
            }
            return scope.doc[action.visible];
        }

        function _toggleDisplay(action, scope) {
            if(scope.doc[action.toggle] === true) {
                action.display = action.off;
                action.icon = action.offIcon;
                action.buttonType = 'btn-default';
            } else {
                action.display = action.text;
                action.icon = action.onIcon;
                action.buttonType = 'btn-primary';
            }
        }

        function _setAction(action, scope) {
            action.visible = _isVisible(action, scope);
            if(action.action === 'add') {
                action.do = function() {
                    scope.doc.isopen = false;
                    scope.toggleCart(scope.doc);
                    _toggleDisplay(action, scope);
                };
                _toggleDisplay(action, scope);
            } else if (action.action === 'preview') {
                action.do = function() {
                    scope.doc.isopen = false;
                    scope.addToMap(scope.doc);
                    $window.scrollTo(0,0);
                };
            } else if (action.action === 'download') {
                action.do = function() {
                    scope.doc.isopen = false;
                    $analytics.eventTrack('download', {
                        category: 'results', label: scope.doc.format // jshint ignore:line
                    });
                    //TODO not sure if we need category of GIS but we don't want to do this with general images
                    //if(scope.doc.format_category === 'GIS' && scope.doc.component_files && scope.doc.component_files.length > 0) { // jshint ignore:line
                    //    var url = config.root + 'stream/' + scope.doc.id + '.zip';
                    //    $window.location.href = url;
                    //} else {
                    $window.location.href = scope.doc.download;
                    //}
                };
            } else if (action.action === 'open') {
                action.do = function() {
                    scope.doc.isopen = false;
                    $analytics.eventTrack('openWith', {
                        category: 'results', label: action.url // jshint ignore:line
                    });
                    var param = 'url'; //default for esri
                    if(action.param) {
                        param = action.param;
                    }
                    var sep = '?';
                    if(action.url.indexOf(sep) !== -1) {
                        sep = '&';
                    }
                    $window.open(action.url + sep + param + '=' + encodeURIComponent(scope.doc.fullpath));
                };
            } else if (action.action === 'openArcMap') {
                action.do = function() {
                    scope.doc.isopen = false;
                    $analytics.eventTrack('openArcMap', {
                        category: 'results', label: scope.doc.id // jshint ignore:line
                    });
                    $window.location.href = scope.doc.layerURL;
                };
            } else if (action.action === 'tag') {
                action.do = function() {
                    scope.doc.isopen = false;
                    $analytics.eventTrack('tag', {
                        category: 'results', label: action.url // jshint ignore:line
                    });
                    $modal.open({
                        templateUrl: 'common/tagging/tagging.html',
                        size: 'md',
                        controller: 'TagDialog',
                        resolve: {
                            doc: function () {
                                return scope.doc;
                            }
                        }
                    });
                };
            }
        }

        //public methods - client interface
        return {
            setAction : _setAction,
            toggleDisplay : _toggleDisplay
        };
    }

})();