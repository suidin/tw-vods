import {settings} from '../settings.js';
import {utils} from '../utils/utils.js';


class AbstractApi{
    constructor(){
        this.format = "json";
        this.includeApiHeader = true;
        this.includeClientID = true;
    }

    call(url, includeClientID=true, includeApiHeader=this.includeApiHeader, format=this.format, postBody){
        let headers = {};
        if(includeClientID){
            headers["Client-ID"] = settings.clientId;
        }
        if(includeApiHeader){
            headers["Accept"] = this.params["accept"];
        }
        let params = {
            "headers": headers,
            "mode": this.params.mode,
            "method": this.params["method"],
        }
        if(params.method === "POST" && postBody){
            params.body = postBody;
        }
        let p = utils.fetch(url, this.format, params);
        return p;
    }
}


export {AbstractApi};
