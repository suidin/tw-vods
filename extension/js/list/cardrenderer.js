import {VideosGetter, LiveStreamsGetter} from './getter.js';
import {WatchLater} from './watchlater.js';
import {elements} from './elements.js';
import {settings} from '../settings.js';
import {utils} from '../utils/utils.js';


const watchLater = new WatchLater();


class Cards{

}

class VideoCards{
    constructor(params){
        this.ready = utils.storage.getItem("resumePositions").then(rp=>{
            this.resumePositions = rp;
        });
    }

    makeInfoElem(title, val){
        let classPostfix = title.toLowerCase();
        return `<div class="card__info video-${classPostfix}">${title}: ${val}</div>`;
    }

    createCard(video){
        let length = video.duration;
        let secs = utils.HMSToSecs(length);
        let game = "";
        if(video.game){
            game = video.game.name;
        }

        let title = utils.escape(video.title);
        let date = video.created_at;
        let when = utils.twTimeStrToReadable(date);
        let id = video["id"];
        let resumePos = this.resumePositions[id] || 0;
        let resumeBarWidth = (resumePos / secs) * 100;
        let playerUrl = "player.html";
        let displayName = video.user_name;
        let views = video.view_count.toString();
        if(views.length > 3){
            views = views.substring(0, views.length-3) + "," + views.substring(views.length-3);
        }
        let viewersElem = `<div class="card__overlay video-viewers">${views} views</div>`;
        let nameElem = this.drawingWatchLaterList ? `<a target="_blank" href="${location.pathname}?type=archive&channel=${displayName}">${displayName}</a>`: "";
        let lengthElem = `<div class="card__overlay video-length">${length}</div>`;
        let watchLaterIcon;
        let watchLaterTitle;

        if (this.urlParams.type && this.urlParams.type === "watchlater"){
                watchLaterIcon = "remove-icon.png";
                watchLaterTitle = "Remove from Watch Later";
        }
        else{
            if(watchLater.contains(video.id)){
                watchLaterIcon = "added-icon.png";
                watchLaterTitle = "Already in Watch Later";
            }
            else{
                watchLaterIcon = "add-icon.png";
                watchLaterTitle = "Add to Watch Later";
            }
        }
        let watchLaterOverlay = `<div class="card__overlay video-wl"><img title="${watchLaterTitle}" src="/resources/icons/${watchLaterIcon}"></div>`;
        let gameElem = `<div class="card__game"><a target="_blank" href="${location.pathname}?type=live&game=${encodeURIComponent(game)}">${game}</a></div>`;
        let titleElem = `<div title="${title}" class="card__title">${title}</div>`;
        let thumbElem = `<a class="ext-player-link" href="${playerUrl}?vid=${id}" target="_blank"><div class="thumb-container"><div class="img-container"><img class="card-thumb" src="" /></div><div class="resume-bar" style="width:${resumeBarWidth}%"></div></div>${viewersElem}${lengthElem}</a>`;
        let timePassedElem = `<div class="card__date">${when} ${nameElem}</div>`;
        let elem = document.createElement("div");
        elem.className = "card card--video";
        elem.innerHTML = `${thumbElem}${titleElem}${gameElem}${timePassedElem}${watchLaterOverlay}`;

        return elem;
    }

    prepareThumb(video, card){
        let imgCont = card.querySelector(".img-container");
        let img = imgCont.querySelector("img");
        let animatedThumbUrl = video["animated_preview_url"];
        let thumb = video.thumbnail_url;
        thumb = thumb.replace("%{width}", "320");
        thumb = thumb.replace("%{height}", "180");
        let thumbUrl;
        if(!thumb){
            thumb = "https://vod-secure.twitch.tv/_404/404_processing_320x240.png";
            imgCont.style.transform = "translateY(-30px)";
        }
        img.src = thumb;
    }

    addCard(video){
        let card = this.createCard(video);
        // card.video = video;
        let wlButton = card.querySelector(".card__overlay.video-wl");
        let wlImg = wlButton.querySelector("img");
        wlButton.addEventListener("click", e=>{
            if(wlImg.src.includes("added-icon")){
                watchLater.remove(video["id"]);
                wlImg.src = "/resources/icons/add-icon.png";

            }
            else if (wlImg.src.includes("add-icon")){
                watchLater.add(video["id"]);
                wlImg.src = "/resources/icons/added-icon.png";
            }
            else{
                watchLater.remove(video["id"]);
                card.remove();
            }
        });
        this.prepareThumb(video, card);
        elements.resultList.appendChild(card);
    }

    addCards(videos){
        this.urlParams = utils.getStrToObj();
        let video;
        for(video of videos){
            this.addCard(video);
        }
    }
}


class ClipCards{

    makeInfoElem(title, val){
        let classPostfix = title.toLowerCase();
        return `<div class="card__info video-${classPostfix}">${title}: ${val}</div>`;
    }

