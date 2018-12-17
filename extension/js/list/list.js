import {Videos, Streams} from './mediatypes.js';
import {AweSearcher} from './searcher.js';
import {Favourites} from './favs.js';

import {elements} from './elements.js';
import {settings} from '../settings.js';
import {Pagination} from '../utils/pagination.js';
import {utils} from '../utils/utils.js';
import {v5Api} from '../api/v5.js';


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

class Ui{
    constructor(){
        this.favs = new Favourites();
        this.pagination = new Pagination(elements.paginationPages);
        // this.channelAwesomeplete = new Awesomplete(elements.optionsChannel, {list: this.favs.channels, autoFirst: true, minChars: 1});
        new AweSearcher(elements.optionsGame, "games");
        new AweSearcher(elements.optionsChannel, "channels");
        // this.gamesAwesomeplete = new Awesomplete(elements.optionsGame, {list: [], autoFirst: true, minChars: 1});
        this.handlers();
        if(!this.loadFromGET() && settings.clientId.length){
            this.updateFormElements(defaultParams.type);
            this.load(defaultParams, true);
        }
    }

    handlers(){
        elements.channelTitleChannelFav.addEventListener("click",e=>{
            let faved = elements.channelTitleChannelFav.classList.contains("faved");
            if(faved){
                this.favs.remove(this.media.getter.channel);
                elements.channelTitleChannelFav.classList.remove("faved");
            }
            else{
                this.favs.add(this.media.getter.channel);
                elements.channelTitleChannelFav.classList.add("faved");
            }
        });
        elements.importButton.addEventListener("click", e=>{
            e.preventDefault();
            utils.import();
        });

        elements.importFollowsButton.addEventListener("click", e=>{
            e.preventDefault();
            let p = utils.importFollows();
            p.then(names=>{
                if(names && names.length){
                    names.map(name=>this.favs.add(name));
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
                elements.optionsPage.value = 1;
                this.updateFormElements(type);
            }
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
                this.favs.remove(channel);
                if(this.media && this.media.getter && this.media.getter.channel && this.media.getter.channel === channel){
                    elements.channelTitleChannelFav.classList.remove("faved");
                }
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

    updateFormElements(type){
        if(type){
            let active = elements.optionsType.querySelector(".active");
            active && active.classList.remove("active");
            elements.optionsType.querySelector(`[data-type="${type}"]`).classList.add("active");
        }
        else{
            type = elements.optionsType.querySelector(".active").dataset.type;
        }
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
        elements.channelTitleChannelName.textContent = "";
        elements.channelTitleChannelFav.style.display = "none";
        elements.channelTitleChannelFav.classList.remove("faved");
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
                elements.channelTitleChannelName.textContent = `${channel}`;
                console.log(elements.channelTitleChannelName);
                if(utils.storage.faved(channel)){
                    elements.channelTitleChannelFav.classList.add("faved");
                }
                elements.channelTitleChannelFav.style.display = "block";
                if(this.media.currentVideoData && this.media.currentVideoData[0].preview.startsWith("https://vod-secure.twitch.tv/_404")){
                    utils.userIdFromUsername(channel).then(id=>{
                        elements.channelTitleChannelName.innerHTML = `<a class="channel-currently-live-link" target="_blank" href="/player.html?channel=${channel}&channelID=${id}">${channel}</a>`;
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
                elements.channelTitleChannelName.textContent = `<${channel}>`;
                elements.channelTitleInfo.textContent = `No videos found`;
            }
            else{
                elements.channelTitleChannelName.textContent = `<No Live Channels could be found>`;
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


