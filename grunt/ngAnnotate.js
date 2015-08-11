'use strict';

module.exports = {
	options: {
        singleQuotes: true
    },
    dist: {
        files: [
            {
                expand: true,
                cwd: '.tmp/concat/scripts',
                src: '*.js',
                dest: 'dist/scripts/'
            }
        ]
    }
};