/*global angular, $, _, queryString*/
angular.module('voyager.tagging')
    .controller('TagDialog', function($scope, $modalInstance, $analytics, tagService, doc) {
        'use strict';

        $scope.doc = doc;

        $scope.getDoc = function() {
            return doc;
        };

        $scope.ok = function () {
            tagService.save($scope.id, $scope.field, $scope.value).then(function(response) {
                $modalInstance.close();
                $analytics.eventTrack('tag', {
                    category: 'results'
                });
            }, function(error) {
                console.log(error.data);
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    });