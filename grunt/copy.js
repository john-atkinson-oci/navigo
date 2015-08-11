'use strict';

module.exports = {
  dist: {
    files: [
      {
        expand: true,
        dot: true,
        cwd: '<%= yeoman.app %>',
        dest: '<%= yeoman.dist %>',
        src: [
          //'*.{ico,png,txt}',
          '.htaccess',
          'config.js',
          '*.html',
          'assets/{,**/}*',
          'src/{,*/}*.html',
          'src/{,*/}*/*/*.html',
          'json/*',
          'settings/*',
          'common/{,*/}*.html',
          'common/{,*/}*/*/*.html',
          'projections.json',
          '!assets/js/vendor/**'
        ]
      },
      {
        expand: true,
        cwd: '.tmp/images',
        dest: '<%= yeoman.dist %>/images',
        src: ['generated/*']
      }
    ]
  }
};