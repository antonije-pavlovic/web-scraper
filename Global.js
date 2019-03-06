global.cheerio = require('cheerio');
global.Chrome = require('./Server/Request/Chrome');

global.splitUp = (arr, n) => {
    let arr_length = arr.length;
    let result = [];
    for(let i = 0; i < n; i++){
        let a = arr.slice(i*Math.ceil(arr_length/n), i*Math.ceil(arr_length/n) + Math.ceil(arr_length/n));
        result.push(a)
    }
    return result;
};