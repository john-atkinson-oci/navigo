module.exports = {
    default: {
        options: {
            thresholds: {
                'statements': 80,
                'branches': 60,
                'lines': 80,
                'functions': 70
            },
            dir: 'coverage/threshold',
            root: 'test'
        }
    }
};