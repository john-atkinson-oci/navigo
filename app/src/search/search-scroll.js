'use strict';
(function() {
    angular.module('voyager.search')
        .factory('searchScroll', searchScroll);

    function searchScroll(searchService, $timeout, $window) {

        var _position = 0;
        var _actualPage = 0;

        function _resetItemsPerPage(view) {
            if (view === 'table') {
                searchService.setItemsPerPage(50);
            } else {
                searchService.setItemsPerPage(48);
            }
        }

        return {
            setPosition: function(pos) {
                _position = pos;
            },
            getPosition: function() {
                return _position;
            },
            do: function(view) {
                $timeout(function() { //wait for results to render
                    if(_position > 0) {
                        var windowEl = angular.element($window);
                        windowEl.scrollTop(_position);
                        //console.log('set pos ' + position + ' doc height: ' + $document.height() + ' page: ' + _actualPage);
                        searchService.setPage(_actualPage);
                    }

                    _resetItemsPerPage(view);
                });
            },
            getPage: function() {
                return _actualPage;
            },
            prepare: function(view) {
                if(_position > 0) {  //query enough records to get back to the same position
                    _actualPage = searchService.getPage();
                    var records = 0;
                    if(view === 'table') {
                        records = 50 * _actualPage;
                    } else {
                        records = 48 * _actualPage;
                    }
                    //console.log('setting items per page: ' + records);
                    searchService.setItemsPerPage(records);
                }
            },
            setItemsPerPage: function() {
                _resetItemsPerPage();
            }
        };
    }

})();