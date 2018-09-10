import {settings} from '../settings.js';
import {storage} from './storage.js';
import {Dialog} from './dialog.js';
import {colors} from './colors.js';


const htmlEntities = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#x60;'
};

const week = 60*60*24*7;

const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];




class FixedSizeArray{
    constructor(length){
        this.arr = new Array(length);
        this.max = length;
        this.canPushPoint = Math.floor(this.max / 2) - 1;
        this.reset();
    }

    get(i){
        if(i >= this.length){
            return undefined;
        }
        else{
            return this.arr[this.i(i)];
        }
    }

    i(i){
        return (this.startIndex + i) % this.length;
    }

    reset(){
        this.length = 0;
        this.startIndex = 0;
        this.entries = 0;
    }

    canPush(){
        return this.entries < this.canPushPoint;
    }

    advanceStart(){
        this.startIndex = (this.startIndex + 1) % this.length;
        this.entries--;
    }


    endIndex(){
        return this.i(this.entries);
    }

    shift(){
        if(this.entries){
            this.advanceStart();
            let elem = this.get(0);
            return elem;
        }
    }

    revertShift(){
        if(this.length - this.entries){
            this.startIndex = (this.startIndex - 1) % this.length;
            this.entries++;
            return true;
        }
        else{
            return false;
        }
    }

    push(...items){
        for(let item of items){
            if(this.length<this.max){
                this.arr[this.length++] = item;
            }
            else{
                this.arr[this.endIndex()] = item;
                // this.advanceStart();
            }
            this.entries++;
        }
    }
}

class Uitility{
    constructor(){
        this.storage = storage;
        this.colors = colors;
        this.dialog = new Dialog();
        this.getClientId();
    }

    import(){
        this.dialog.prompt("Please enter settings string").then(importString=>{
            if(importString){
                let success = this.storage.import(importString);
                let returnMsg;
                if(success){
                    returnMsg = "successfully imported settings";
                }
                else{
                    returnMsg = "could not import settings";
                }
                setTimeout(e=>{
                    this.dialog.alert(returnMsg);
                }, 100);
            }
        });
    }

    importFollows(){
        let p = this.dialog.prompt("Please enter your username");
        p = p.then(username=>{
            if(username && username.length){
                return this.getUserFollows(username);
            }
            else{
                return false;
            }
        });
        p = p.then(names=>{
            let returnMsg;
            if(names){
                returnMsg = "successfully imported follows";
            }
            else{
                returnMsg = "could not import settings";
            }
            setTimeout(e=>{
                this.dialog.alert(returnMsg);
            }, 100);
            return names;
        });
        return p;
    }

    export(){
        let s = this.storage.export();
        this.dialog.alert(s);
    }


    log(...objs){
        if(settings.DEBUG){
            console.log(...objs);
        }
    }

    getUserFollows(username, limit=25){
        return this.getRequestPromise(`https://api.twitch.tv/kraken/users/${username}/follows/channels?limit=${limit}`, {then: "json", headers:{}}).then(json=>{
            if(json && json.follows && json.follows.length){
                return json.follows.map(i=>i.channel.display_name);
            }
            else{
                return false;
            }
        });
    }

    userIdFromUsername(name){
        return this.getRequestPromise("https://api.twitch.tv/kraken/users?login="+name, {then: "json"}).then(json=>{
            if(json && json.users && json.users.length){
                return json.users[0]["_id"];
            }
            else{
                return false;
            }
        });
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

    uncapitalize(str){
        return str.charAt(0).toLowerCase() + str.slice(1);
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
            let unit = units[index];
            if(units.indexOf(highest)<=index){
                let multiplier = values.get(unit);
                let value = Math.floor(seconds / multiplier);
                seconds -= multiplier*value;
                values.set(unit, value);
                if(value>0){
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

    twTimeStrToDate(str){
        let date = new Date(Date.parse(str));
        return date;
    }

    getSecsFromDate(then){
        let now = new Date();
        return Math.floor((now - then) / 1000);
    }

    twTimeStrToReadable(str){
        let date = this.twTimeStrToDate(str);
        let secs = this.getSecsFromDate(date);
        if(secs > week){
            return `${monthShortNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        }
        return this.secsToReadable(secs, "d") + " ago";
    }

    twTimeStrToTimePassed(str){
        let date = this.twTimeStrToDate(str);
        let secs = this.getSecsFromDate(date);
        return this.secsToReadable(secs, "d");
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

    getStrToObj(){
        let obj = {};
        let key, val;
        let getStr = location.search;
        if(!getStr.length)return false;
        getStr
        .substr(1)
        .split("&")
        .forEach((item) => {
            [key, val] = item.split("=");
            obj[key] = decodeURIComponent(val);
        });
        return obj;
    }


    objToGetStr(obj){
        let arr = [];
        let key, val;      
        for(key in obj){
            val = obj[key];
            arr.push(`${key}=${val}`);
        }
        return "?" + arr.join("&");
    }
}
const utils = new Uitility();
export {utils, FixedSizeArray};
