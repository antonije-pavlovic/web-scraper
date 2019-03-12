'use strict';
const LinkedConfig = require('./LinkedConfig');
const fs = require('fs');
const AutoScroll = require('./modules/Scroll');
class Linked extends LinkedConfig {

    constructor(db){
        super();
        this.DB = db;
    }

    StartPage(companies,callback){
        let that = this;
        let url = this.url;
        console.log(url);
        let email = 'zimmerhans912@gmail.com';
        let password = '%#$%#$%$#';
        const Chrome =  new global.Chrome(this.ChromeConfig, this.id);
        Chrome.OpenBrowser(async page => {
            let cookie = fs.readFileSync(__dirname + '/../cookie.txt',{encoding:'utf8'});
            console.log(typeof cookie);
            if(cookie.length){
                console.log('uso baki');
                cookie = JSON.parse(cookie);
                console.log(typeof  cookie);
                await Chrome.Page.setCookie(...cookie);
            }
            Chrome.GoTo(url,{},'',async (err,res) => {
                if(err){
                    console.error(err);
                    return false;
                }
                try{
                    let $ = this.cheerio.load(res.html);
                    if($('a.sign-in-link').length){
                        await Chrome.Page.click('a.sign-in-link');
                    }
                    if($('input#login-email').length){
                        await Chrome.Page.click('input#login-email');
                        await Chrome.Page.keyboard.type(email,{delay:248});

                        await Chrome.Page.click('input#login-password');
                        await Chrome.Page.keyboard.type(password,{delay: 229});

                        await Chrome.Page.waitFor(697);
                        await Chrome.Page.click('#login-submit');
                        await Chrome.Page.waitForNavigation();

                        let cookie = await Chrome.Page.cookies();
                        cookie = JSON.stringify(cookie);
                        fs.writeFileSync(__dirname + '/../cookie.txt',cookie);
                    }

                   Chrome.GoTo(that.companyUrl, {}, '', (err,res) => {
                       (async function loop(i) {
                           if(companies[i] === undefined){
                               Chrome.CloseBrowser(msg => console.log(msg));
                               return callback();
                           }
                           let companie = companies[i].company_name;
                           let links = [];
                           await Chrome.Page.waitFor(5000);
                           await page.focus( 'input.typeahead__input' );
                           await page.keyboard.down( 'Control' );
                           await page.keyboard.press( 'A' );
                           await page.keyboard.up( 'A' );
                           await page.keyboard.up( 'Control' );
                           await page.keyboard.press( 'Backspace' );

                           await Chrome.Page.click('input.typeahead__input');
                           await Chrome.Page.keyboard.type(companie,{delay:276});
                           await Chrome.Page.keyboard.press('Enter');
                           await Chrome.Page.waitForNavigation();

                           //strana kompanije
                           await Chrome.Page.click('.org-company-employees-snackbar__details-highlight.snackbar-description-see-all-link');
                           await Chrome.Page.waitForNavigation();
                           let body = await Chrome.Page.content();
                           $ = that.cheerio.load(body);
                           if($('div.search-result__info > a.search-result__result-link').length === 0)
                               return loop(++i);
                           await AutoScroll(Chrome.Page);

                           //pokupi linkkove odradi paginaciju ako je izduvam vratim se na stranicu copmpany i lupujem iz pocetka
                           (async function pagination(x) {
                               if(x === 1){
                                let tmp =  $('div.search-result__info > a.search-result__result-link');
                                for(let j = 0 ; j < tmp.length ; j++){
                                    let link = $(tmp[j]).attr('href');
                                    if(link === '#')
                                        continue;
                                    if(link.indexOf('http') === -1)
                                        link = that.url + link.substr(1);
                                    links.push(link);
                                }
                                let url = await Chrome.Page.url();
                                that.UrlRotator(Chrome,links,() => {
                                    Chrome.GoTo(url, {}, '', async (err,res) => {
                                        $ = that.cheerio.load(res.html);
                                        if($('button.next').length){
                                            $ = null;
                                            await Chrome.Page.click('button.next');
                                            await Chrome.Page.waitForNavigation();
                                            await Chrome.Page.waitForSelector('a.search-result__result-link');
                                            $ = that.cheerio.load(await Chrome.Page.content());
                                            return pagination(++x)
                                        }else{
                                            Chrome.GoTo(that.companyUrl, {}, '', (err,res) => {
                                                $ = null;
                                                return loop(++i)
                                            })
                                        }
                                    })
                                 })
                               }else{
                                  await AutoScroll(Chrome.Page);
                                  links = [];
                                  if($('div.search-result__info > a.search-result__result-link').length){
                                      let tmp =  $('div.search-result__info > a.search-result__result-link');
                                      for(let j = 0 ; j < tmp.length ; j++){
                                          let link = $(tmp[j]).attr('href');
                                          if(link === '#')
                                              continue;
                                          if(link.indexOf('http') === -1)
                                              link = that.url + link.substr(1);
                                          links.push(link);
                                      }
                                      let url = await Chrome.Page.url();
                                      that.UrlRotator(Chrome,links,() => {
                                          Chrome.GoTo(url, {}, '', async (err,res) => {
                                              $ = that.cheerio.load(res.html);
                                              if($('button.next').length){
                                                  $ = null;
                                                  await Chrome.Page.click('button.next');
                                                  await Chrome.Page.waitForNavigation();
                                                  await Chrome.Page.waitForSelector('a.search-result__result-link');
                                                  $ = that.cheerio.load(await Chrome.Page.content());
                                                  return pagination(++x)
                                              }else{
                                                  Chrome.GoTo(that.companyUrl, {}, '', (err,res) => {
                                                      $ = null;
                                                      return loop(++i)
                                                  })
                                              }
                                          })
                                      })
                                  }else{
                                      Chrome.GoTo(that.companyUrl, {}, '', (err,res) => {
                                          if(!err){
                                              $ = null;
                                              return loop(++i)
                                          }
                                      })
                                  }
                               }
                           }(1))
                       })(0)
                   })
                }catch(e) {
                    console.error(e);
                    return false;
                }
            })
        })
    }
    UrlRotator(Chrome,links, callback) {
        const that = this;
            (function loop(i) {
                if (links[i] === undefined)
                    return callback();
                Chrome.GoTo(links[i],{},'',(err,res) => {
                    if (!err) {
                        try{
                            let $ = that.cheerio.load(res.html);
                            that.ParseHTML($,links[i],Chrome.Page,() => {
                                return loop(++i)
                            })
                        }catch (e) {
                            console.error(e);
                            return loop(++i);
                        }
                    }else{
                        return loop(++i);
                    }
                })
            })(0);
    }
    async ParseHTML($,profile_url,page,callback){
        await AutoScroll(page);
        await page.waitFor(2000);
        let name,work,experience = [],location,university,connections,languages='';
        //MAIN INFORMATION
        name = $('h1.pv-top-card-section__name').text();
        if(name)
            name = name.trim();
        work = $('span.pv-top-card-v2-section__entity-name.pv-top-card-v2-section__company-name').text();
        if(work)
            work = work.trim();
        location = $('h3.pv-top-card-section__location').text();
        if(location)
            location = location.trim();
        university = $('span.pv-top-card-v2-section__school-name').text();
        if(university)
            university = university.trim();
        connections = $('span.pv-top-card-v2-section__connections').text();
        if(connections)
            connections = connections.trim().split(' ')[0];

        //Experience
        // let position,firm,obj;
        // let tmp = $('section#experience-section ul.pv-profile-section__section-info.section-info > div');
        // for(let i = 0 ; i < tmp.length ; i++){
        //     position = $(tmp[i]).find('.pv-entity__summary-info h3').text();
        //     if(position)
        //         position = position.trim();
        //     firm = $(tmp[i]).find('h4.t-16').text();
        //     if(firm)
        //         firm = firm.trim();
        //     obj = {
        //         position,
        //         firm
        //     }
        // }

        //Languages
        let tmp1 = $('#languages-expandable-content ul li');
        console.log('ovo je ti liste ' + typeof tmp1)
        console.log(tmp1)
        for(let i = 0 ; i < tmp1.length ; i++){
            let lan = $(tmp1[i]).text().trim();
            languages += `,${lan}`;
        }
        if(languages)
            languages = languages.substr(1);
        return callback()
    }

}
module.exports = Linked;