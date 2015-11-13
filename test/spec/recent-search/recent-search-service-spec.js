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


		it('should not add dup place item', function () {
			var itemCount;

			sut.addObserver(function (itemMap) {
				itemCount = itemMap.length;
			});

			var savedItem = {'query': '/disp=2000', 'title': 'Voyager Default View', 'id': '23', place:'place'};
			sut.addItem(savedItem);

			var savedItem2 = {'query': '/disp=default', 'title': 'title', 'id': '1', place:'place'};
			sut.addItem(savedItem2);

			expect(itemCount).toBe(1);

			// clear for next test
			sut.deleteSearch(0);
			sut.deleteSearch(1);
		});

		it('should not add dup q item', function () {
			var itemCount;

			sut.addObserver(function (itemMap) {
				itemCount = itemMap.length;
			});

			var savedItem = {'query': '/disp=2000', 'title': 'title1', 'id': '2', place:'place', q:'q'};
			sut.addItem(savedItem);

			var savedItem2 = {'query': '/disp=default', 'title': 'title2', 'id': '3', place:'place', 'q':'q'};
			sut.addItem(savedItem2);

			expect(itemCount).toBe(1);

			// clear for next test
			sut.deleteSearch(0);
		});

		it('should not add dup q item without place', function () {
			var itemCount;

			sut.addObserver(function (itemMap) {
				itemCount = itemMap.length;
			});

			var savedItem = {'query': '/disp=2000', 'title': 'title4', 'id': '8', q:'q'};
			sut.addItem(savedItem);

			var savedItem2 = {'query': '/disp=default', 'title': 'title5', 'id': '9', 'q':'q'};
			sut.addItem(savedItem2);

			expect(itemCount).toBe(1);

			// clear for next test
			sut.deleteSearch(0);
		});


		it('should not add dup query item', function () {
			var itemCount;

			sut.addObserver(function (itemMap) {
				itemCount = itemMap.length;
			});

			var savedItem = {'query': '!func', 'title': '6', 'id': '6'};
			sut.addItem(savedItem);

			var savedItem2 = {'query': '/disp=default', 'title': '7', 'id': '7', 'q':'!func'};
			sut.addItem(savedItem2);

			expect(itemCount).toBe(1);

			// clear for next test
			sut.deleteSearch(0);
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

			// clear for next test
			sut.deleteSearch(0);

		});

	});
});