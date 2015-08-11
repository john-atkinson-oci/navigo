/*global angular, $ */

angular.module('voyager.component')
	.directive('vsHighlight', function() {
		'use strict';

		return {
			restrict: 'A',
			link: function(scope, element) {
				var parent = $(element);

				parent.on('mouseover', 'a', function(event){
					_unhighlight();
					_highlight(event);
				}).on('mouseout', 'a', function(event){

					var id = $(event.currentTarget).attr('id');
				    var index = parseInt(id.replace('locationPath', ''));
				    var highlightList = $('#locationPathWrap a');

					for (var i=highlightList.length; i>=index; i--) {
						$('#locationPathNotHighlight').prepend($('#locationPath' + i));
					}

					_unhighlight();
				});

				function _unhighlight() {
					if ( document.selection) {
				        document.selection.empty();
				    } else if (window.getSelection) {
				        window.getSelection().removeAllRanges();
				    }
				}

				function _highlight(event) {
					var id = $(event.currentTarget).attr('id');
				    var index = parseInt(id.replace('locationPath', ''));
				    var highlightList = $('#locationPathWrap a');
				    var range;

				    if (index >= highlightList.length) {
						for (var i=highlightList.length; i<=index; i++) {
							$('#locationPathWrap').append($('#locationPath' + i));
						}
					}

				    if (document.body.createTextRange) { // ms
			            range = document.body.createTextRange();
						range.moveToElementText(document.getElementById('locationPathWrap'));
			            range.select();
				    } else if (window.getSelection) { // moz, opera, webkit
				        var selection = window.getSelection();
				        selection.removeAllRanges();
			            range = document.createRange();
						range.selectNodeContents(document.getElementById('locationPathWrap'));
			            selection.addRange(range);
				    }
				}

			} //link
		};
	});

