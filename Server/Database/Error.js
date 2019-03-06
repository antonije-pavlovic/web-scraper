
class CustomErr{

    constructor(db){
       this.db=db;
    }

    request(code,msg,err,url,domain_id){
        this.db.request_error(code,msg,err,url,domain_id);
    }

    html(domain_id,type,element='',url,msg='',err){
        this.db.html_errors(domain_id,type,element,url,msg,err);
    }

    fatall_error(domain_id,error_name,stack,msg,fatall=0,element=null,type='default'){
        this.db.fatall_error(domain_id,error_name,stack,msg,fatall,element,type);
    }

    ProductInfo(pzn,domain_id,code,stack,msg){
        this.db.ProductInfo(pzn,domain_id,code,stack,msg)
    }


    Save(domain_id,pzn,stack,msg,url,keyword_id){
        this.db.ErrorScraper(global.TYPE,domain_id,pzn,stack,msg,url,keyword_id)
    }

    close(){
        this.db.conn.end();
    }

}


module.exports = CustomErr;
