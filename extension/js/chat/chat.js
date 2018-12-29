import {settings} from '../settings.js';
import {utils, FixedSizeArray} from '../utils/utils.js';
import {v5Api} from '../api/v5.js';


class ReChat{
    constructor(vid){
        this.vid = vid;
        this.next = 0;
        this.maxChunkBuffer = 80;
        this.chunkBuffer = new Map();
        this.chunkTimes = new Map();
        this.messages = new FixedSizeArray(350);
        this.clear = false;
        this.failed = 0;
    }

    halfChunkBuffer(){
        let half = Math.floor(this.chunkBuffer.size / 2);
        if(half === 0){return;}
        let i = 0;
        let keys = [...this.chunkTimes.keys()].sort((range1, range2)=>{
            return range1[0] - range2[0];
        });
        let key, value;
        for(key of keys){
            if(i>=half){return}
            this.chunkBuffer.delete(this.chunkTimes.get(key));
            this.chunkTimes.delete(key);
            i++;
        }
    }

    processChunk(chunk, ident){
        let comments = chunk["comments"];
        if (!(comments && comments[0])){
            return;
        }
        let index = 0;
        let comment, message;
        for (comment of comments){
            if(comment.source !== "chat"){
                continue;
            }
            message = {
                "fragments": comment["message"]["fragments"],
                "from": comment["commenter"]["display_name"],
                "time": comment["content_offset_seconds"],
                "color": comment["message"]["user_color"],
                "badges": comment["message"]["user_badges"]
            };
            comments[index] = message;
            index++;
        }
        if(!index) return;
        comments = comments.slice(0, index);
        this.messages.push(...comments);


        // buffer stuff:
        this.chunkBuffer.set(ident, {"messages": comments, "next": chunk._next});
        let timeRange = [comments[0].time, comments[comments.length-1].time];
        this.chunkTimes.set(timeRange, ident);
        if(this.chunkBuffer.size>this.maxChunkBuffer){
            utils.log("clearing half of buffer...");
            this.halfChunkBuffer();
        }
    }

    chunkFromBuffer(ident, offset){
        if(offset){
            let range, thisIdent;
            for(range of this.chunkTimes.keys()){
                if(range[0]<ident && ident<range[1]){
                    thisIdent = this.chunkTimes.get(range);
                    return this.chunkBuffer.get(thisIdent);
                }
            }
        }
        else{
            return this.chunkBuffer.get(ident);
        }
    }

    get(ident){
        if(!this.messages.canPush()){
            return;
        }
        let offset = this.identIsOffset(ident);
        if (offset && offset < 0) return;
        this.gettingident = ident;

        let chunk = this.chunkFromBuffer(ident, offset);
        if(chunk){
            utils.log("got chunk from buffer");
            this.messages.push(...chunk.messages);
            this.next = chunk.next;
            this.gettingident = undefined;
        }
        else{
            return v5Api.comments(this.vid, ident).then((json) =>{
                if(json && json.comments && json.comments[0]){
                    this.processChunk(json, ident);
                    if(json._next !== ident){
                        this.next = json._next;
                        this.gettingident = undefined;
                    }
                }
                else{
                    this.failed++;
                    setTimeout(()=>{
                        this.gettingident = undefined;
                    }, this.failed*1000);
                }
            });
        }
    }

    getNext(){
        if (this.next !== undefined && this.gettingident === undefined){
            if(this.clear){
                this.clear = false;
                this.messages.reset();
                this.next = this.seekTime;
            }
            this.get(this.next);
        }
    }

    identIsOffset(ident){
        return Number.isInteger(ident);
    }
    identIsCursor(ident){
        return !this.identIsOffset(ident);
    }

    seek(secs){
        this.clear = true;
        this.seekTime = Math.floor(secs);
    }

    start(offset=0){
        this.get(Math.floor(offset));
    }
}


