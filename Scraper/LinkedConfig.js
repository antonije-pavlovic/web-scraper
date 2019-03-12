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
    }
}
module.exports = LinkedConfig;