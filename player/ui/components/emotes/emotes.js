import {settings} from '../../../../settings.js';
import {utils} from '../../../../utils/utils.js';


const twGlobalEmoteApi = "https://twitchemotes.com/api_cache/v3/global.json";
const bttvEmoteApi = "https://api.betterttv.net/2/emotes";


class Emotes{
    constructor(channel, channelId){
        this.channel = channel;
        this.channelId = channelId;
        this.urls = {
            twGlobal: "https://static-cdn.jtvnw.net/emoticons/v1/",
            bttv: "https://cdn.betterttv.net/emote/",
            ffz: "https://api.frankerfacez.com/v1/room/",
            sub: "https://static-cdn.jtvnw.net/emoticons/v1/"
        };
        this.emotes = {
            "ffz": {}
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
        if(type==="ffz"){
            let urls = this.emotes.ffz[id];
            let url = this.getFFZscaleUrl(urls);
            return url;
        }
        let scale = this.getScaleStr(type);
        return this.urls[type] + id + "/" + scale;
    }

    getEmoteUrl(name){
        let set;
        for(set in this.emotes){
            if(!this.emotes.hasOwnProperty(set)){continue;}
            let emote = this.emotes[set][name];
            if(emote === undefined){continue;}
            let type = set;
            let id;
            if(type === "bttv" || type === "sub"){
                id = emote;
            }
            else if(type === "twGlobal"){
                id = emote["id"];
            }
            else if(type === "ffz"){
                id = name;
            }
            let url = this.getSrcUrl(id, type);
            return url;
        }
    }

    getEmoteStr(url){
        let src = url;
        let size = this.pxSize + "px";
        return `<img class="chat-emote" src="${src}" />`;
    }

    replaceWithEmotes(msg){
        let parts = msg.split(" ");
        let newParts = [];
        let part, url, emote;
        for(part of parts){
            url = this.getEmoteUrl(part);
            if(url){
                emote = this.getEmoteStr(url);
                newParts.push(emote);
            }
            else{
                newParts.push(part);
            }
        }
        let newMsg = newParts.join(" ");
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
                    if(!sets.hasOwnProperty(set)){continue;}
                    emotes = sets[set]["emoticons"];
                    for(emote of emotes){
                        this.emotes["ffz"][emote["name"]] = emote.urls;
                    }
                }                
                loaded++;
            });
 
            utils.getRequestPromise("/player/ui/components/emotes/bttv.json", {then:"json", headers:{}}).then(json=>{
                this.emotes["bttv"] = json;
                loaded++;
            }).then(()=>{
                utils.getRequestPromise("https://api.betterttv.net/2/channels/" + channel, {then:"json", headers:{}}).then(json=>{
                    let key, emote;
                    let emotes = json.emotes;
                    for(key in emotes){
                        if(!emotes.hasOwnProperty(key)){continue;}
                        emote = emotes[key];
                        this.emotes["bttv"][emote["code"]] = emote["id"];
                    }
                });
            });
            utils.getRequestPromise("/player/ui/components/emotes/global.json", {then:"json", headers:{}}).then(json=>{
                this.emotes["twGlobal"] = json;
                loaded++;
            });
            const body = `{"operationName":"EmotePicker_EmotePicker_UserSubscriptionProducts","variables":{"channelOwnerID":"${this.channelId}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"a399e31909de18507e5a68ff617cf70f2dd464de3b49e54b74b24a46c9a2c703"}}}`
            utils.getRequestPromise("https://gql.twitch.tv/gql", {then: "json", method:"POST", "body":body}).then(j=>{
                if(!j.data){return;}
                let subEmotes = {};
                let emoteSets = j.data.user.subscriptionProducts;
                if(!emoteSets){return;}
                let set, emotes, emote;
                for(set of emoteSets){
                    emotes = set.emotes;
                    for(emote of emotes){
                        subEmotes[emote.token] = emote.id;
                    }
                }
                this.emotes["sub"] = subEmotes;
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
