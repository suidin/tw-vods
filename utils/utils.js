import {settings} from '../settings.js';
import {storage} from './storage.js';
import {colors} from './colors.js';


const htmlEntities = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#x60;'
};


class Dialog{
    constructor(){
    }

    do(type, text){
        if(!this.elems){
            this.setup(type);
        }
        this.elems.elem.id = type;
        this.elems.text.textContent = text;
        this.elems.elem.showModal();
        return new Promise(resolve=>{
            this.handlers(resolve);
        });
    }

    prompt(text){
        return this.do("prompt", text);
    }
    alert(text){
        return this.do("alert", text);
    }
    dialog(text){
        return this.do("dialog", text);
    }

    setup(type){
        let elem = document.createElement("dialog");
        elem.innerHTML = `<form method="dialog">
            <div>
                <div class="dialog-text">:</div>
                <input type="text">
            </div>
            <menu>
                <button class="dialog-cancel" type="reset">Cancel</button>
                <button class="dialog-submit" type="submit">Ok</button>
            </menu>
        </form>`;
        document.body.appendChild(elem);
        let elems = {"elem": elem};
        elems.text = elem.querySelector(".dialog-text");
        elems.input = elem.querySelector("input");
        elems.cancel = elem.querySelector(".dialog-cancel");
        elems.form = elem.querySelector("form");
        this.elems = elems;
    }

    handlers(resolve){
        let cancel = e=>{
            this.elems.elem.close();
            this.elems.cancel.removeEventListener("click", cancel);
            resolve(null);
        };

        let submit = e=>{
            let val = this.elems.input.value;
            if(!val.length){val = true;}
            this.elems.form.removeEventListener("submit", submit);
            resolve(val);
        }

        this.elems.cancel.addEventListener("click", cancel);
        this.elems.form.addEventListener("submit", submit);
    }

}

class Uitility{
    constructor(){
        this.storage = storage;
        this.colors = colors;
        this.dialog = new Dialog();
        this.getClientId();
    }

    log(obj){
        if(settings.DEBUG){
            console.log(obj);
        }
    }

    promptClientId(){
        const promptText = "Please enter a valid twitch.tv Client ID or OAuth";
        const entered = this.dialog.prompt(promptText);
        entered.then(val=>{
            if (val !== null) {
                if(val.startsWith("oauth:")){
                    let token = val.substring(6);
                    this.clientIdFromOauth(token);
                }
                else{
                    this.setClientId(val);
                }
            }
        });
    }

    clientIdFromOauth(token){
        const url = "https://id.twitch.tv/oauth2/validate";
        const params = {
            headers: {"Authorization": `OAuth ${token}`},
        }
        this.fetch(url, params, "json").then(json=>{
            if(json && json.client_id){
                this.setClientId(json.client_id);
            }
        });
    }

    setClientId(clientId){
        this.storage.setItem("clientId", clientId);
        settings.clientId = clientId;
    }

    getClientId(){
        const storageClientId = this.storage.getItem("clientId");
        const clientId = storageClientId || settings.clientId;
        if(clientId && clientId.length){
            settings.clientId = clientId;
        }
        else{
            this.promptClientId();
        }
    }

    getRequestPromise(url, {then="jsonMap", method="GET", body="", mode="cors", includeClientId=true, headers={'Accept': 'application/vnd.twitchtv.v5+json'}} = {}){
        if(!then.startsWith("json")){
            headers["Accept"] = '*/*';
        }
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

    fetch(url, params, then){
        let promise = fetch(url, params);
        if(then.startsWith("json")){
            promise = promise.then(response => {
                if(response.ok){
                    return response.json()
                }
            });
            if(then === "jsonMap"){
                utils.log("creating jsonmap...");
                promise = promise.then(json => this.objToMap(json));
            }
        }
        promise = promise.catch(error => console.error(`Fetch Error =\n`, error));
        return promise;
    }

    objToMap(obj){
        if(!obj){return;}
        return new Map(Object.entries(obj));
    }

    escape(string) {
        return String(string).replace(/[<>"'`]/g, s => htmlEntities[s]);
    }

    calcCssUnit(value, unit, calcFn){
        let num = value.substring(0, value.length-unit.length);
        num = calcFn(num);
        return num + unit;
    }

    capitalize(str){
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    padDigits(number, digits) {
        return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
    }

    secsToReadable(seconds, highest="h"){
        let units = ["d", "h", "m", "s"];
        if(seconds >= 60){units.pop();}
        let values = new Map([
            ["d", 3600*24],
            ["h", 3600],
            ["m", 60],
            ["s", 1],
        ]);

        let str = "";
        for(let index in units){
            if(!units.hasOwnProperty(index)){continue;}
            index = parseInt(index);
            let unit = units[index];
            if(units.indexOf(highest)<=index){
                let multiplier = values.get(unit);
                let value = Math.floor(seconds / multiplier);
                seconds -= multiplier*value;
                values.set(unit, value);
                if(value>0 || str){
                        str += value + unit + " ";
                }
            }
        }
        return str;
    }

    secsToHMS(secs){
        let values = [];

        let value = Math.floor(secs / 3600);
        secs -= 3600*value;
        values.push(value);

        value = Math.floor(secs / 60);
        secs -= 60*value;
        values.push(value);
        values.push(Math.floor(secs));

        return values.map(v => v.toString().padStart(2, "0")).join(":");
    }

    twTimeStrToSecs(str){
        let then = new Date(Date.parse(str));
        let now = new Date();
        return parseInt((now - then) / 1000);
    }

    twTimeStrToPassed(str, highest="h"){
        let secs = this.twTimeStrToSecs(str);
        return this.secsToReadable(secs, highest);
    }

    findGetParameter(parameterName) {
        let result = null,
        tmp = [];
        location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
        return result;
    }
}
const utils = new Uitility();
export {utils};
