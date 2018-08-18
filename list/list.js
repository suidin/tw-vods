import {settings} from '../settings.js';
import { utils } from '../utils/utils.js';



let channels = [];
const channelsMaxSize = 30;
function getChannels(){
    let storageChannels = localStorage.getItem("channels");
    if(storageChannels !== null){
        channels = JSON.parse(storageChannels);
    }
    return channels;
}
function updateChannels(channel){
    removeChannel(channel);
    channels.unshift(channel);
    if(channels.length >= channelsMaxSize){
        channels.pop();
    }
    localStorage.setItem("channels", JSON.stringify(channels));
}

function removeChannel(channel){
    let index = channels.indexOf(channel);
    if(index>=0){
        channels.splice(index, 1);
        localStorage.setItem("channels", JSON.stringify(channels));
    }
}

class Api{
    constructor(){
    }

    fetchVideos(user, type="archive", limit=30, sort="time", offset=0){

        let url = `https://api.twitch.tv/kraken/channels/${user}/videos?limit=${limit}&broadcast_type=${type}&offset=${offset}&sort=${sort}`

        return utils.getRequestPromise(url, {then:"json", headers:{}});
    }
}

class VideosGetter{
    constructor(user, limit=10, offset=0, type="archive", sort="time"){
        this.api = new Api();
        this.user = user;
        this.type = type;
        this.limit = limit;
        this.sort = sort;
        this.initialOffset = offset;
        this.offset = offset;
        this.hasNextPage = true;
        this.fetching = false;
    }

    getNext(callback){
        this.fetching = true;
        if (this.hasNextPage === false){
            utils.log("no next page");
            return
        }
        let promise = this.api.fetchVideos(this.user, this.type, this.limit, this.sort, this.offset);
        return promise.then(json=>{
            if(!json){return;}
            this.total = json["_total"];
            console.log(this.total);
            this.offset = this.offset + this.limit;
            this.hasNextPage = this.offset < (this.total-1);
            this.fetching = false;
            return json.videos;

        });
    }
}




class Ui{
    constructor(){
        this.resultList = document.querySelector(".results .list");
        this.more = document.querySelector(".results .more");
        this.channelTitleChannel = document.querySelector(".results .channel-title__channel");
        this.channelTitleInfo = document.querySelector(".results .channel-title__info");
        this.linkList = document.querySelector(".pre-results .link-list");
        let channels = getChannels();
        for(let index in channels){
            if(!channels.hasOwnProperty(index)){continue;}
            let ch = channels[index];
            let elem = this.makeChannelLink(ch);
            this.linkList.appendChild(elem);
        }
    }

    removeChannel(channel){
        let item = document.querySelector(".link-list__item." + channel);
        item.remove();
    }

    makeChannelLink(channel){
        let channelElem = document.createElement("div");
        channelElem.className = "link-list__item " + channel;
        channelElem.innerHTML = `<a href="?channel=${channel}" class="link-list__link">${channel}</a><span class="link-list__remove"> X</span>`;
        return channelElem;
    }

    makeInfoElem(title, val){
        return `<div class="video-card__info video-${title}">${title}: ${val}</div>`;
    }

    createVideoCard(video){
        let length = utils.secsToReadable(video.length);
        let game = video.game;
        let title = video.title;
        let url = video.url;
        let thumbUrl = video.thumb;
        let date = video.recorded_at;
        let when = utils.twTimeStrToReadable(date);
        let id = video["_id"].substr(1);
        let resumePos = this.resumePositions[id] || 0;
        let resumeBarWidth = (resumePos / video.length) * 100;
        let playerUrl = "/player/player.html";
        let popoutElem = `<a href="${url}" target="_blank">watch on twitch.tv</a>`;
        let lengthElem = this.makeInfoElem("Length", length);
        let gameElem = this.makeInfoElem("Game", game);
        let titleElem = `<div title="${title}" class="video-card__title">${title}</div>`;
        let thumbElem = `<a href="${playerUrl}?vid=${id}" target="_blank"><div class="thumb-container"><div class="img-container"><img class="video-card-thumb" src="${thumbUrl}" /></div><div class="resume-bar" style="width:${resumeBarWidth}%"></div></div></a>`;
        let timePassedElem = `<div class="video-card__date">${when} ${popoutElem}</div>`;
        let elem = document.createElement("div");
        elem.className = "video-card";
        elem.innerHTML = `${thumbElem}${titleElem}${gameElem}${lengthElem}${timePassedElem}`;

        return elem;
    }

    updateChannels(channel){
        let channelElem = this.linkList.querySelector(".link-list__item."+channel);
        if(!channelElem){
            channelElem = this.makeChannelLink(channel);
        }
        this.linkList.insertBefore(channelElem, this.linkList.firstChild);
    }

    makeThumbUrl(video, height){
        let thumb = video.thumbnails[0];
        if(thumb){
            let url = thumb.url;
            let imgHeight = url.substring(url.length-7).substring(0,3);
            video.thumb = url.split(imgHeight).join(height);
        }
        else{
            video.thumb = "https://vod-secure.twitch.tv/_404/404_processing_320x180.png";
        }
    }

