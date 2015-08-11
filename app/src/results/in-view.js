'use strict';

angular.module('voyager.results').
    factory('inView', function () {

        var _inView = {};
        //each result item
        var _checkObservers = [];
        //the view that needs to know about the items
        var _viewObserver = function(){};

        //checks to see if they are in the view
        function _check() {
            _.each(_checkObservers,function(observer) {
                observer();
            });
        }

        return {

            add: function (doc) {
                _inView[doc.id] = doc;
            },

            remove: function(doc) {
                delete _inView[doc.id];
            },

            addCheckObserver: function(observer) {
                _checkObservers.push(observer);
            },

            reset: function() {
                _inView = {};
                _checkObservers = [];
            },

            clear: function() {
                _inView = {};
            },

            check: function() {
                _check();
            },

            getAll: _inView,

            setViewObserver: function(observer) {
                _viewObserver = observer;
            },

            notify: function() {
                _viewObserver(_inView);
            }

        };

    });
