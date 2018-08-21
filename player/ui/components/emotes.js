import {settings} from '../../../settings.js';
import {utils} from '../../../utils/utils.js';


const twGlobalEmoteApi = "https://twitchemotes.com/api_cache/v3/global.json";
const bttvEmoteApi = "https://api.betterttv.net/2/emotes";


class Emotes{
    constructor(){
        this.urls = {
            twGlobal: "https://static-cdn.jtvnw.net/emoticons/v1/",
            bttv: "https://cdn.betterttv.net/emote/",
            ffz: "https://api.frankerfacez.com/v1/room/",
            sub: "https://static-cdn.jtvnw.net/emoticons/v1/"
        };
        this.emotes = {
            "ffz": new Map()
        };
        this.scale = 1;
    }

    getScaleStr(type){
        if(type === "bttv"){
            return this.scale + "x";
        }
        else if(type === "twGlobal" || type === "sub"){
            return this.scale + ".0";
        }
    }

    getFFZscaleUrl(urls){
        let scales = [4,3,2,1].sort((a,b)=>{
            return Math.abs(a-this.scale) < Math.abs(b-this.scale) ? -1 : 1;
        });
        let i, url;
        for(i of scales){
            url = urls[i];
            if(url){
                url = "https://" + url.substring(2);
                return url;
            }
        }
    }

    getSrcUrl(id, type="twGlobal"){
        let scale = this.getScaleStr(type);
        return this.urls[type] + id + "/" + scale;
    }

    getEmoteUrl(name){
        let type, id, url;
        for(type in this.emotes){
            id = this.emotes[type].get(name);
            if(id === undefined){continue;}
            if(type === "ffz"){
                url = this.getFFZscaleUrl(id);
            }
            else{
                url = this.getSrcUrl(id, type);
            }
            return url;
        }
    }

    getEmoteStr(url, emoteName){
        let src = url;
        let size = this.pxSize + "px";
        return `<img class="chat-emote" title="${emoteName}" src="${src}" />`;
    }

    replaceWithEmotes(msg){
        let parts = msg.split(" ");
        let index, part, url, emote;
        for(index in parts){
            part = parts[index];
            url = this.getEmoteUrl(part);
            if(url){
                emote = this.getEmoteStr(url, part);
                parts[index] = emote;
            }
        }
        let newMsg = parts.join(" ");
        return newMsg;
    }

    loadEmoteData(channel){
        let loaded = 0;
        return new Promise(resolve=>{
            utils.getRequestPromise(this.urls.ffz + channel, {then:"json", headers:{}}).then(json=>{
                if(!json){return;}
                let sets = json.sets;
                let set, emotes, emote;
                for(set in sets){
                    emotes = sets[set]["emoticons"];
                    for(emote of emotes){
                        this.emotes["ffz"].set(emote["name"], emote.urls);
                    }
                }                
                loaded++;
            });
 
            utils.getRequestPromise("/resources/emotes/bttv.json", {then:"jsonMap", headers:{}}).then(jsonMap=>{
                this.emotes["bttv"] = jsonMap;
                loaded++;
            }).then(()=>{
                utils.getRequestPromise("https://api.betterttv.net/2/channels/" + channel, {then:"json", headers:{}}).then(json=>{
                    if(!json){return;}
                    let key, emote;
                    let emotes = json.emotes;
                    for(key in emotes){
                        emote = emotes[key];
                        this.emotes["bttv"].set(emote["code"], emote["id"]);
                    }
                });
            });
            utils.getRequestPromise("/resources/emotes/twGlobal.json", {then:"jsonMap", headers:{}}).then(jsonMap=>{
                this.emotes["twGlobal"] = jsonMap;
                loaded++;
            });
            utils.getRequestPromise("/resources/emotes/partner_sub_emotes.json", {then:"jsonMap", headers:{}}).then(jsonMap=>{
                this.emotes["sub"] = jsonMap;
                utils.log("converted");
                loaded++;
            });
            let i = setInterval(()=>{
                if(loaded===3){
                    clearInterval(i);
                    resolve();
                }
            }, 200)
        });
    }
}

export {Emotes};
