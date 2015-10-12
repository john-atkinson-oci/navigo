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
        },

        loginToVoyager: function(username, password) {
            // Function for logging into Voyager.
            element(by.css('[ng-click="toggleMobileNav()"]')).click();
            element(by.css('[ng-click="login()"]')).click();
            browser.waitForAngular();

            var user = element(by.css('[name="username"]'));
            var pass = element(by.css('[name="password"]'));
            user.sendKeys(username);
            pass.sendKeys(password);
            element(by.css('[ng-click="ok()"]')).click();
        }

    };
})();  // jshint ignore:line
module.exports = Util;