    prepareAnimation(video, card){
        let animationElem = card.querySelector(".img-container");
        let img = animationElem.querySelector("img");
        animationElem.addEventListener("mouseenter", e=>{
            img.src = video["animated_preview_url"];
            animationElem.className = "img-container animated";
        });
        animationElem.addEventListener("mouseleave", e=>{
            animationElem.className = "img-container";
            img.src = video.thumb;
        });
    }

    showVideo(video){
        this.makeThumbUrl(video, 180);
        let card = this.createVideoCard(video);
        this.resultList.appendChild(card);
        if(video.status === "recorded"){
            this.prepareAnimation(video, card);
        }
    }

    showVideos(videos){
        for(let index in videos){
            if(videos.hasOwnProperty(index)){
                this.showVideo(videos[index]);
            }
        }
        this.more.style.display = "flex";
    }
    clean(){
        this.more.style.display = "none";
        this.resultList.innerHTML = "";
        this.channelTitleInfo.textContent = "";
        this.channelTitleChannel.textContent = "";
    }

    processVideos(videos, fromState=false){
        if(videos.length>0){
            utils.log(videos[0]);
            this.resumePositions = utils.storage.getItem("resumePositions");
            this.showVideos(videos);
            let channel = videos[0].channel.display_name;
            updateChannels(channel);
            this.updateChannels(channel);
            if(!fromState){
                this.pushState(channel, videos);
            }
            document.title = channel + " Past Broadcasts";
        }
    }

    pushState(channel, videos){
        history.pushState([channel, videos], "vod-list | " + channel, "?channel=" + channel);
    }
}

class Interface{
    constructor(){
        this.ui = new Ui();
        const channelForm = document.querySelector(".interface form");
        const channelInput = document.querySelector("input.channelInput");
        const clientIdButton = document.querySelector(".client-id-button");
        const optionsButton = document.querySelector(".search-options-button");
        const optionsElem = document.querySelector(".search-options");
        const optionsLimit = channelForm.querySelector(".search-option__limit");
        const optionsOffset = channelForm.querySelector(".search-option__offset");
        const optionsType = channelForm.querySelector(".search-option__type");


        this.loadParams = ()=>{
            let selected = optionsType.options[optionsType.selectedIndex];
            let params = {
                limit: parseInt(optionsLimit.value),
                offset: parseInt(optionsOffset.value)-1,
                type: selected.value,
                typeName: selected.textContent
            };
            return params;
        }

        clientIdButton.addEventListener("click", e=>{
            e.preventDefault();
            utils.promptClientId();
        });
        channelForm.addEventListener("submit", (e)=>{
            e.preventDefault();
            let channel = channelInput.value;
            this.loadChannel(channel);
        });
        this.ui.linkList.addEventListener("click", (e)=>{
            e.preventDefault();
            if(e.target.className === "link-list__link"){
                let channel = e.target.textContent;
                this.loadChannel(channel);
            }
        });
        this.ui.linkList.addEventListener("click", (e)=>{
            e.preventDefault();
            if(e.target.className === "link-list__remove"){
                let channel = e.target.previousElementSibling.textContent;
                this.ui.removeChannel(channel);
                removeChannel(channel);
            }
        });
        this.ui.more.querySelector(".more__button").addEventListener("click", (e)=>{
            this.getter.getNext().then(videos=>{
                if(videos){
                    this.ui.showVideos(videos);
                    this.updateChannelTitle(this.getter.user, this.loadParams().typeName);
                }
            });
        });
        optionsElem.hidden = true;
        const className = "search-options-button--visible-options";
        optionsButton.addEventListener("click", e=>{
            optionsElem.hidden = !optionsElem.hidden;
            if(optionsElem.hidden){
                optionsButton.classList.remove(className);
            }
            else{
                optionsButton.classList.add(className);
            }
        });
        window.onpopstate = (event) => {
            if(event.state){
                let [channel, videos] = event.state;
                this.loadChannel(channel, videos);
            }
            else{
                this.ui.clean();
            }
        };

        this.loadVideosFromGET();
    }

    loadVideosFromGET(){
        let channel = utils.findGetParameter("channel");
        if(channel){
            this.loadChannel(channel);
        }
    }

    updateChannelTitle(channel, typeName){
        let showingCurrent = this.getter.offset;
        let total = this.getter.total;
        if(showingCurrent>=total){
            showingCurrent=total;
            this.ui.more.style.display = "none";
        }
        this.ui.channelTitleChannel.textContent = `${channel}`;
        this.ui.channelTitleInfo.textContent = `Showing ${typeName} ${this.getter.initialOffset+1}-${showingCurrent} of ${this.getter.total}`;
    }

    loadChannel(channel, videos){
        this.ui.clean();
        if(videos){
            this.ui.processVideos(videos, true);
        }
        else{
            let params = this.loadParams();
            if(params){
                this.getter = new VideosGetter(channel, params.limit, params.offset, params.type);
            }
            else{
                this.getter = new VideosGetter(channel);
            }
            this.getter.getNext().then(videos=>{
                if(videos && videos.length){
                    this.ui.processVideos(videos);
                    
                    this.updateChannelTitle(channel, params.typeName);
                }
                else{
                    this.ui.channelTitleChannel.textContent = `<${channel}>`;
                    this.ui.channelTitleInfo.textContent = `No videos found`;
                }
            });
        }
    }
}


window.onload = ()=>{
    window.interface = new Interface();
}
