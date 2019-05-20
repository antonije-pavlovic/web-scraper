'use strict';
const puppeteer = require('puppeteer');
const ProxyList=require('../Proxy/ProxyList');
const UserAgents=require('../Proxy/UserAgents');

class ChromeHeadLess {
    constructor(options,domain_id) {
        this.Browser=false;
        this.Page=false;
        this.CountBrowsers=0;
        this.TerminateBrowser=100;
        this.RepeatRequest=10;
        this.timeout='timeout' in options ? options.timeout:30000;
        this.waitUntil='waitUntil' in options ? options.waitUntil:'networkidle0';
        this.Height='height' in options?options.height:768;
        this.headless = 'headless' in options ? options.headless : false;
    }
    async OpenBrowser(callback) {
        let selected_proxy = ProxyList[Math.floor(Math.random() * ProxyList.length)];
        let proxy = selected_proxy.split('@')[1];
        const username = selected_proxy.split(':')[0];
        const password = selected_proxy.split(':')[1].split('@')[0];    
        const randomUserAgents = UserAgents[Math.floor(Math.random() * UserAgents.length)];
        
        const browser = await puppeteer.launch({
           args:[               
               '--ignore-certificate-errors',
                '--no-sandbox'
           ],
             headless: this.headless,
            'ignoreHTTPSErrors':true,
        });
        const userAgent = await browser.userAgent();
        console.log(randomUserAgents);
        const page = await browser.newPage();
        await page.authenticate({ username, password });
        await page.setViewport({width: 1366, height: this.Height});//1366x768
        await page.setUserAgent(randomUserAgents);

        this.Browser=browser;
        this.Page=page;
        return callback(page);
    }
    async CloseBrowser(callback){
        await this.Page.close();
        await this.Browser.close();
        return callback('browser Closed');
    }
    async GoTo(url, options={}, type, callback, skip=false) {
        if(!url)
            return callback(true);
        if(!this.Page){
            //browser is terminated
            global.ErrorCustom.Save(that.domain_id,pzn,'Browser. er Terminated!','',category,keyword);
            return callback(true);
        }
        let waitUntil='waitUntil' in options?options.waitUntil:this.waitUntil;
        let err_msg='';
        (async function loop(i) {
            if(i > 10){
                if(err_msg.indexOf('Skip') == -1) 
                    global.ErrorCustom.Save(that.domain_id, pzn, err_msg, 'request failed more then 7 times;', category, keyword);                
                return callback(true);
            }
            try {
                let response = await that.Page.goto(url, {
                    'timeout':'timeout' in options ? options.timeout : that.timeout,
                    waitUntil:waitUntil
                });

                let headers=response['_headers'];
                let statusCode=response['_status']+'';
                let requestedUrl=response['_url'];

                if('selector' in options) {
                    await that.Page.mainFrame().executionContext();
                    await that.Page.waitForSelector(options.selector, { timeout:'timeout' in options ? options.timeout : 30000 })
                }
                let bodyHTML = await that.Page.evaluate(() => document.documentElement.outerHTML);
                //is server error is 4XX then no error saved just return to the parser
                if(statusCode.startsWith('4')) {
                    if(statusCode==403)
                        throw new Error('403-repeat');                    
                    return callback(statusCode);
                }
                //doesnt work on headless mode
                if(statusCode.startsWith('5')) 
                    throw new Error(statusCode);                

                if(!bodyHTML||statusCode!='200') {
                    console.log('no bodyHtml or no statusCode!',statusCode);
                    setTimeout(function(){
                        return loop(++i);
                    },1000)
                    return false;
                }
                
                return callback(null, {
                    'html':bodyHTML,
                    'headers':headers,
                    'statusCode':statusCode,
                    'requestedUrl':requestedUrl,
                    'pzn':pzn,
                    'title':title,
                });

            }catch (err) {
                 err_msg=err.stack;
                if(err.stack.indexOf('Error: Navigation Timeout Exceeded') > -1) {
                    err_msg='Error: Navigation Timeout Exceeded';
                }else if(err.stack.indexOf('Error: net::ERR_TUNNEL_CONNECTION_FAILED') > -1) {
                    err_msg='Error: net::ERR_TUNNEL_CONNECTION_FAILED';
                }else if(err.stack.indexOf('403-repeat')>-1) {
                    err_msg='403-repeat';
                }else if(err.stack.indexOf('Error: net::ERR_TOO_MANY_REDIRECTS') > -1) {
                    err_msg='Error: net::ERR_TOO_MANY_REDIRECTS';
                    return loop(100);
                }else if(err.stack.indexOf('Error: net::ERR_INVALID_REDIRECT') > -1) {
                    err_msg='Error: net::ERR_INVALID_REDIRECT';
                    return loop(100);
                }else if(err.stack.indexOf('Error: net::ERR_EMPTY_RESPONSE') > -1) {
                    err_msg='Error: net::ERR_EMPTY_RESPONSE';
                    console.log(err_msg,'Browser is in sleep mode!!!!')
                    setTimeout(() => {
                        return loop(++i);
                    },20000);
                    return false;
                }else if(err.stack.indexOf('Error: net::ERR_CONNECTION_CLOSED') > -1) {
                    err_msg='Error: net::ERR_CONNECTION_CLOSED';
                    console.log(err_msg,'Browser is in sleep mode!!!!')
                    setTimeout(() => {
                        return loop(++i);
                    },20000);
                    return false;
                }else if(err.stack.indexOf('Skip') > -1) {
                    err_msg='Skip';
                    return loop(100);
               }
                else if(err.stack.indexOf('Session closed. Most likely the page has been closed.') > -1) {
                    err_msg='Session closed. Most likely the page has been closed.';
                    return loop(++i);
                }
                that.CloseBrowser( msg => {
                    if( ++that.CountBrowsers>that.TerminateBrowser) {
                        that.Page=false;
                        that.Browser=false;
                        return callback(true);
                    }
                    that.OpenBrowser( page => {
                        that.Page = page;
                        return loop(++i);
                    });
                });
            }
        }(0));
    }
}
module.exports = ChromeHeadLess;
