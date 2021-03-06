import {settings} from '../settings.js';
import {storage} from './storage.js';
import {Dialog} from './dialog.js';
import {colors} from './colors.js';
import {v5Api} from '../api/v5.js';


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
        return (this.length + this.startIndex + i) % this.length;
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
        this.startIndex = this.i(1);
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
            this.startIndex = this.i(-1);
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


class Utility{
    constructor(){
        this.storage = storage;
        this.colors = colors;
        this.dialog = new Dialog();
        this.ready = this.checkReady();
    }



    checkReady(){
        let msg = {"event": "readyCheck"};
        let p = new Promise(resolve=>{
            let fn = ()=>{
                chrome.runtime.sendMessage(msg, response => {
                    if (response){
                        resolve();
                    }
                    else{
                        setTimeout(fn, 200);
                    }
                });
            };
            fn();

        });
        return p.then(()=>{
            return this.getClientId();
        });
    }

    import(){
        this.dialog.promptFile("Please select exported file").then(reader=>{
            if(reader){
                reader.onload = ()=>{
                    let importString = reader.result;
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
                };
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
                returnMsg = "could not import follows";
            }
            setTimeout(e=>{
                this.dialog.alert(returnMsg);
            }, 100);
            return names;
        });
        return p;
    }

    export(){
        this.storage.export().then(s=>{
            let a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([s], {type: 'text'}));
            a.download = 'export.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }


    log(...objs){
        if(settings.DEBUG){
            console.log(...objs);
        }
    }

    getUserFollows(username, limit=25){
        return this.getUid(username).then(uid=>{
            return v5Api.follows(uid, limit);
        }).then(json=>{
            if(json && json.follows && json.follows.length){
                return json.follows.map(i=>i.channel.display_name);
            }
            else{
                return false;
            }
        });
    }

    getUid(name){
        return this.storage.getUserId(name).then(id=>{
            if (id){
                console.log("got uid from storage:", name, id);
                return id;
            }
            else{
                return v5Api.userID(name).then(json=>{
                    if(json && json.users && json.users.length){
                        id = json.users[0]["_id"];
                        this.storage.setUserId(name, id);
                        return id;
                    }
                    else{
                        return false;
                    }
                });
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
        this.fetch(url, "json", params).then(json=>{
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
        return this.storage.getItem("clientId").then(storageClientId=>{
            const clientId =  settings.clientId || storageClientId;
            if(clientId && clientId.length){
                settings.clientId = clientId;
            }
            else{
                this.promptClientId();
            }
        });
    }

    fetch(url, format="json", params){
        if(params === undefined){params = {};}
        let promise = fetch(url, params);
        if(format === "json"){
            promise = promise.then(r=>{
                if(r.ok){
                    return r.json();
                }
                else{
                    return null;
                }
            });
        }
        else{
            promise = promise.then(r=>{
                if(r.ok){
                    return r.text();
                }
                else{
                    return null;
                }
            }); 
        }
        promise = promise.catch(error => {
            console.error(`Fetch Error on url: ${url}\n ${error}`);
        });
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

    HMSToSecs(s){
        const timeIds = ["h", "m", "s"];
        const multipliers = [3600, 60, 1];
        let i;
        let secs = 0;
        let split;
        for(i=0;i<timeIds.length;i++){
            split = s.split(timeIds[i]);
            if (split.length == 2){
                secs += parseInt(split[0]) * multipliers[i];
                s = split[1];
            }
        }
        return secs;
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
            val = encodeURIComponent(obj[key]);
            arr.push(`${key}=${val}`);
        }
        return "?" + arr.join("&");
    }

    isElementInViewport(el) {
        let rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight) &&
            rect.right <= (window.innerWidth)
        );
    }

    getDocHeight() {
        let D = document;
        return Math.max(
            D.body.scrollHeight, D.documentElement.scrollHeight,
            D.body.offsetHeight, D.documentElement.offsetHeight,
            D.body.clientHeight, D.documentElement.clientHeight
        );
    }

    percentageScrolled(){
        return Math.floor(window.pageYOffset/(this.getDocHeight() - window.innerHeight) * 100);
    }

    assurePromise(p){
        // if its already a promise; return as is
        if(p["then"]){
            return p;
        }
        // return a promise that immediately resolves with p
        return new Promise(resolve=>{
            resolve(p);
        });
    }

}
const utils = new Utility();
export {utils, FixedSizeArray};
