'use strict';
angular.module('voyager.search')
    .directive('vsSuggest', function ($timeout, suggestQuery, $compile, $q, $location, urlUtil, mapUtil) {

        var _focused = false;
        var _placeSearch = false;

        function _check(value) {
            if(value.length > 3) {  //typed over 3 characters
                return suggestQuery.execute(value);
            }
            return $q.when([]);
        }

        function _link(scope, element, attrs) {
            var t = '<div ng-show="hasSuggestions" vs-suggest-list class="suggest-container hdpi" style="width:100%"></div>';
            element.after($compile(t)(scope));

            var _typeTimer;

            function _getSuggestions() {
                scope.hasRecommendations = false;
                _check(element.val()).then(function(suggestions) {
                    // JD: hack, filter out suggestions that don't have a name
                    suggestions = _.filter(suggestions, function(s) {
                        return s.name !== null;
                    });
                    if(!_.find(suggestions, {'name': element.val()})) {
                        scope.suggestions = suggestions;
                        scope.hasSuggestions = suggestions.length > 0;
                    } else {
                        scope.hasSuggestions = false; //input matches, don't suggest
                    }
                });
            }

            var handleKeydown = function(e) {
                scope.selectedPlace = false;
                _placeSearch = false;
                scope.hasRecommendations = false;
                $timeout.cancel(_typeTimer);

                if(e.which === 13) {  //hit enter, don't show suggestions
                    scope.suggestions = [];
                    scope.hasSuggestions = false;
                    scope.selectedPlace = true;
                    _placeSearch = true;
                    return;
                }
                //pause for a moment until typing has stopped
                _typeTimer = $timeout(function () {
                    //stopped typing
                    _getSuggestions();
                }, 300);
            };

            element.on('keydown', handleKeydown);

            var handleBlur = function() {
                $timeout(function() {  //let focus fire first TODO why is it firing?
                    scope.suggestions = [];
                    scope.hasSuggestions = false;
                    _focused = false;
                });
            };

            element.on('blur', handleBlur);

            var handleFocus = function() {
                var val = element.val();
                //not sure why this fires when not in focus
                if(!_focused && !scope.selectedPlace && !mapUtil.isBbox(val)) {
                    _getSuggestions();
                }
            };

            element.on('focus', handleFocus);

            scope.select = function(item) {
                scope.selectedPlace = true;
                _placeSearch = true;
                scope.hasRecommendations = false;
                scope.hasSuggestions = false;
                element.val(item.name);

                if(scope.search && angular.isDefined(scope.search.location)) {  //TODO this is for home page, we should be consistent with the model
                    scope.search.location = item.name;
                }
                $location.search('place',item.name);
                $location.search('place.id',item.id);
                if(attrs.autosearch !== 'off') {

                    scope.$emit('filterEvent', {});
                }
            };

            scope.$on('$destroy', function() {
                element.off('focus', handleFocus);
                element.off('blur', handleBlur);
                element.off('keydown', handleKeydown);
            });
        }

        return {
            compile: function() {
                return _link;
            },
            controller: function($scope, $document) {

                //didn't click on a recommendation, hide them
                var docClickHandler = function() {
                    //by not selecting a recommendation they accept the first one, so flag as selected
                    $scope.selectedPlace = true;  //so we don't show suggestions again
                    $scope.hasRecommendations = false;
                    $scope.hasSuggestions = false;
                    $scope.$apply();
                    $document.off('click', docClickHandler);
                };

                $scope.$on('searchResults', function (event, data) {
                    var isChosen = $location.search()['place.id'];
                    if(angular.isDefined(isChosen)) {
                        return;  //user chose a place from suggestions or matched recommendation was set, don't recommend
                    }
                    var place = $location.search().place;
                    _placeSearch = angular.isDefined(place) && place !== '';
                    if(_placeSearch && data.placefinder && !mapUtil.isBbox(place)) {
                        if(!_.find(data.placefinder.results, {'name': place})) {
                            //no match, show recommendations
                            $scope.hasRecommendations = true;
                            $scope.suggestions = data.placefinder.results;
                            $scope.hasSuggestions = $scope.suggestions && $scope.suggestions.length > 0;
                            //set the text to the first recommendation, that is what the search result is using
                            //$scope.location = data.placefinder.results[0].name;

                            //JD: hack. Placefinder matches don't always have a name (mgrs, wkt, etc... )
                            // so in case where it's null just set it to the original search text
                            var matchName = data.placefinder.match.name;
                            if (_.isEmpty(matchName)) {
                                matchName = data.placefinder.search.text;
                            }

                            $scope.location = matchName;

                            //set the place param to this so it doesn't ask again when navigating to other pages and back to search
                            $location.search('place', $scope.location);
                            urlUtil.updateParam('place', place, $scope.location);
                            $location.search('place.id', data.placefinder.match.id);
                            urlUtil.addParam('place.id', data.placefinder.match.id);

                            $scope.$emit('filterEvent', {refresh:false});

                        }
                    } else {
                        $scope.hasRecommendations = false;
                    }

                    if($scope.hasRecommendations) {
                        $document.on('click', docClickHandler);
                    } else {
                        $document.off('click', docClickHandler);
                    }
                });

                $scope.$on('$destroy', function() {
                    $document.off('click', docClickHandler);
                });
            }
        };
    });

angular.module('voyager.search')
    .directive('vsSuggestList', function() {

    return {
        templateUrl: 'src/suggest/suggest.html'
    };
});