    createCard(video){
        let game = video.game;
        let title = utils.escape(video.title);
        let date = video.created_at;
        let when = utils.twTimeStrToReadable(date);
        let id = video["id"];
        let playerUrl = "player.html";
        let views = video.views.toString();
        if(views.length > 3){
            views = views.substring(0, views.length-3) + "," + views.substring(views.length-3);
        }
        let viewersElem = `<div class="card__overlay video-viewers">${views} views</div>`;
        let lengthElem = `<div class="card__overlay video-length">${length}</div>`;

        let thumbUrl = video.thumb;


        let gameElem = `<div class="card__game"><a target="_blank" href="${location.pathname}?type=live&game=${encodeURIComponent(game)}">${game}</a></div>`;
        let titleElem = `<div title="${title}" class="card__title">${title}</div>`;
        let thumbElem = `<a class="ext-player-link" href="${playerUrl}?cid=${id}" target="_blank"><div class="thumb-container"><div class="img-container"><img class="card-thumb" src="${thumbUrl}" /></div></div>${viewersElem}</a>`;
        let timePassedElem = `<div class="card__date">${when}</div>`;
        let elem = document.createElement("div");
        elem.className = "card card--video";
        elem.innerHTML = `${thumbElem}${titleElem}${gameElem}${timePassedElem}`;

        return elem;
    }

    addCard(video){
        let card = this.createCard(video);
        // card.video = video;
        elements.resultList.appendChild(card);
    }

    addCards(videos){
        this.urlParams = utils.getStrToObj();
        let video;
        for(video of videos){
            this.addCard(video);
        }
    }
}


class StreamCards{
    constructor(){
    }

    makeThumbTimeParam(){
        let d = new Date();
        this.thumbTimeParam = "" + d.getYear() + d.getMonth() + d.getDate() + d.getHours() + (Math.floor(d.getMinutes() / 5));
    }

    setImgSize(img, width, height){
        return img.replace("{width}x{height}", `${width}x${height}`);
    }


    createCard(stream){
        let uptime = utils.twTimeStrToTimePassed(stream.started_at);
        let game = "";
        let logoElem = "";
        let gameElem = "";
        if(stream.game){
            game = stream.game.name;
            let gameArtUrl = this.setImgSize(stream.game.box_art_url, 50, 60);
            logoElem = `<div class="card__logo"><img src="${gameArtUrl}" alt="" /></div>`;
            gameElem = `<div class="card__game"><a target="_blank" href="${location.pathname}?perPage=30&page=1&type=live&game=${encodeURIComponent(game)}&game_ids=${stream.game.id}">${game}</a></div>`;
        }

        let thumb = stream.thumbnail_url;
        thumb = thumb.replace("{width}", "320");
        thumb = thumb.replace("{height}", "180");
        let title = utils.escape(stream["title"]);
        let viewers = stream["viewer_count"].toString();
        if(viewers.length > 3){
            viewers = viewers.substring(0, viewers.length-3) + "," + viewers.substring(viewers.length-3);
        }
        let channel = stream["user_name"];
        let playerUrl = `player.html?channel=${channel}&channelID=${stream["id"]}`;
        let lengthElem = `<div class="card__overlay video-length">${uptime}</div>`;
        let viewersElem = `<div class="card__overlay video-viewers">${viewers} viewers</div>`;
        let titleElem = `<div title="${title}" class="card__title">${title}</div>`;
        let thumbElem = `<a class="ext-player-link" href="${playerUrl}" target="_blank"><div class="thumb-container"><div class="img-container"><img class="card-thumb" src="${thumb}?time=${this.thumbTimeParam}" /></div></div>${viewersElem}${lengthElem}</a>`;
        let nameElem = `<div class="card__name"><a target="_blank" href="${location.pathname}?perPage=30&page=1&type=archive&channel=${channel}">${channel}</a></div>`;
        let elem = document.createElement("div");
        elem.className = "card card--stream";
        elem.innerHTML = `${thumbElem}${logoElem}${titleElem}${nameElem}${gameElem}`;

        return elem;
    }

    addCard(obj){
        let card = this.createCard(obj);
        elements.resultList.appendChild(card);
    }

    addCards(mediaObjects){
        this.makeThumbTimeParam();
        let obj;
        for(obj of mediaObjects){
            this.addCard(obj);
        }
    }
}

class GameCards{
    constructor(){
    }

    makeThumbTimeParam(){
        let d = new Date();
        this.thumbTimeParam = "" + d.getYear() + d.getMonth() + d.getDate() + d.getHours() + (Math.floor(d.getMinutes() / 5));
    }


    createCard(game){
        let title = utils.escape(game.name);
        let thumb = game.box_art_url;
        thumb = thumb.replace("{width}x{height}", "285x380");
        let listUrl = `list.html?type=live&game_ids=${game.id}`;
        let titleElem = `<div title="${title}" class="card__title">${title}</div>`;
        let thumbElem = `<a class="ext-player-link" href="${listUrl}" target="_blank"><div class="thumb-container"><div class="img-container"><img class="card-thumb" src="${thumb}?time=${this.thumbTimeParam}" /></div></div></a>`;
        let elem = document.createElement("div");
        elem.className = "card card--game";
        elem.innerHTML = `${thumbElem}${titleElem}`;

        return elem;
    }

    addCard(obj){
        let card = this.createCard(obj);
        elements.resultList.appendChild(card);
    }

    addCards(mediaObjects){
        this.makeThumbTimeParam();
        let obj;
        for(obj of mediaObjects){
            this.addCard(obj);
        }
    }
}



export {GameCards, VideoCards, StreamCards,ClipCards};
