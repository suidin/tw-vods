import {Video} from '../../video/video.js';
import {ReChat, LiveChat} from '../chat.js';
import {ChatOptions} from './chatoptions.js';
import {settings} from '../../settings.js';
import {utils} from '../../utils/utils.js';
import {Emotes} from './emotes.js';
import {Draggable, Resizable} from '../../utils/moveresize.js';



class ChatInterface{
    constructor(elem){
        this.elem = elem;
        this.chatCont = this.elem.querySelector(".chat-container");
        this.chatPausedIndicator = this.chatCont.querySelector(".chat-paused-indicator");
        this.chatLines = this.chatCont.querySelector(".chat-lines");
        this.chatOptionsElem = this.elem.querySelector(".chat-options");

        this.chatOptions = new ChatOptions(this.chatOptionsElem);

        this.emotes = new Emotes();

        this.restoreChat();

        this.initMoveDrag();

        this.badges = {
            "moderator": "/resources/badges/mod.png",
            "staff": "/resources/badges/staff.png",
        }

        this.autoScroll = true;

        this.handlers();
    }

    handlers(){
        this.chatCont.addEventListener("mouseenter", (e) => {
            this.autoScroll = false;
            this.chatPausedIndicator.style.display = "block";
        });
        this.chatCont.addEventListener("mouseleave", (e) => {
            this.autoScroll = true;
            this.chatPausedIndicator.style.display = "none";
        });

        document.addEventListener("keydown", e=>{
            if(e.shiftKey || e.altKey || e.ctrlKey)return;
            if(e.keyCode === 67){
                this.toggleChat();
            }
        });

        window.onresize = (event) => {
            this.scrollToBottom();
        }
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
        this.elem.style.display = "block";
    }

    queueStart(vid, channel, channelId){
        this.chat = new ReChat(vid);
        if(!channel){
            this.video = new Video(vid);
            this.video.loaded.then(()=>{
                this.start(this.video.channel, this.video.channelId);
            });
        }
        else{
            this.start(channel, channelId);
        }
    }

    start(channel, channelId, offset=0){
        this.chat.start(offset);
        this.getSubBadge(channelId);
        this.emotes.loadEmoteData(channel);
    }

    getSubBadge(id){
        if(!id){return;}
        let url = `https://api.twitch.tv/kraken/chat/${id}/badges`;
        utils.getRequestPromise(url, {then:"json"}).then(json=>{
            if(json && json["subscriber"]){
                this.badges["subscriber"] = json["subscriber"]["image"];
            }
        });
    }

    iterate(secs){
        if(this.addingMsgs || this.seeking)return;
        this.addNewMsgs(secs);
        this.chat.getNext();
    }

    msgElem(msg){
        let elem  = document.createElement("div");
        elem.classList.add("message");
        let color = msg.color && msg.color.toLowerCase();
        if(color && color.length){
            color = utils.colors.convertColor(color);
        }
        else{
            color = "#C4BBBF";
        }
        let text = this.emotes.replaceWithEmotes(msg.fragments);
        let badges = "";
        if(msg.badges){
            badges = this.getBadgeElems(msg.badges);
        }
        elem.innerHTML = `${badges}<span style="color:${color};" class="from">${msg.from}: </span><span class="text">${text}</span>`;
        return elem;
    }

    addMsg(msg){
        let elem = msg.elem;
        if(!elem){
            elem = this.msgElem(msg);
            msg.elem = elem;
        }
        this.chatLines.appendChild(elem);
    }

    addNewMsgs(time){
        this.addingMsgs = true;
        let msg = this.chat.messages.get(0);
        while (msg !== undefined){
            if (msg.time <= time){
                this.addMsg(msg);
                msg = this.chat.messages.shift();
            }
            else{
                break;
            }
        }

        this.removeOldLines()
        if(this.autoScroll){
            this.scrollToBottom();
        }
        this.addingMsgs = false;
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
        if(elems.length){
            return `<span class="user-badges">${elems.join("")}</span>`;
        }
        return "";
    }

    removeOldLines(){
        let elems = this.chatLines.children;
        if (elems.length > 200){
            let i = 0;
            while (i < 100){
                elems[0].remove();
                i++;
            }
        }
    }

    scrollToBottom(){
        this.chatCont.scrollTo(0,this.chatCont.scrollHeight);
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
            outer: document.querySelector(".app"),
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



class ReChatInterface extends ChatInterface{

    getSyncTime(){
        return this.chatOptions.options["syncTime"].val;
    }

    startFromGET(){
        let vid = utils.findGetParameter("vid");
        if(vid){
            this.queueStart(vid);
        }
    }

    queueStart(vid, channel, channelId){
        this.chat = new ReChat(vid);
        if(!channel){
            this.video = new Video(vid);
            this.video.loaded.then(()=>{
                this.start(this.video.channel, this.video.channelId);
            });
        }
        else{
            this.start(channel, channelId);
        }
    }

    start(channel, channelId, offset=0){
        this.chat.start(offset);
        this.getSubBadge(channelId);
        this.emotes.loadEmoteData(channel);
    }

    seek(secs, before){
        if(this.addingMsgs || this.seeking)return;
        this.seeking = true;
        let syncTime = this.getSyncTime();
        let diff = secs - before;
        if(-33 < diff && diff < 0){
            this.revertUntilAlign(secs+syncTime);
        }
        else if(0 < diff && diff < 33){
            this.addNewMsgs(secs);
        }
        else{
            this.chat.seek(secs+syncTime);
            this.clearMessages();
        }
        this.seeking = false;
    }

    revertUntilAlign(secs){
        let shifted, msg;
        while (true){
            shifted = this.chat.messages.revertShift();
            msg = this.chat.messages.get(0);
            if(!shifted || !msg){break;}
            if(msg.time <= secs){
                this.chat.messages.advanceStart();
                break;
            }
            else{
                if(this.chatLines.contains(msg.elem)){
                    msg.elem.remove();
                }
            }
        }
    }

    iterate(secs){
        if(this.addingMsgs || this.seeking)return;
        this.addNewMsgs(secs+this.getSyncTime());
        this.chat.getNext();
    }
}


class LiveChatInterface extends ChatInterface{

    startFromGET(){
        let channel = utils.findGetParameter("channel");
        if(channel){
            this.getChannelId(channel).then(id=>{
                this.queueStart(channel, id);
            });
        }
    }

    queueStart(channel, channelId){
        this.chat = new LiveChat(channel);
        this.start(channel, channelId);
    }

    start(channel, channelId){
        this.chat.start(this.onMsg.bind(this));
        this.getSubBadge(channelId);
        this.emotes.loadEmoteData(channel);
    }

    onMsg(msg){
        this.removeOldLines();
        this.addMsg(msg);
        if(this.autoScroll){
            this.scrollToBottom();
        }
    }

    getBadgeElems(badges){
        let elems = [], badge;
        for(badge of badges){
            if(badge in this.badges){
                elems.push(this.getBadgeElem(badge, this.badges[badge]));
            }
        }
        if(elems.length){
            return `<span class="user-badges">${elems.join("")}</span>`;
        }
        return "";
    }
}


export {ReChatInterface, LiveChatInterface};
