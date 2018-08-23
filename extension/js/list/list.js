import {Videos} from './videos.js';
import {elements} from './elements.js';
import {settings} from '../settings.js';
import {Pagination} from '../utils/pagination.js';
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
            this.removeChannelElem(channel);
        }
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
    perPage: 10,
    page: 1,
    type: "archive"
};

class Ui{
    constructor(){
        this.channels = new Channels();
        this.pagination = new Pagination(elements.paginationPages);
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
            let params = this.loadParams();
            this.loadVideos(params, true);
        });
        elements.linkList.addEventListener("click", (e)=>{
            e.preventDefault();
            if(e.target.className === "link-list__link"){
                let channel = e.target.textContent;
                elements.channelInput.value = channel;
                let params = this.loadParams();
                this.loadVideos(params, true);
            }
        });
        elements.linkList.addEventListener("click", (e)=>{
            e.preventDefault();
            if(e.target.className === "link-list__remove"){
                let channel = e.target.previousElementSibling.textContent;
                this.channels.removeChannel(channel);
            }
        });
        elements.paginationPages.addEventListener("click", (e)=>{
            let elem = e.target;
            if(elem.className === "pagination-page"){
                let params = {
                    channel: this.videos.getter.channel,
                    perPage: this.videos.getter.perPage,
                    page: parseInt(elem.textContent),
                    type: this.videos.getter.type
                };
                this.loadVideos(params, false);
            }
            else if(elem.classList.contains("pagination-page-gap")){
                let direction;
                if(elem.previousSibling.textContent === "1"){
                    direction = -1;
                }
                else{
                    direction = 1;
                }
                this.pagination.rotate(direction);
            }
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
        });

        this.loadVideosFromGET();
    }

    clean(){
        elements.paginationPages.innerHTML = "";
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
            channel: elements.channelInput.value,
            perPage: parseInt(elements.optionsLimit.value),
            page: defaultParams.page,
            type: selected.value
        };
        return params;
    }

    loadVideosFromGET(){
        let params = utils.getStrToObj();
        if(params){
            params["perPage"] = parseInt(params["perPage"]) || defaultParams["perPage"];
            params["page"] = parseInt(params["page"]) || defaultParams["page"];
            params["type"] = params["type"] || defaultParams["type"];
            this.updateOptionsElem(params);
            this.loadVideos(params, true);
        }
    }

    updateOptionsElem(params){
        elements.channelInput.value = params.channel;
        elements.optionsLimit.value = params.perPage;
        elements.optionsType.value = params.type;
    }

    replaceState(params){
        let getStr = utils.objToGetStr(params);
        history.replaceState(params, "vod-list | " + params.channel, getStr);
    }

    updateChannelTitle(channel, success){
        if(success){
            let total = this.videos.getter.total;
            let page = this.videos.getter.page;
            let perPage = this.videos.getter.perPage;
            let currentFrom = (page-1)*perPage+1;
            let currentTo = page*perPage;
            currentTo = currentTo>total ? total : currentTo;
            let typeName = typeNames[this.videos.getter.type];
            document.title = channel + " " + typeName;
            elements.channelTitleChannel.textContent = `${channel}`;
            elements.channelTitleInfo.textContent = `Showing ${typeName} ${currentFrom}-${currentTo} of ${total}`;
        }
        else{
            elements.channelTitleChannel.textContent = `<${channel}>`;
            elements.channelTitleInfo.textContent = `No videos found`;
        }
    }

    loadVideos(params, first){
        this.clean();
        if(first){
            if(!params){
                params = defaultParams;
            }
            this.videos = new Videos(params);
        }

        let loaded = this.videos.load(params.page);
        loaded.then(channel => {
            if(channel){
                this.updatePagination();
                if(first){
                    this.channels.updateChannels(channel);
                }
                this.updateChannelTitle(channel, true);
            }
            else{
                this.updateChannelTitle(params.channel, false);
            }
            this.replaceState(params);
        });
    }

    updatePagination(){
        this.pagination.update(this.videos.getter.lastPage, this.videos.getter.page);
    }
}

export {Ui};


