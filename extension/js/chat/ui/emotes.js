import {settings} from '../../settings.js';
import {utils} from '../../utils/utils.js';


const bttvGlobalJson = "https://api.betterttv.net/2/emotes";
const bttvChannelJson = "https://api.betterttv.net/2/channels/";


class Emotes{
    constructor(){
        this.urls = {
            twitch: "https://static-cdn.jtvnw.net/emoticons/v1/",
            bttv: "https://cdn.betterttv.net/emote/",
            ffz: "https://api.frankerfacez.com/v1/room/"
        };
        this.emotes = {
            "ffz": new Map(),
            "bttv": new Map()
        };
        this.scale = 1;
    }

    getScaleStr(type){
        if(type === "bttv"){
            return this.scale + "x";
        }
        else if(type === "twitch"){
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

    getSrcUrl(id, type="twitch"){
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

    replaceWithEmotes(fragments){
        let parts = [];
        let fragment, text, emoticon, url;
        for(fragment of fragments){
            text = fragment.text;
            emoticon = fragment.emoticon;
            if(emoticon){
                url = this.getSrcUrl(emoticon.emoticon_id);
                parts.push(this.getEmoteStr(url, fragment.text));
            }
            else{
                parts.push(this.replaceNonNativeEmotes(utils.escape(text)));
            }
        }
        return parts.join(" ");
    }

    replaceNonNativeEmotes(msg){
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

    convertBttvEmotes(json){
        if(!json){return;}
        let key, emote;
        let emotes = json.emotes;
        for(key in emotes){
            emote = emotes[key];
            this.emotes["bttv"].set(emote["code"], emote["id"]);
        }
    }

    loadEmoteData(channel){
        let loaded = 0;
        return new Promise(resolve=>{
            utils.fetch(this.urls.ffz + channel).then(json=>{
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
 
            utils.fetch(bttvGlobalJson).then(json=>{
                this.convertBttvEmotes(json);
                loaded++;
            });
            utils.fetch(bttvChannelJson + channel).then(json=>{
                this.convertBttvEmotes(json);
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
