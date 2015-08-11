describe('Service:', function () {
	'use strict';

	beforeEach(function () {
		module(function ($provide) {
			$provide.constant('config', {});
		});

		module('portalApp');
	});

	describe('recentSearchService', function () {

		var sut, scope, localStorage;

		beforeEach(inject(function (recentSearchService, localStorageService, $rootScope) {
			sut = recentSearchService;
			scope = $rootScope.$new();
			localStorage = localStorageService;
		}));


		it('should add item', function () {
			spyOn(localStorage, 'add');
            spyOn(localStorage, 'get');

			var itemCount;

			sut.addObserver(function (itemMap) {
				itemCount = itemMap.length;
			});

			var savedItem = {'query': '/disp=2000', 'title': 'Voyager Default View', 'id': '23'};
			sut.addItem(savedItem);
			expect(itemCount).toBe(1);
		});

		it('should change item status to unsaved', function () {
            spyOn(localStorage, 'add');
            spyOn(localStorage, 'get');
			var items,
				id = 23;

			sut.addObserver(function (itemMap) {
				items = itemMap;
			});

			var savedItem = {'query': '/disp=2000', 'title': 'Voyager Default View', 'id': id, 'saved': 'true'};
			sut.addItem(savedItem);
			sut.changeSaveStatus(23);

			var i=0,
				t=items.length;

			for (; i<t; i++) {
				if (items[i].id === id) {
					expect(i).toBe(0);
					expect(items[i].saved).toBe(false);
					break;
				}
			}

		});

	});
});