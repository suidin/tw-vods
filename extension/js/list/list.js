import {Videos, Streams} from './mediatypes.js';
import {elements} from './elements.js';
import {settings} from '../settings.js';
import {Pagination} from '../utils/pagination.js';
import {utils} from '../utils/utils.js';
import {v5Api} from '../api/v5.js';

class Channels{
    constructor(){
        this.initChannels();
        this.channelsMaxSize = 200;
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
        channelElem.innerHTML = `<a href="${location.pathname}?perPage=30&page=1&type=archive&channel=${channel}" class="link-list__link">${channel}</a><span class="link-list__remove"> X</span>`;
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
    "live": "Live",
    "archive": "Past Broadcasts",
    "highlight": "Highlights",
    "upload": "Uploads"
}
const defaultParams = {
    perPage: 30,
    page: 1,
    type: "live",
    game: ""
};


let searcherCache = {
    "games":  {},
    "channels": {},
};

class Searcher{
    constructor(elem, type, params){
        if(!params){
            params = {
                "minChars": 4,
                "cooldown": 2000,
            }
        }
        this.awe = new Awesomplete(elem, {list: [], autoFirst: true, minChars: 1});
        this.params = params;
        this.type = type;
        this.elem = elem;

        this.init();
    }
    init(){
        let now;
        let lastSearch = performance.now();
        let currentVal = "";
        let cache;
        let tDiff;
        const cd = this.params.cooldown;
        const minChars = this.params.minChars;

        this.elem.addEventListener("input", e=>{
            currentVal = this.elem.value;
            cache = searcherCache[this.type][currentVal];
            if(cache){
                this.awe.list = cache;
                this.awe.evaluate();
                return;
            }
            now = performance.now();
            tDiff = now - lastSearch;
            if(currentVal.length < minChars || tDiff < cd) return;
            lastSearch = now;
            if(this.type === "games"){
                v5Api.searchGames(encodeURIComponent(currentVal)).then(json=>{
                    if(!json || !json.games || !json.games.length) return;
                    let arr = json.games.map(g=>{
                        return g.name;
                    });
                    searcherCache[this.type][currentVal] = arr;
                    this.awe.list = arr;
                    this.awe.evaluate();
                });
            }
            else if (this.type === "channels"){
                v5Api.searchChannels(encodeURIComponent(currentVal)).then(json=>{
                    if(!json || !json.channels || !json.channels.length) return;
                    let arr = json.channels.map(c=>{
                        return c.display_name;
                    });
                    searcherCache[this.type][currentVal] = arr;
                    this.awe.list = arr;
                    this.awe.evaluate();
                });
            }
            else{
                console.error(`search Api for type: ${this.type} not implemented`);
            }
        });
    }
}

class Ui{
    constructor(){
        this.channels = new Channels();
        this.pagination = new Pagination(elements.paginationPages);
        // this.channelAwesomeplete = new Awesomplete(elements.optionsChannel, {list: this.channels.channels, autoFirst: true, minChars: 1});
        new Searcher(elements.optionsGame, "games");
        new Searcher(elements.optionsChannel, "channels");
        // this.gamesAwesomeplete = new Awesomplete(elements.optionsGame, {list: [], autoFirst: true, minChars: 1});
        this.handlers();
        if(!this.loadFromGET() && settings.clientId.length){
            this.load(defaultParams, true);
        }
    }

