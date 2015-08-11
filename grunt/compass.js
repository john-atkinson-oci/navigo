'use strict';

module.exports = {
	options: {
		sassDir: '<%= yeoman.app %>/styles',
		cssDir: '<%= yeoman.app %>/assets/css',
		generatedImagesDir: '.tmp/images/generated',
		imagesDir: '/assets/img',
		javascriptsDir: '<%= yeoman.app %>/scripts',
		fontsDir: '/assets/fonts',
		importPath: '<%= yeoman.app %>/bower_components',
		httpImagesPath: '/assets/img',
		httpGeneratedImagesPath: '/assets/img/generated',
		httpFontsPath: '/assets/fonts',
		relativeAssets: false,
		assetCacheBuster: false,
		raw: 'Sass::Script::Number.precision = 10\n'
	},
	dist: {
		options: {
		  generatedImagesDir: '/assets/img'
		}
	},
	server: {
		options: {
		  debugInfo: true
		}
	}
};