function getBrowser() {
    'use strict';
    var ua= navigator.userAgent, tem,
        M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\bOPR\/(\d+)/);
        if(tem !== null) {
            return 'Opera '+tem[1];
        }
    }
    M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i)) !== null) {
        M.splice(1, 1, tem[1]);
    }
    return {'name':M[0],'version':M[1]};
}

var browser = getBrowser();
if(browser.name === 'IE' || browser.name === 'MSIE') {
    var globalHtml = $('html');
    var version = parseInt(browser.version);
    if (version < 9) {
        globalHtml.addClass('lt-ie9');
    }
    if (version < 8) {
        globalHtml.addClass('lt-ie8');
    }
    if (version < 7) {
        globalHtml.addClass('lt-ie7');
    }
}