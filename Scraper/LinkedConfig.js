'use strict';
class LinkedConfig{

    constructor(){
        this.encoding=null;
        this.encoding_iv='ISO-8859-15';
        this.id=5;
        this.url='https://www.linkedin.com/';
        this.companyUrl='https://www.linkedin.com/company';
        this.timeout=20000;
        this.jar=false;
        this.user_agent='google';
        this.cheerio=global.cheerio;
        this.ChromeConfig={
            'waitUntil':'load'
        };
        this.BrowsersMax=5;
        this.ProductBrowsers=1;
        this.PromoBrowsers =1;
        this.KWBrowsers=1;
    }

    ProductInfo(){
        throw 'ProductInfo method is required';
    }
}
module.exports = LinkedConfig;