'use strict';

describe('Factory: cartItemsQuery', function () {

	var cartItemsQuery, translateService, sugar, configService, filterService, $http;
	var cfg = _.clone(config);

	beforeEach(function () {

		module('cart');
		module('voyager.util');
		module('voyager.filters');
		module('voyager.config');
		module(function ($provide) {
			$provide.constant('config', cfg);
		});

		inject(function (_cartItemsQuery_, _translateService_, _sugar_, _configService_, _filterService_, $httpBackend) {
			cartItemsQuery = _cartItemsQuery_;
			translateService = _translateService_;
			sugar = _sugar_;
			configService = _configService_;
			filterService = _filterService_;
			$http = $httpBackend;
		});
	});

	function escapeRegExp(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
	}

	// Specs here
	it('should execute and fetch items', function () {
		var queryCriteria = {count: 1, params:{}};
		var items;
		var docs = [{id:'junk', name:'name'},{id:'2', name:'name2', format:'junk',thumb:'vres/mime'}];

		$http.expectJSONP().respond({response: {docs:docs}});

		cartItemsQuery.execute(queryCriteria, items).then(function(res) {
			var doc1 = res.docs[0];
			var doc2 = res.docs[1];

			expect(doc1.id).toBe('junk');
			expect(doc1.displayFormat).toBe('Unknown');

			expect(doc2.id).toBe('2');
			expect(doc2.displayFormat).toBe('junk');
			expect(doc2.defaultThumb).toBeTruthy();
		});
		$http.flush();
	});

	it('should execute and fetch summary', function () {
		var queryCriteria = {count: 500, params:{}};
		var items = ['junk', 5, 'trunk', 3];
		var data = {facet_counts:{facet_fields:{format:items}},response:{numFound: 5}};

		$http.expectJSONP().respond(data);

		cartItemsQuery.execute(queryCriteria, items).then(function(res) {
			var doc1 = res.docs[0];
			var doc2 = res.docs[1];

			expect(doc1.key).toBe('junk');
			expect(doc1.displayFormat).toBe('junk');
			expect(doc1.count).toBe(5);

			expect(doc2.count).toBe(3);
			expect(doc2.key).toBe('trunk');
			expect(doc2.displayFormat).toBe('trunk');
		});
		$http.flush();
	});

	it('should execute and fetch items and apply single items', function () {
		var queryCriteria = {count: 1, params:{}};
		var items = ['item1','item2'];
		var docs = [{id:'junk', name:'name'},{id:'2', name:'name2', format:'junk',thumb:'vres/mime'}];

		// verifies the url contains the items
		var urlPattern = escapeRegExp('q=id:(item1 item2)');
        var expr = new RegExp(urlPattern);

		$http.expectJSONP(expr).respond({response: {docs:docs}});

		cartItemsQuery.execute(queryCriteria, items).then(function(res) {
			var doc1 = res.docs[0];
			var doc2 = res.docs[1];

			expect(doc1.id).toBe('junk');
			expect(doc1.displayFormat).toBe('Unknown');

			expect(doc2.id).toBe('2');
			expect(doc2.displayFormat).toBe('junk');
			expect(doc2.defaultThumb).toBeTruthy();
		});
		$http.flush();
	});

});