'use strict';

describe('Clip Data by Polygon Task where output format is SHP', function() {

    var Util = require('../lib/util.js');
    var server = Util.getServer();


    function _addFileTypeToQueue() {

        // Search for CA OZONE feature classes.
        browser.get(server + '#/search?q=name:ca_ozone_pts&disp=71f42f58&view=card');
        Util.waitForSpinner();

        // Login into Voyager
        Util.loginToVoyager('admin', 'admin');
        browser.waitForAngular();

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

    it('should load clip_data_by_polygon task and set output format to SHP', function() {

        // Search for results and add to queue
        _addFileTypeToQueue();

        // Open Clip Data by Polygon task UI
        browser.get(server + '#/queue?disp=default&task=clip_data');
        Util.waitForSpinner();

        // Get the task parameter elements.
        var paramList = element.all(by.repeater('p in params'));

        // Verify we have the correct number of params
        expect(paramList.count()).toBe(4);

        // Verify default values for output format and projection
        var expectedValues = ['', 'FileGDB', 'Same As Input'];
        var selectChoiceElements = element.all(by.css('.select2-choice')).all(by.css('.select2-chosen'));
        for (var i = 0; i < expectedValues.length; ++i) {
            expect(selectChoiceElements.get(i).getText()).toEqual(expectedValues[i]);
        }

        // Set the output format from FileGDB to SHP
        selectChoiceElements.filter(function(elem) {
            return elem.getText().then(function(text) {
                return text === 'FileGDB';
            });
        }).click();
        var selectTextBox = element(by.css('.select2-input.select2-focused'));
        selectTextBox.sendKeys('SHP');
        selectTextBox.sendKeys(protractor.Key.ENTER);


        // Execute the task
        Util.waitForSpinner();
        element(by.css('[ng-click="execTask()"]')).click();
        browser.sleep(10000); // Sleep required to avoid timeout
        browser.waitForAngular();

        // Verify there are no errors or warnings (warnings may be possible bug and to be investigated)
        expect(browser.getCurrentUrl()).toMatch(/\/#\/status/);
        expect(element(by.css('.alert-error')).isPresent()).toBeFalsy();
        expect(element(by.css('.alert-warning')).isPresent()).toBeFalsy();
    });
});