module.exports = {
    default: {
        options: {
            thresholds: {
                'statements': 70,
                'branches': 50,
                'lines': 70,
                'functions': 60
            },
            dir: 'coverage/threshold',
            root: 'test'
        }
    }
};