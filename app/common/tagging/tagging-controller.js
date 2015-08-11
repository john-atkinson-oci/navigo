/*global angular, $, _, config*/
angular.module('voyager.tagging')
    .controller('TaggingCtrl', function ($scope, tagService) {
        "use strict";

        $scope.doc = $scope.getDoc();
        $scope.field = config.tagFields[0].field;
        $scope.tagFields = config.tagFields;

        function _fetch() {
            tagService.fetch($scope.doc.id).then(function(res) {
                $scope.tags = res.data.response.docs;
                $scope.working = false;
            });
        }

        _fetch();

        $scope.save = function() {
            $scope.hasError = false;
            $scope.working = true;
            tagService.save($scope.doc.id, $scope.field, $scope.value).then(function() {
                $scope.value = '';
                $scope.isSuccess = true;
                _fetch();
            }, function(error) {
                $scope.working = false;
                $scope.hasError = true;
                $scope.error = error.data.error;
            });

        };

        $scope.humanize = function(value) {
            return value.replace(/_/g, ' ').replace(/(\w+)/g, function (match) {
                return match.charAt(0).toUpperCase() + match.slice(1);
            });
        };

        $scope.delete = function(pk) {
            tagService.delete(pk).then(function() {
                _fetch();
            });
        };

    });
