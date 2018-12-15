import {settings} from '../settings.js';


class AbstractApi{
    constructor(key, version){
        this.key = key;
        this.version = version;
        this.callParams = new Map(Object.entries({
            "json": true,
            "method": "GET",
            "body": "",
            "mode": "cors",
        }));
    }

    getParams(_params=new Map()){
        let params = new Map();
        let key, val;
        for([key, val] of this.callParams){
            if(_params.hasOwnProperty(key)){
                params[key] = _params[key];
            }
            else{
                params[key] = val;
            }
        }   
    }

    call(url, params){

    }

    getHeaders(){
        return {
            "Client-ID": this.key,
        };
    }

    fetch(url, params){
        headers = this.getHeaders();

        let params = {
            "method": method,
            "mode": mode,
            "headers": headers
        }
        if(method === "POST" && body.length){
            params["body"] = body;
        }
        if(includeClientId){
            if(settings.clientId.length){
                params["headers"]['Client-ID'] = settings.clientId;
            }

            else{
                alert("No client key set");
                return;
            }
        }

        return this.fetch(url, params, then);
    }


}

class NonApi{

}


export {AbstractApi};
