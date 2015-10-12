'use strict';


describe('Zip Files Task', function() {

    var Util = require('../lib/util.js');
    var server = Util.getServer();

    function _addFileTypeToQueue() {
        browser.get(server + '#/search?disp=b67872f7&view=card&filter=true&q=csv&fq=format:text%5C%2Fplain');
        Util.waitForSpinner();

        // Login into Voyager
        Util.loginToVoyager('admin', 'admin')
        browser.waitForAngular();

        // Search for some Text files by keyword.
        browser.get(server + '#/search?disp=b67872f7&view=card&filter=true&q=csv&fq=format:text%5C%2Fplain');
        Util.waitForSpinner();

        // Get the Add to Queue element
        var addToQueueAnchor = element(by.css('.total.flyout_trigger.ng-binding'));

        // Get the result total -- check if greater than 0.
        var result_count = 0;
        addToQueueAnchor.getText().then(function(text) {
            var result_text = text.split(' ');
            result_count = parseInt(result_text[0]);
            expect(parseInt(result_count) > 0).toBeTruthy();
            return text;
        });

        // Add all items to the cart
        addToQueueAnchor.click();
        element(by.css('[ng-click="addAllToCart()"]')).click();
        Util.waitForSpinner();
    }

    // Load and run Zip Files task
    it('should load zip_files task', function() {

        _addFileTypeToQueue();
        browser.get(server + '#/queue?disp=default&task=zip_files');
        Util.waitForSpinner();

        // Verify items got added to the queue.
        var queueCountElement = element(by.css('[ng-if="cartItemCount"]'));
        var queue_count = 0;
        queueCountElement.getText().then(function(text) {
            var result_text = text;
            queue_count = parseInt(result_text);
            expect(parseInt(queue_count) > 0).toBeTruthy();
            return text;
        });

        // Get list of parameters
        var paramList = element.all(by.repeater('p in params'));

        // Verify we have the correct number of params
        expect(paramList.count()).toBe(2);
        Util.waitForSpinner();  //can't click until spinner is gone

        // Execute the task with default parameter values
        element(by.css('[ng-click="execTask()"]')).click();
        browser.waitForAngular();

        // Check the status and expect no errors
        expect(browser.getCurrentUrl()).toMatch(/\/#\/status/);
        expect(element(by.css('.alert-error')).isPresent()).toBeFalsy();
    });
});