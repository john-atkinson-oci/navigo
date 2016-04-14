(function() {
    'use strict';

    angular.module('voyager.details').factory('detailsActions', detailsActions);

    function detailsActions($window, $analytics, config, sugar) {

        function _isVisible(action, doc) {
            if (action.visible === true) {
                return true;
            }
            // add has a separate button, preview is automatic when page loads, tag is handled below the actions
            return doc[action.visible] && (action.action !== 'add' && action.action !== 'preview' && action.action !== 'tag');
        }

        function _setAction(action, doc) {
            action.visible = _isVisible(action, doc);
            doc.isopen = false;
            if (action.action === 'download') {
                if(angular.isDefined(doc.download)) {
                    if(sugar.canOpen(doc)) {
                        action.text = action.alt;
                    }
                }
                action.do = function() {
                    $analytics.eventTrack('download', {
                        category: 'results', label: doc.format // jshint ignore:line
                    });
                    $window.location.href = doc.download;
                };
            } else if (action.action === 'open') {
                action.do = function() {
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
                    $window.open(action.url + sep + param + '=' + encodeURIComponent(doc.fullpath));
                };
            } else if (action.action === 'openArcMap') {
                action.do = function() {
                    $analytics.eventTrack('openArcMap', {
                        category: 'results', label: doc.id // jshint ignore:line
                    });
                    $window.location.href = doc.layerURL;
                };
            }
        }

        function _getActions(doc) {
            var actions = _.cloneDeep(config.docActions);
            _.each(actions, function(action) {
                _setAction(action, doc);
            });
            return actions;
        }

        //public methods - client interface
        return {
            setAction : _setAction,
            getActions: _getActions
        };
    }

})();