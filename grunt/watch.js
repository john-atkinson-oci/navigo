'use strict';

// Watches files for changes and runs tasks based on the changed files
module.exports = {
	js: {
		files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
		tasks: ['newer:jshint:all'],
		options: {
			livereload: true
		}
	},
	jsTest: {
		files: ['test/spec/{,*/}*.js'],
		tasks: ['newer:jshint:test', 'karma']
	},
	compass: {
		files: ['<%= yeoman.app %>/styles/{,**/}*.{scss,sass}'],
		tasks: ['compass:server', 'autoprefixer']
	},
	gruntfile: {
		files: ['Gruntfile.js']
	}
};