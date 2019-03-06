'use strict';
const mysql = require('mysql');
const params = require('../config/config');
class DB {

    constructor(){
        this.create_connection=mysql.createConnection(params);
        this.conn=false;
    }

    connect(callback){
        this.create_connection.connect( err => {
            if (err)
                throw err;
            this.conn = this.create_connection;
            callback(true);
            this.conn.on('error', err => {
                console.log(err);
                console.log('connection closed------custom');
                this.conn.end();
            });
        });
    }
    getCompanies(){
        return new Promise((resolve,reject) => {
            let q = 'SELECT * from company_to_scrape';
            this.conn.query(q,[],(err,rows) => {
                if(!err)
                    resolve(rows);
            })
        })
    }
}
module.exports = DB;

