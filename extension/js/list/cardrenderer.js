import {VideosGetter, LiveStreamsGetter} from './getter.js';
import {WatchLater} from './watchlater.js';
import {elements} from './elements.js';
import {settings} from '../settings.js';
import {utils} from '../utils/utils.js';


const watchLater = new WatchLater();

class Videos{
    constructor(params, wl=false){
        this.ready = utils.storage.getItem("resumePositions").then(rp=>{
            this.resumePositions = rp;
            if(wl){
                this.loadWatchLater();
            }
        });
    }

    loadWatchLater(){
        this.drawingWatchLaterList = true;
        watchLater.get().then(videos=>{
            this.processVideos(videos);
            this.drawingWatchLaterList = false;
        });
    }

    load(pageNr){
        return this.ready.then(()=>{
            if(pageNr){
                this.getter.page = pageNr;
            }
            return this.getter.get().then(videos=>{
                if(videos && videos.length){
                    this.currentVideoData = videos;
                    this.processVideos(videos);
                    return videos[0].channel.display_name;
                }
                else{
                    return false;
                }
            });
        });
    }

    processVideos(videos){
        utils.log(videos[0]);
        this.addVideos(videos);
    }

    makeInfoElem(title, val){
        let classPostfix = title.toLowerCase();
        return `<div class="video-card__info video-${classPostfix}">${title}: ${val}</div>`;
    }

    createCard(video){
        let length = video.duration;
        let secs = utils.HMSToSecs(length);
        let game = "";
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
        let viewersElem = `<div class="video-card__overlay video-viewers">${views} views</div>`;
        let nameElem = this.drawingWatchLaterList ? `<a target="_blank" href="${location.pathname}?perPage=30&page=1&type=archive&channel=${displayName}">${displayName}</a>`: "";
        let lengthElem = `<div class="video-card__overlay video-length">${length}</div>`;
        let watchLaterIcon;
        let watchLaterTitle;
        if(this.drawingWatchLaterList){
            watchLaterIcon = "remove-icon.png";
            watchLaterTitle = "Remove from Watch Later";
        }
        else{
            if(watchLater.contains(video)>=0){
                watchLaterIcon = "added-icon.png";
                watchLaterTitle = "Already in Watch Later";
            }
            else{
                watchLaterIcon = "add-icon.png";
                watchLaterTitle = "Add to Watch Later";
            }
        }
        let watchLaterOverlay = `<div class="video-card__overlay video-wl"><img title="${watchLaterTitle}" src="/resources/icons/${watchLaterIcon}"></div>`;
        let gameElem = `<div class="video-card__game"><a target="_blank" href="${location.pathname}?perPage=30&page=1&type=live&game=${encodeURIComponent(game)}">${game}</a></div>`;
        let titleElem = `<div title="${title}" class="video-card__title">${title}</div>`;
        let thumbElem = `<a class="ext-player-link" href="${playerUrl}?vid=${id}" target="_blank"><div class="thumb-container"><div class="img-container"><img class="video-card-thumb" src="" /></div><div class="resume-bar" style="width:${resumeBarWidth}%"></div></div>${viewersElem}${lengthElem}</a>`;
        let timePassedElem = `<div class="video-card__date">${when} ${nameElem}</div>`;
        let elem = document.createElement("div");
        elem.className = "video-card";
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
        let wl = this.drawingWatchLaterList;
        let wlButton = card.querySelector(".video-card__overlay.video-wl");
        wlButton.addEventListener("click", e=>{
            if(wl){
                watchLater.remove(video);
                card.remove();
            }
            else{
                watchLater.add(video);
                wlButton.querySelector("img").src = "/resources/icons/added-icon.png";
            }
        });
        this.prepareThumb(video, card);
        elements.resultList.appendChild(card);
    }

    addCards(videos){
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


    createCard(stream){
        let uptime = utils.twTimeStrToTimePassed(stream.started_at);
        let game = "";
        let thumb = stream.thumbnail_url;
        thumb = thumb.replace("{width}", "320");
        thumb = thumb.replace("{height}", "180");
        let title = utils.escape(stream["title"]);
        let viewers = stream["viewer_count"].toString();
        if(viewers.length > 3){
            viewers = viewers.substring(0, viewers.length-3) + "," + viewers.substring(viewers.length-3);
        }
        let channel = stream["user_name"];
        let logoElem = "";
        let playerUrl = `player.html?channel=${channel}&channelID=${stream["id"]}`;
        let lengthElem = `<div class="video-card__overlay video-length">${uptime}</div>`;
        let viewersElem = `<div class="video-card__overlay video-viewers">${viewers} viewers</div>`;
        let gameElem = `<div class="video-card__game"><a target="_blank" href="${location.pathname}?perPage=30&page=1&type=live&game=${encodeURIComponent(game)}">${game}</a></div>`;
        let titleElem = `<div title="${title}" class="video-card__title">${title}</div>`;
        let thumbElem = `<a class="ext-player-link" href="${playerUrl}" target="_blank"><div class="thumb-container"><div class="img-container"><img class="video-card-thumb" src="${thumb}?time=${this.thumbTimeParam}" /></div></div>${viewersElem}${lengthElem}</a>`;
        let nameElem = `<div class="video-card__name"><a target="_blank" href="${location.pathname}?perPage=30&page=1&type=archive&channel=${channel}">${channel}</a></div>`;
        let elem = document.createElement("div");
        elem.className = "video-card";
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


export {Videos, StreamCards};