class LiveParser{
    constructor(){
        const msgFormat = "@badges=subscriber/0,premium/1;color=;display-name=mcnuta;emotes=;flags=;id=343ff700-03ae-4651-9b47-114a1403a333;mod=0;room-id=36769016;subscriber=1;tmi-sent-ts=1537499122964;turbo=0;user-id=258270338;user-type= :mcnuta!mcnuta@mcnuta.tmi.twitch.tv PRIVMSG #timthetatman :Pog";
        this.order = ["badges", "color", "display-name", "emotes", "flags", "id", "mod", "room-id", "subscriber", "tmi-sent-ts", "turbo", "user-id", "user-type"];
        const sepStr = "=(.*?);.*?";
        this.regex = new RegExp("@" + this.order.join(sepStr) + "=(.*?) :.*?:(.*)");
    }

    parse(string){
        let match = string.match(this.regex);
        if(!match || !match.length){return false;}
        let i, key, val;
        let data = {};
        for(i=1;i<match.length;i++){
            key = this.order[i-1] || "text";
            val = match[i];
            data[key] = val;
        }

        data = this.convert(data);
        return data;
    }

    convert(data){
        let converted = {};
        // converted["text"] = data.["text"];
        converted["from"] = data["display-name"];

        let badges = [];
        let badgesString = data["badges"];
        let arr = badgesString.split(",");
        for(let item of arr){
            if(!item.length){continue;}
            let [name, val] = item.split("/");
            // TODO: do something with val here:
            val = parseInt(val);
            badges.push(name);
        }
        converted["badges"] = badges;

        converted["color"] = data["color"];

        //"185316:0-6,16-22,32-38,48-54,64-70/1360600:8-14,24-30,40-46,56-62,72-78"
        let emotesString = data["emotes"];
        let emotes = [];
        arr = emotesString.split("/");
        let emote, id, position, positions;
        for(emote of arr){
            if(!emote.length){continue;}
            [id, positions] = emote.split(":");
            positions = positions.split(",");
            for(position of positions){
                let [begin, end] = position.split("-").map(i => parseInt(i));
                emotes.push({"id": id, "begin": begin, "end": end});
            }
        }
        emotes.sort((a,b)=>{
            return a.begin - b.begin;
        });

        converted.fragments = this.buildFragments(data["text"], emotes);
        return converted;
    }

    buildFragments(msg, emotes){
        let fragments = [];
        let previousPosition = 0;
        let emote, between, emoteName, id, position;
        for(emote of emotes){
            id = emote.id;
            between = msg.substring(previousPosition, emote.begin);
            emoteName = msg.substring(emote.begin, emote.end+1);
            if(between.length){
                fragments.push({"text": between});
            }
            fragments.push({"text": emoteName, "emoticon": {"emoticon_id": id}});
            previousPosition = emote.end+1;
        }
        if(previousPosition<msg.length){
            fragments.push({"text": msg.substring(previousPosition, msg.length)});
        }
        return fragments;
    }
}


class LiveChat{
    constructor(channel){
        this.channel = channel;
        this.parser = new LiveParser();
    }

    start(onMsg){
        this.onMsg = onMsg;
        this.connect();
    }

    connect(){
        const wsAddress = "wss://irc-ws.chat.twitch.tv/";
        let c = new WebSocket(wsAddress);
        c.onmessage = e=>{
            // console.log(e.data);
            if(e.data.startsWith("PING :tmi.twitch.tv")){
                c.send("PONG");
            }
            else{
                this.process(e.data);
            }
        }
        c.onopen = ()=>{
            // anon credens:
            let nick = "justinfan" + Math.floor(8e4*Math.random()+1e3);
            c.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
            c.send("PASS SCHMOOPIIE");
            c.send(`NICK ${nick}`);
            c.send(`USER ${nick} 8 * :${nick}`);

            c.send("JOIN #"+this.channel);
        };
    }

    process(msg){
        let data = this.parser.parse(msg);
        if(data){
            this.onMsg(data);
        }
    }
}

export {ReChat, LiveChat};
