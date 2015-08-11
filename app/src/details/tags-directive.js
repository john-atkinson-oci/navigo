/* global angular */
angular.module('voyager.details')
    .directive('vgTags', function($timeout, tagService, $window, searchService) {
        'use strict';

        function _decorateTags() {
            var $container = $('#s2id_labels');
            var $tags = $container.children('.select2-choices').children('.select2-search-choice').children('div');
            var hasTags = false;
            $.each($tags, function(name, value) {
                $(value).hover( function(e) {
                    $(e.currentTarget).css({'text-decoration':'underline', 'cursor':'pointer'});
                }, function(e) {
                    $(e.currentTarget).css({'text-decoration':'none', 'cursor':'auto'});
                });
                hasTags = true;
            });
            return hasTags;
        }

        function _searchByTag() {
            $('#labels').off('choice-selected');
            $('#labels').on('choice-selected', function(e,v) {
                var tag = $(v).text().trim();
                if (searchService.getLastSearch().indexOf('?') === -1) {
                    $window.location.href = searchService.getLastSearch() + '?fq=tag_tags:' + tag;
                } else {
                    $window.location.href = searchService.getLastSearch() + '&fq=tag_tags:' + tag;
                }
            });
        }

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, el, attrs) {
                return scope.$watch(attrs.ngModel, function (newValues, last) {
                    $timeout(function() {  //defer until scope is done
                        if (_decorateTags()) {
                            _searchByTag();
                        }
                    },0);

                    if(!_.isEqual(newValues, last) && !scope.loading) {
                        tagService.saveLabels(scope.doc.id, newValues);
                    }
                });
            }
        };
    });