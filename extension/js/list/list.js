import {Videos, StreamCards} from './cardrenderer.js';
import {AweSearcher} from './searcher.js';
import {Favourites} from './favs.js';

import {elements} from './elements.js';
import {settings} from '../settings.js';
import {utils} from '../utils/utils.js';
import {v5Api} from '../api/v5.js';
import {HelixEndpoint} from '../api/helix.js';


const typeNames = {
    "live": "Live",
    "archive": "Past Broadcasts",
    "highlight": "Highlights",
}
const defaultParams = {
    type: "live",
    game: ""
};

class Ui{
    constructor(){
        this.streamsEndpoint = new HelixEndpoint("streams");
        this.userStreamsEndpoint = new HelixEndpoint("userStreams");
        this.userVideosEndpoint = new HelixEndpoint("userVideos");

        this.streamCardRenderer = new StreamCards();
        this.videoCardRenderer = new Videos();

        this.favs = new Favourites();
        new AweSearcher(elements.optionsGame, "games");
        new AweSearcher(elements.optionsChannel, "channels");
        this.handlers();
        if(!this.loadFromGET() && settings.clientId.length){
            this.updateFormElements(defaultParams.type);
            this.load(defaultParams, true);
        }
    }

    showLiveFavs(channels){
        this.clean();

        if(channels){
            this.userStreamsEndpoint.call(channels).then(data=>{
                this.streamCardRenderer.addCards(data);
            });
        }
        else{            
            utils.storage.getItem("favourites").then(channels=>{
                this.userStreamsEndpoint.call({users:channels}).then(data=>{
                    this.streamCardRenderer.addCards(data);
                });
            });
        }
    }

    handlers(){
        window.addEventListener("scroll", e=>{
            if(this.loading)return;
            if(utils.percentageScrolled()>95){
                this.load();
            }
        });


        elements.channelTitleChannelFav.addEventListener("click",e=>{
            let faved = elements.channelTitleChannelFav.classList.contains("faved");
            if(faved){
                this.favs.remove(this.currentChannel);
                elements.channelTitleChannelFav.classList.remove("faved");
            }
            else{
                this.favs.add(this.currentChannel);
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
            let focused = elements.form.querySelector(":focus");
            focused && focused.blur();
            let params = this.loadParams();
            this.load(params);
        });
        elements.optionsType.addEventListener("click", e=>{
            if(e.target.classList.contains("search-type-button")){
                let type = e.target.dataset.type;
                this.updateFormElements(type);
            }
        });
        elements.linkList.addEventListener("click", (e)=>{
            e.preventDefault();
            if(e.target.className === "link-list__link"){
                let channel = e.target.textContent;
                elements.optionsChannel.value = channel;
                let params = this.loadParams();
                this.load(params);
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
    }

    loadWatchLater(){
        this.clean();
        this.media = new Videos(null, true);
        elements.channelTitleChannelName.textContent = "Watch Later";
        elements.channelTitleInfo.textContent = "";
        history.replaceState("watchlater", "twitch-list | Watch Later", "?type=watchlater");
        document.title = "Watch Later";
    }

    loadNonlisted(){
        this.clean();
        this.media = new Streams(null, true);
        elements.channelTitleChannelName.textContent = "Fetching unlisted Streams";
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
        else if(type === "livefavs"){
            elements.linkList.style.display = "none";
            hideElems = elements.form.querySelectorAll(".search-option.search-option--vod");
            showElems = elements.form.querySelectorAll(".search-option.search-option--live");
            this.showLiveFavs();
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

    clean(){
        this.selectedCard = undefined;
        elements.paginationPages.innerHTML = "";
        elements.resultList.innerHTML = "";
        elements.channelTitleInfo.textContent = "";
        elements.channelTitleChannelName.textContent = "";
        elements.channelTitleChannelFav.style.display = "none";
        elements.channelTitleChannelFav.classList.remove("faved");
    }

    loadParams(){
        let type = elements.optionsType.querySelector(".active").dataset.type;
        let params = {
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
        if(!params)params = {type: type};
        if(type === "watchlater"){
            this.loadWatchLater();
            return true;
        }
        if(type === "nonlisted"){
        	this.loadNonlisted();
        	return true;
        }
        if(params){
            if(type === "live"){
                params["game"] = params["game"] || defaultParams["game"];
            }
            else if (type==="livefavs"){
                this.showLiveFavs();
                this.updateOptionsElem(params);
                this.updateFormElements();
                return true;
            }
            else{
                params["type"] = type;
            }
            this.updateOptionsElem(params);
            this.updateFormElements();
            this.load(params);
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


    load(params){
        this.loading = true;
        let p;
        if(params){
            this.clean();
            if(params.type === "live"){
                this.endpoint = this.streamsEndpoint;
                this.cardRenderer = this.streamCardRenderer;
                p = this.endpoint.call();
            }
            else{
                this.endpoint = this.userVideosEndpoint;
                this.cardRenderer = this.videoCardRenderer;
                if(params.channel){
                    p = utils.getUid(params.channel).then(uid=>{
                        params.uid = uid;
                        return this.endpoint.call(params);
                    });
                }
                else{
                    p = this.endpoint.call(params);
                }
            }
        }
        else{
            // this.updateOptionsElem(params);
            // this.updateFormElements();
                p = this.endpoint.next();
        }

        p.then(data=>{
            this.cardRenderer.addCards(data);
            params && this.replaceState(params);
            this.loading = false;
        });
    }


}

export {Ui};


