module.exports = {
    options: {
        configFile: 'node_modules/protractor/example/conf.js', // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
            // Arguments passed to the command
        }
    },
    navigo: {   // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
        options: {
            configFile: 'e2e.conf.js', // Target-specific config file
            args: {
                includeStackTrace:true
            } // Target-specific arguments
        }
    }
};