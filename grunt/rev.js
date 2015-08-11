'use strict';

module.exports = {
	dist: {
		files: {
			src: [
				'<%= yeoman.dist %>/script/{,*/}*.js',
				'<%= yeoman.dist %>/assets/{,*/}*.css',
				'<%= yeoman.dist %>/assets/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
				'<%= yeoman.dist %>/assets/fonts/*'
			]
		}
	}
};