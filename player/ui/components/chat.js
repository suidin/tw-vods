import {ChatOptions} from './chatoptions.js';
import {settings} from '../../../settings.js';
import {utils} from '../../../utils/utils.js';
import {Emotes} from './emotes/emotes.js';
import {Component} from './components.js';
import {elements} from '../elements.js';
import {Draggable, Resizable} from '../moveresize.js';



class ChatData{
    constructor(vid){
        this.vid = vid;
        this.next = 0;
        this.maxMessages = 200;
        this.maxChunkBuffer = 100;
        this.chunkBuffer = new Map();
        this.chunkTimes = new Map();
        this.messages = [];
        this.clear = false;
        this.failed = 0;
    }

    halfChunkBuffer(){
        let half = parseInt(this.chunkBuffer.size / 2);
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
        let comment, message;
        let messages = [];
        for (comment of comments){
            message = {
                "text": comment["message"]["body"],
                "from": comment["commenter"]["display_name"],
                "time": comment["content_offset_seconds"],
                "color": comment["message"]["user_color"],
                "badges": comment["message"]["user_badges"]
            };
            messages.push(message);
        }
        this.messages.push(...messages);


        // buffer stuff:
        this.chunkBuffer.set(ident, {"messages": messages, "next": chunk._next});
        let timeRange = [messages[0].time, messages[messages.length-1].time];
        this.chunkTimes.set(timeRange, ident);
        console.log("chunkbuffersize: ", this.chunkBuffer.size);
        if(this.chunkBuffer.size>this.maxChunkBuffer){
            console.log("clearing half of buffer...");
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
        if(this.messages.length>this.maxMessages){
            return;
        }
        let offset = this.identIsOffset(ident);
        if (offset && offset < 0) return;
        let url = this.getUrl(ident, offset);
        this.gettingident = ident;

        let chunk = this.chunkFromBuffer(ident, offset);
        if(chunk){
            console.log("got chunk from buffer");
            this.messages.push(...chunk.messages);
            this.next = chunk.next;
            this.gettingident = undefined;
        }
        else{
            return utils.getRequestPromise(url, {then:"json"}).then((json) =>{
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
        if (this.next !== undefined && this.gettingIdentifier === undefined){
            if(this.clear){
                this.clear = false;
                this.messages = [];
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

    getUrl(ident, offset=false){
        let url;
        if (offset){
            url = this.getRechatOffsetUrl(ident);
        }
        else{
            url = this.getRechatCursorUrl(ident);
        }
        return url;
    }
    seek(secs){
        this.clear = true;
        this.seekTime = parseInt(secs);
    }

    getRechatOffsetUrl(offset){
        return `https://api.twitch.tv/v5/videos/${this.vid}/comments?content_offset_seconds=${offset}`;
    }
    getRechatCursorUrl(cursor){
        return `https://api.twitch.tv/v5/videos/${this.vid}/comments?cursor=${cursor}`;
    }

}

class Chat{
    constructor(){
        this.delay = 0;
    }

    bindToVideo(video, offset=0){
        this.video = video;
        this.emotes = new Emotes(video.channel, video.channelId);
        this.emotes.loadEmoteData(video.channel);
        this.data = new ChatData(video.vid);
        this.data.get(parseInt(offset));
    }
    seek(secs){
        this.data.seek(secs);
    }
}


class ChatInterface extends Component{
    constructor(ui, elem){
        super(ui, elem);
        this.chat = new Chat();
        this.chatOptions = new ChatOptions();
        this.autoScroll = true;
        this.chatScrollElem = this.elem.querySelector(".chat-container");
        this.chatLines = this.elem.querySelector(".chat-lines");
        this.restoreChat();
        this.initMoveDrag();
        this.badges = {
            "moderator": "/resources/badges/mod.png",
            "staff": "/resources/badges/staff.png",
        }
    }

    handlers(){
        this.chatScrollElem.addEventListener("mouseenter", (e) => {
            this.autoScroll = false;
        });
        this.chatScrollElem.addEventListener("mouseleave", (e) => {
            this.autoScroll = true;
        });
        window.onresize = (event) => {
            this.scrollToBottom();
        }
    }

    getSyncTime(){
        return this.chatOptions.options["syncTime"].val;
    }

    restoreChat(){
        let pos = utils.storage.getLastChatPos();
        let dim = utils.storage.getLastChatDim();

        if(pos){
            this.elem.style.left = pos.left;
            this.elem.style.top = pos.top;
        }
        if(dim){
            this.elem.style.width = dim.width;
            this.elem.style.height = dim.height;
        }
    }

    getSubBadge(){
        let id = this.ui.player.video.channelId;
        if(!id){return;}
        let url = `https://api.twitch.tv/kraken/chat/${id}/badges`;
        utils.getRequestPromise(url, {then:"json"}).then(json=>{
            if(json){
                this.badges["subscriber"] = json["subscriber"]["image"];
            }
        });
    }

    seek(secs){
        let nextMsg = this.chat.data.messages[0];
        let nextMsgTime = nextMsg && nextMsg.time;
        let syncTime = this.getSyncTime();
        if(!nextMsgTime || Math.abs((secs+syncTime) - nextMsgTime)>10){
            this.chat.seek(secs+syncTime);
            this.clearMessages();
        }
    }

    iterate(secs){
        this.addNewMsgs(secs+this.getSyncTime());
        let buffEndTime = this.chat
        this.chat.data.getNext();
    }

    msgElem(msg){
        let elem  = document.createElement("div");
        elem.classList.add("message");
        let color = msg.color && msg.color.toLowerCase();

        color = utils.colors.convertColor(color);
        let text = this.chat.emotes.replaceWithEmotes(msg.text);
        let badges = "";
        if(msg.badges){
            badges = this.getBadgeElems(msg.badges); 
        }
        elem.innerHTML = `${badges}<span style="color:${color};" class="from">${msg.from}: </span><span class="text">${text}</span>`;
        return elem;
    }
    getBadgeElem(name, path){
        let className = `badge-img ${name}-badge`;
        return `<img src="${path}" class="${className}">`;
    }
    getBadgeElems(badges){
        let elems = [], name, def;
        for(def of badges){
            name = def._id;
            if(name in this.badges){
                elems.push(this.getBadgeElem(name, this.badges[name]));
            }
        }
        if(elems[0]){
            return `<span class="user-badges">${elems.join("")}</span>`;
        }
        return "";
    }

    removeOldLines(){
        let elems = this.chatLines.children;
        if (elems.length > 300){
            let i = 0;
            while (i < 100){
                elems[0].remove();
                i++;
            }
        }
        if(this.autoScroll){
            this.scrollToBottom();
        }
    }

    addNewMsgs(time){
        let msg = this.chat.data.messages[0];
        while (msg !== undefined){
            if (msg.time <= time){
                this.addMsg(msg);
                this.chat.data.messages.shift();
            }
            else{
                break;
            }
            msg = this.chat.data.messages[0];
        }

        this.removeOldLines()
    }

    scrollToBottom(){
        this.chatScrollElem.scrollTo(0,this.chatScrollElem.scrollHeight);
    }

    addMsg(msg){
        let elem = this.msgElem(msg);
        this.chatLines.appendChild(elem);
    }

    clearMessages(){
        this.chatLines.innerHTML = "";
    }

    initMoveDrag(){
        let draggableConfig = {
            outer: document.querySelector(".app"),
            handle: document.querySelector(".drag-handle"),
            onEnd: ()=>{
                utils.storage.setLastChatPos(this.elem.style.left, this.elem.style.top);
            }
        }
        this.draggable = new Draggable(this.elem, draggableConfig);
        this.draggable.init();

        let resizableConfig = {
            outer: elements.app,
            handle: document.querySelector(".resize-handle"),
            onEnd: ()=>{
                utils.storage.setLastChatDim(this.elem.style.width, this.elem.style.height);
            }
        }
        this.resizable = new Resizable(this.elem, resizableConfig);
        this.resizable.init();
    }
    toggleChat(){
        let current = this.elem.style.display;
        if(current === "none") this.elem.style.display = "block";
        else this.elem.style.display = "none";
    }

}



export {ChatInterface};
