import {Videos} from './videos.js';
import {elements} from './elements.js';
import {settings} from '../settings.js';
import {utils} from '../utils/utils.js';


class Channels{
    constructor(){
        this.initChannels();
        this.channelsMaxSize = 30;


    }
    initChannels(){
        let storageChannels = utils.storage.getItem("channels") || [];
        this.channels = storageChannels;
        let channel, elem;
        for(channel of this.channels){
            elem = this.makeChannelLink(channel);
            elements.linkList.appendChild(elem);
        }
    }

    makeChannelLink(channel){
        let channelElem = document.createElement("div");
        channelElem.className = "link-list__item " + channel;
        channelElem.innerHTML = `<a href="?channel=${channel}" class="link-list__link">${channel}</a><span class="link-list__remove"> X</span>`;
        return channelElem;
    }

    updateChannels(channel){
        this.removeChannel(channel);
        this.channels.unshift(channel);
        if(this.channels.length >= this.channelsMaxSize){
            this.channels.pop();
        }
        utils.storage.setItem("channels", this.channels);
        this.updateChannelsElem(channel);
    }

    updateChannelsElem(channel){
        let channelElem = elements.linkList.querySelector(".link-list__item."+channel);
        if(!channelElem){
            channelElem = this.makeChannelLink(channel);
        }
        elements.linkList.insertBefore(channelElem, elements.linkList.firstChild);
    }

    removeChannel(channel){
        let index = this.channels.indexOf(channel);
        if(index>=0){
            this.channels.splice(index, 1);
            utils.storage.setItem("channels", this.channels);
        }
        this.removeChannelElem(channel);
    }

    removeChannelElem(channel){
        let item = document.querySelector(".link-list__item." + channel);
        item.remove();
    }
}


const typeNames = {
    "archive": "Past Broadcasts",
    "highlight": "Highlights",
    "upload": "Uploads"
}
const defaultParams = {
    limit: 10,
    offset: 0,
    type: "archive"
};

class Ui{
    constructor(){
        this.channels = new Channels();
        new Awesomplete(elements.channelInput, {list: this.channels.channels, autoFirst: true, minChars: 1});
        elements.channelInput.focus();
        this.handlers();
    }

    handlers(){
        elements.importButton.addEventListener("click", e=>{
            e.preventDefault();
            utils.import();
        })

        elements.exportButton.addEventListener("click", e=>{
            e.preventDefault();
            utils.export();
        })

        elements.clientIdButton.addEventListener("click", e=>{
            e.preventDefault();
            utils.promptClientId();
        });
        elements.channelForm.addEventListener("submit", (e)=>{
            e.preventDefault();
            let channel = elements.channelInput.value;
            let params = this.loadParams(channel);
            this.loadVideos(channel, params, false, true);
        });
        elements.linkList.addEventListener("click", (e)=>{
            e.preventDefault();
            if(e.target.className === "link-list__link"){
                let channel = e.target.textContent;
                let params = this.loadParams(channel);
                this.loadVideos(channel, params, false, true);
            }
        });
        elements.linkList.addEventListener("click", (e)=>{
            e.preventDefault();
            if(e.target.className === "link-list__remove"){
                let channel = e.target.previousElementSibling.textContent;
                this.channels.removeChannel(channel);
            }
        });
        elements.more.querySelector(".more__button").addEventListener("click", (e)=>{
            this.loadVideos(null, null, false, false);
        });
        const className = "search-options-button--visible-options";
        elements.optionsButton.addEventListener("click", e=>{
            elements.optionsElem.hidden = !elements.optionsElem.hidden;
            if(elements.optionsElem.hidden){
                elements.optionsButton.classList.remove(className);
            }
            else{
                elements.optionsButton.classList.add(className);
            }
        });
        window.onpopstate = (event) => {
            if(event.state){
                let [channel, videos] = event.state;
                this.videos = videos;
                this.loadVideos(channel, null, true, true);
            }
            else{
                this.clean();
            }
        };
        document.addEventListener("keydown", e=>{
            if(e.ctrlKey || e.altKey)return;
            if(e.keyCode === 9){
                e.preventDefault();
                let i;
                if(e.shiftKey){
                    i = -1;
                }
                else{
                    i = 1;
                }
                this.changeSelectedCard(i);
            }
        })

        this.loadVideosFromGET();
    }

    clean(){
        elements.more.style.display = "none";
        elements.resultList.innerHTML = "";
        elements.channelTitleInfo.textContent = "";
        elements.channelTitleChannel.textContent = "";
    }

    changeSelectedCard(i){
        let selected, cont;
        let cards = elements.resultList.children.length;
        if(!cards)return;
        if(this.selectedCard === undefined){
            this.selectedCard = 0;
        }
        else{
            selected = elements.resultList.children[this.selectedCard];
            cont = selected.querySelector(".img-container");
            this.selectedCard += i;
            if(this.selectedCard>=cards){
                this.selectedCard = 0;
            }
            else if(this.selectedCard<0){
                this.selectedCard = cards-1;
            }
            selected.classList.remove("video-card--selected");
            cont.classList.remove("animated")
        }
        selected = elements.resultList.children[this.selectedCard];
        cont = selected.querySelector(".img-container");
        selected.classList.add("video-card--selected");
        if(cont.classList.contains("can-animate")){
            cont.classList.add("animated");
        }
        selected.querySelector(".ext-player-link").focus();
        selected.scrollIntoView();
    }

    loadParams(){
        let selected = elements.optionsType.options[elements.optionsType.selectedIndex];
        let params = {
            limit: parseInt(elements.optionsLimit.value),
            offset: parseInt(elements.optionsOffset.value)-1,
            type: selected.value
        };
        return params;
    }

    loadVideosFromGET(){
        let channel = utils.findGetParameter("channel");
        if(channel){
            this.loadVideos(channel, null, false, true);
        }
    }

    pushState(channel, videos){
        history.pushState([channel, videos], "vod-list | " + channel, "?channel=" + channel);
    }

    updateChannelTitle(success){
        if(success){
            let channel = this.videos.getter.channel;
            let showingCurrent = this.videos.getter.offset;
            let total = this.videos.getter.total;
            let typeName = typeNames[this.videos.getter.type];
            if(showingCurrent>=total){
                showingCurrent=total;
                elements.more.style.display = "none";
            }
            document.title = channel + " " + typeName;
            elements.channelTitleChannel.textContent = `${channel}`;
            elements.channelTitleInfo.textContent = `Showing ${typeName} ${this.videos.getter.initialOffset+1}-${showingCurrent} of ${this.videos.getter.total}`;
        }
        else{
            elements.channelTitleChannel.textContent = `<${channel}>`;
            elements.channelTitleInfo.textContent = `No videos found`;
        }
    }

    loadVideos(channel, params, fromPopState, first){
        if(!channel && first)return;
        if(first && !fromPopState){
            this.clean();
            if(!params){
                params = defaultParams;
            }
            this.videos = new Videos(channel, params);
        }

        let loaded = this.videos.load();
        loaded.then(success => {
            if(this.videos.getter.hasNextPage){
                elements.more.style.display = "flex";
                if(first){
                    this.channels.updateChannels(channel);
                }
                if(first && !fromPopState){
                    this.pushState(channel, this.videos);
                }
            }
            else{
                elements.more.style.display = "none";
            }
            this.updateChannelTitle(success);
        });        
    }
}

export {Ui};
