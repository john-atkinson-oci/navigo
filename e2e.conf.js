exports.config = {
    //seleniumAddress: 'http://localhost:4444/wd/hub',

    //directConnect: true,

    // Capabilities to be passed to the webdriver instance.
    capabilities: {
        'browserName': 'chrome'
    },

    // Spec patterns are relative to the current working directly when
    // protractor is called.
    specs: ['test/e2e/*'],

    // Options to be passed to Jasmine-node.
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000,
        includeStackTrace: true,
        isVerbose: true
    },

    verbose:true,

    debug:true
};