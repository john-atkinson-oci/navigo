
module.exports = {
    navigo: {   // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
        options: {
            configFile: 'e2e.conf.js', // Target-specific config file
            args: {
                includeStackTrace:true
            } // Target-specific arguments
        }
    }
};