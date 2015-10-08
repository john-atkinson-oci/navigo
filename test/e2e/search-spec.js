'use strict';

describe('Search', function() {

    var Util = require('../lib/util.js');

    var server = Util.getServer();

    it('should load search page', function() {
        browser.get(server + '#/search');

        var totalAnchor = element(by.css('.total'));

        var anchorText = totalAnchor.getText().then(function(text) {
            var anchorVals = text.split(' ');
            expect(parseInt(anchorVals[0]) > 0).toBeTruthy();
            return text;
        });

        var resultList = element.all(by.repeater('doc in results'));
        expect(resultList.count()).toEqual(24);

        expect(totalAnchor.getAttribute('href')).not.toBeNull();
        expect(anchorText).toContain('Results');
        expect($('#filterContainer').isDisplayed()).toBeFalsy();
        expect(element(by.css('.leaflet-map-pane')).isPresent()).toBeTruthy();
    });

    it('should load search page with filter', function() {
        browser.get(server + '#/search?fq=format_type:File');

        var selectedFilters = element.all(by.repeater('selected in filters'));
        expect(selectedFilters.count()).toEqual(1);

    });

    it('should show filters', function() {
        browser.get(server + '#/search');

        Util.waitForSpinner();

        element(by.css('.icon-filters')).click();

        expect($('#filterContainer').isDisplayed()).toBeTruthy();

    });

    it('should show facets and select facet', function() {
        browser.get(server + '#/search');

        Util.waitForSpinner();

        var startTotal = 0;
        var totalAnchor = element(by.css('.total'));

        //set the result total after load
        totalAnchor.getText().then(function(text) {
            var anchorVals = text.split(' ');
            startTotal = parseInt(anchorVals[0]);
            expect(parseInt(anchorVals[0]) > 0).toBeTruthy();
            return text;
        });

        element(by.css('.icon-filters')).click();

        var filters = element.all(by.repeater('filter in filters'));

        var filter = filters.first().element(by.tagName('a'));
        filter.click();

        filter.getAttribute('href').then(function(href) {
            var id = href.substring(href.indexOf('#'));  //href contains the id of the facets panel
            expect($(id).isDisplayed()).toBeTruthy();
        });

        var facets = element.all(by.repeater('facet in filter.values'));

        var checkFacet = facets.first().element(by.tagName('input'));  //assumes check box style for first filter
        checkFacet.isPresent().then(function(present) {
            if(present) {checkFacet.click();}
        });

        Util.waitForSpinner();

        var linkFacet = facets.first().element(by.tagName('a'));  //assumes check box style for first filter
        linkFacet.isPresent().then(function(present) {
            if(present) {linkFacet.click();}
        });

        var selectedFilters = element.all(by.repeater('selected in filters'));
        expect(selectedFilters.count()).toEqual(1);

        //check that the total is lower after applying filter
        totalAnchor.getText().then(function(text) {
            var anchorVals = text.split(' ');
            var newTotal = parseInt(anchorVals[0]);
            expect(startTotal > newTotal);
            return text;
        });

    });

    it('should show table view', function() {
        browser.get(server + '#/search?view=table');

        //workaround - this test times out for some reason
        browser.sleep(10000);
        browser.waitForAngular();

        var tableColumns = element.all(by.repeater('field in tableFields'));
        expect(tableColumns.count()).toBeGreaterThan(0);

        var rows = element.all(by.repeater('doc in $data'));
        expect(rows.count()).toBeGreaterThan(0);

    });

    it('should show map view', function() {
        browser.get(server + '#/search?view=map');

        expect(element(by.css('.alt_list_view')).isPresent()).toBeTruthy();

        var resultList = element.all(by.repeater('doc in results'));
        expect(resultList.count()).toBeGreaterThan(0);

    });

});