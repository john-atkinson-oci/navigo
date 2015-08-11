module.exports = {
    dist: {
        src: ['dist/scripts/scripts.js'],
        actions: [{
            search: '@build.revision@',
            replace: '<%= grunt.config("build.revision") %>'
        }]
    }
};