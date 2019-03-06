const DB = require('./Server/Database/DB');
const Linked = require('./Scraper/Linked');
require('./Global');
let db = new DB();
let linked = new Linked(db);
global.TYPE='product';

db.connect(async () => {
    let companies = await  db.getCompanies();
    linked.StartPage(companies,(a,msg) => {
       console.log(msg);
    })
});
