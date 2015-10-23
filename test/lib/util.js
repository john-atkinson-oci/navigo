var Util = (function () {
    'use strict';

    function checkResultsCount(addToQueueAnchor) {
        //Get the result total -- check if greater than 0.
        var result_count = 0;
        addToQueueAnchor.getText().then(function (text) {
            var result_text = text.split(' ');
            result_count = parseInt(result_text[0]);
            expect(parseInt(result_count) > 0).toBeTruthy();
            return text;
        });
    }

    return {

        waitForSpinner: function() {
            //wait for the block-ui overlay to go away
            var block = element(by.css('.block-ui-overlay'));
            return browser.wait(function () {
                return block.isDisplayed().then(function (result) {
                    return !result;
                });
            }, 30000);
        },

        getServer: function() {
            return 'http://voyagerdemo.com/daily/navigo/';
        },

        loginToVoyager: function(username, password) {

            // check if already logged in
            //element(by.css('[ng-click="toggleMobileNav()"]')).click();
            //browser.waitForAngular();
            var loginLink = element(by.css('[ng-click="login()"]'));
            return loginLink.isDisplayed().then(function(isVisible) {
                if(isVisible) {
                    loginLink.click();
                    browser.waitForAngular();

                    var user = element(by.css('[name="username"]'));
                    var pass = element(by.css('[name="password"]'));
                    user.sendKeys(username);
                    pass.sendKeys(password);
                    element(by.css('[ng-click="ok()"]')).click();
                }
                return !isVisible;
            });
        },

        addFileTypeToQueue: function(query) {
            // Search for CA OZONE feature classes.
            browser.get(this.getServer() + '#/search?q=' + query + '&disp=71f42f58&view=card');

            this.waitForSpinner();
            this.waitForSpinner();
            this.waitForSpinner();  //TODO fix this it doesn't really block its a promise

            // Login into Voyager
            this.loginToVoyager('admin', 'admin');
            browser.waitForAngular();

            // Get the Add to Queue element
            var addToQueueAnchor = element(by.css('.total.flyout_trigger.ng-binding'));
            checkResultsCount(addToQueueAnchor);
            // Add all items to the cart
            browser.actions().mouseMove(addToQueueAnchor).click(addToQueueAnchor).perform();
            element(by.css('[ng-click="addAllToCart()"]')).click();
        }

    };
})();  // jshint ignore:line
module.exports = Util;