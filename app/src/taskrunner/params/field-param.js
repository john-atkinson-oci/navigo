'use strict';

angular.module('taskRunner')
    .directive('vsFieldParam', function (fieldService) {

        return {
            replace: true,
            scope: {
                param: '=',
                show: '='
            },
            template: '<input type="hidden" ui-select2="fieldOptions" ng-model="param.value" style="width: 100%;">',
            controller: function ($scope, $element, $attrs) {

                var _fields = [];

                var isMultiple = $attrs.multi !== 'false';

                $scope.fieldOptions = {
                    'multiple': isMultiple,
                    'simple_tags': true,
                    dropdownAutoWidth: true,
                    minimumResultsForSearch: 10,
                    data: function() {
                        return {results:_fields};
                    }
                };


                fieldService.fetchFields().then(function(fields) {
                    _.each(fields, function(field) {
                        if(field.name.indexOf('_') !== 0) {
                            _fields.push({id:field.name,text:field.disp_en});
                        }
                    });
                });
            }
        };
    });