var s2Util = (function () {
    'use strict';

    return {
        setText: function(elem, val) {
            elem.element(by.css('.select2-choice')).click();

            var input = element(by.css('.select2-input.select2-focused'));

            return input.isDisplayed().then(function(visible) {
                if(visible) {
                    input.sendKeys(val);
                    input.sendKeys(protractor.Key.ENTER);
                }
                return !visible;
            });
        }

    };
})();  // jshint ignore:line
module.exports = s2Util;