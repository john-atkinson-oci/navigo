'use strict';

angular.module('voyager.filters').
    factory('calendarFilter', function () {

        function _styleDate(num) {
            return (num < 10) ? '0' + num : num;
        }

        function _validateDate(date, facet, formattedDate) {
            if (date !== '') {
                if (isNaN(formattedDate.getTime())) {
                    facet.minError = 'error';
                    return true;
                } else {
                    facet.minError = '';
                }
            } else {
                facet.minError = 'error';
                return true;
            }
            return false;
        }

        return {
            decorate : function (facet) {
                var calendar = facet.model;
                var minDate = new Date(calendar[0]);
                var maxDate = new Date(calendar[1]);

                var seeError = _validateDate(calendar[0], facet, minDate);

                if (seeError) {
                    _validateDate(calendar[1], facet, maxDate);  //TODO what if this fails?
                } else {
                    seeError = _validateDate(calendar[1], facet, maxDate);
                }

                if (!seeError) {
                    var formatMinDate = minDate.getFullYear() + '-' + _styleDate(minDate.getMonth() + 1) + '-' + _styleDate(minDate.getDate());
                    var formatMaxDate = maxDate.getFullYear() + '-' + _styleDate(maxDate.getMonth() + 1) + '-' + _styleDate(maxDate.getDate());

                    if (formatMinDate > formatMaxDate) {
                        facet.maxError = 'error';
                        facet.minError = 'error';
                    } else {
                        facet.humanize = facet.display + ': [' + formatMinDate + 'T07:00:00Z TO ' + formatMaxDate + 'T07:00:00Z]';
                        facet.model[0] = formatMinDate + 'T07:00:00Z';
                        facet.model[1] = formatMaxDate + 'T07:00:00Z';
                        return facet;
                    }
                }
                return false;
            }
        };

    });
