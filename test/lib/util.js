var Util = (function () {
    'use strict';

    return {
        waitForSpinner: function() {
            //wait for the block-ui overlay to go away
            var block = element(by.css('.block-ui-overlay'));
            browser.wait(function () {
                return block.isDisplayed().then(function (result) {
                    return !result;
                });
            }, 60000);
            return block;
        },

        getServer: function() {
            return 'http://voyagerdemo.com/daily/navigo/';
        }
    };
})();  // jshint ignore:line
module.exports = Util;