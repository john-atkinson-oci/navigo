// Test settings
module.exports = {
    unit: {
        configFile: 'karma.conf.js',
        browsers: ['PhantomJS'],
        singleRun: true,
        reporters: ['dots', 'junit', 'coverage'],
        junitReporter: {
            outputFile: 'test-results.xml'
        }
    },
    chrome: {
        configFile: 'karma.conf.js',
        browsers: ['Chrome'],
        singleRun: false,
        reporters: ['dots', 'junit', 'html'],
        junitReporter: {
            outputFile: 'test-results.xml'
        }
    },
    continuous: {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: ['PhantomJS'],
        reporters: ['dots', 'junit'],
        junitReporter: {
            outputFile: 'test-results.xml'
        }
    }
};