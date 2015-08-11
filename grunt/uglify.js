module.exports = {
    options: {
        report: 'min',
            mangle: false
    },
    dist: {
        files: {
            '<%= yeoman.dist %>/scripts/scripts.js': [
                '<%= yeoman.dist %>/scripts/scripts.js'
            ]
        }
    }
};