    handlers(){
        elements.importButton.addEventListener("click", e=>{
            e.preventDefault();
            utils.import();
        });

        elements.importFollowsButton.addEventListener("click", e=>{
            e.preventDefault();
            let p = utils.importFollows();
            p.then(names=>{
                if(names && names.length){
                    names.map(name=>this.channels.updateChannels(name));
                }
            });
        });

        elements.wlButton.addEventListener("click", e=>{
            e.preventDefault();
            this.loadWatchLater();
        });

        elements.nlButton.addEventListener("click", e=>{
            e.preventDefault();
            this.loadNonlisted();
        });

        elements.exportButton.addEventListener("click", e=>{
            e.preventDefault();
            utils.export();
        });

        elements.clientIdButton.addEventListener("click", e=>{
            e.preventDefault();
            utils.promptClientId();
        });
        elements.form.addEventListener("submit", (e)=>{
            e.preventDefault();
            let params = this.loadParams();
            this.load(params, true);
        });
        elements.optionsType.addEventListener("click", e=>{
            if(e.target.classList.contains("search-type-button")){
                let type = e.target.dataset.type;
                elements.optionsType.querySelector(".active").classList.remove("active");
                e.target.classList.add("active");
            }
            elements.optionsPage.value = 1;
            this.updateFormElements();
        });
        // this.updateFormElements();
        elements.linkList.addEventListener("click", (e)=>{
            e.preventDefault();
            if(e.target.className === "link-list__link"){
                let channel = e.target.textContent;
                elements.optionsChannel.value = channel;
                let params = this.loadParams();
                this.load(params, true);
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
                this.changePage(parseInt(elem.textContent));
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
            else if(e.keyCode === 37){
                if(this.media && this.media.getter && !this.loading && this.media.getter.page > 1){
                    this.changePage(this.media.getter.page - 1);
                }
            }
            else if(e.keyCode === 39){
                if(this.media && this.media.getter && !this.loading && this.media.getter.page < this.media.getter.lastPage){
                    this.changePage(this.media.getter.page + 1);
                }
            }
        });
    }

    loadWatchLater(){
        this.clean();
        this.media = new Videos(null, true);
        elements.channelTitleChannel.textContent = "Watch Later";
        elements.channelTitleInfo.textContent = "";
        history.replaceState("watchlater", "twitch-list | Watch Later", "?type=watchlater");
        document.title = "Watch Later";
    }

    loadNonlisted(){
        this.clean();
        this.media = new Streams(null, true);
        elements.channelTitleChannel.textContent = "Fetching nonlisted Streams";
        elements.channelTitleInfo.textContent = "this can take some time...";
        history.replaceState("nonlisted", "twitch-list | Nonlisted Streams", "?type=nonlisted");
        document.title = "Nonlisted Streams";
    }

    updateFormElements(){
        let type = elements.optionsType.querySelector(".active").dataset.type;
        let hideElems, showElems;
        if(type === "live"){
            elements.linkList.style.display = "none";
            hideElems = elements.form.querySelectorAll(".search-option.search-option--vod");
            showElems = elements.form.querySelectorAll(".search-option.search-option--live");
        }
        else{
            elements.linkList.style.display = "flex";
            hideElems = elements.form.querySelectorAll(".search-option.search-option--live");
            showElems = elements.form.querySelectorAll(".search-option.search-option--vod");

        }
        let elem;
        for(elem of hideElems){
            elem.style.display = "none";
        }
        for(elem of showElems){
            elem.style.display = "inline-block";
        }
    }

    changePage(page){
        let params = {
            "type": this.media.getter.type,
            "perPage": this.media.getter.perPage,
            "page": page
        };
        if(this.media.getter.type === "live"){
            params["game"] = decodeURIComponent(this.media.getter.game);
        }
        else{
            params["channel"] = this.media.getter.channel;
        }
        this.load(params, false);
    }


    clean(){
        this.selectedCard = undefined;
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
        if(!utils.isElementInViewport(selected)){
            selected.scrollIntoView();
        }
    }

    loadParams(){
        let type = elements.optionsType.querySelector(".active").dataset.type;
        let params = {
            perPage: parseInt(elements.optionsLimit.value),
            page: parseInt(elements.optionsPage.value),
            "type": type
        };
        if(type === "live"){
            params["game"] = elements.optionsGame.value;
        }
        else{
            params["channel"] = elements.optionsChannel.value;
        }
        return params;
    }

    loadFromGET(){
        let params = utils.getStrToObj();
        let type = params["type"] || defaultParams["type"];
        if(type === "watchlater"){
            this.loadWatchLater();
            return true;
        }
        if(type === "nonlisted"){
        	this.loadNonlisted();
        	return true;
        }
        if(params){
            params["perPage"] = parseInt(params["perPage"]) || defaultParams["perPage"];
            params["page"] = parseInt(params["page"]) || defaultParams["page"];
            if(type === "live"){
                params["game"] = params["game"] || defaultParams["game"];
            }
            else{
                params["type"] = type;
            }
            this.updateOptionsElem(params);
            this.updateFormElements();
            this.load(params, true);
            return true;
        }
        else{
            return false;
        }
    }

    updateOptionsElem(params){
        let active = elements.optionsType.querySelector(".active")
        active && active.classList.remove(".active");
        elements.optionsType.querySelector(`[data-type="${params.type}"]`).classList.add("active");
        elements.optionsLimit.value = params.perPage;
        elements.optionsPage.value = params.page;
        if(params.type === "live"){
            elements.optionsGame.value = params.game;
        }
        else{
            elements.optionsChannel.value = params.channel;
        }
    }

    replaceState(params){
        let getStr = utils.objToGetStr(params);
        history.replaceState(params, "twitch-list | " + params.channel, getStr);
    }

    updateResultsTitle(channel, success){
        if(success){
            let total = this.media.getter.total;
            let page = this.media.getter.page;
            let perPage = this.media.getter.perPage;
            if(this.media.getter.type !== "live"){
                let currentFrom = (page-1)*perPage+1;
                let currentTo = page*perPage;
                currentTo = currentTo>total ? total : currentTo;
                let typeName = typeNames[this.media.getter.type];
                document.title = channel + " " + typeName;
                elements.channelTitleChannel.textContent = `${channel}`;
                if(this.media.currentVideoData && this.media.currentVideoData[0].preview.startsWith("https://vod-secure.twitch.tv/_404")){
                    utils.userIdFromUsername(channel).then(id=>{
                        elements.channelTitleChannel.innerHTML = `<a class="channel-currently-live-link" target="_blank" href="/player.html?channel=${channel}&channelID=${id}">${channel}</a>`;
                    });
                }
                elements.channelTitleInfo.textContent = `Showing ${typeName} ${currentFrom}-${currentTo} of ${total}`;
            }
            else{
                let game = decodeURIComponent(this.media.getter.game);
                let text = "Live Channels";
                document.title = (game && game + " | Live Channels") || "Live Channels";
                elements.channelTitleChannel.textContent = text;
                if(game.length){
                    elements.channelTitleInfo.textContent = game;
                }
            }
        }
        else{
            if(channel){
                elements.channelTitleChannel.textContent = `<${channel}>`;
                elements.channelTitleInfo.textContent = `No videos found`;
            }
            else{
                elements.channelTitleChannel.textContent = `<No Live Channels could be found>`;
                elements.channelTitleInfo.textContent = "page number probably too high";
            }
        }
    }

    load(params, first){
        this.loading = true;
        this.clean();
        if(first){
            if(!params){
                params = defaultParams;
            }
            if(params.type === "live"){
                this.media = new Streams(params);
            }
            else{
                this.media = new Videos(params);
            }
        }
        else{
            this.updateOptionsElem(params);
            this.updateFormElements();
        }

        let loaded = this.media.load(params.page);
        loaded.then(success => {
            if(success){
                this.updatePagination();
                if(first && params.channel){
                    this.channels.updateChannels(success);
                }
                this.updateResultsTitle(success, true);
            }
            else{
                this.updateResultsTitle(params.channel, false);
            }
            console.log(params);
            this.replaceState(params);
            this.loading = false;
        });
    }

    updatePagination(){
        this.pagination.update(this.media.getter.lastPage, this.media.getter.page);
    }
}

export {Ui};


