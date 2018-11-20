import {VideosGetter, LiveStreamsGetter} from './getter.js';
import {WatchLater} from './watchlater.js';
import {elements} from './elements.js';
import {settings} from '../settings.js';
import {utils} from '../utils/utils.js';


const watchLater = new WatchLater();

class Videos{
    constructor(params, wl=false){
        this.resumePositions = utils.storage.getItem("resumePositions");
        if(wl){
            this.loadWatchLater();
        }
        else{
            this.getter = new VideosGetter(params.channel, params.perPage, params.page, params.type);
        }
    }

    loadWatchLater(){
        this.drawingWatchLaterList = true;
        this.processVideos(watchLater.get());
        this.drawingWatchLaterList = false;
    }

    load(pageNr){
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
    }

    processVideos(videos){
        utils.log(videos[0]);
        this.addVideos(videos);
    }

    makeInfoElem(title, val){
        let classPostfix = title.toLowerCase();
        return `<div class="video-card__info video-${classPostfix}">${title}: ${val}</div>`;
    }

    createVideoCard(video){
        let length = utils.secsToReadable(video.length);
        if(this.drawingWatchLaterList && video.status === "recording"){
            length = ">"+length;
        }
        let game = video.game;
        let title = utils.escape(video.title);
        let url = video.url;
        let date = video.recorded_at;
        let when = utils.twTimeStrToReadable(date);
        let id = video["_id"].substr(1);
        let resumePos = this.resumePositions[id] || 0;
        let resumeBarWidth = (resumePos / video.length) * 100;
        let playerUrl = "player.html";
        let displayName = video.channel.display_name;
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
        let gameElem = this.makeInfoElem("Game", game);
        let titleElem = `<div title="${title}" class="video-card__title">${title}</div>`;
        let thumbElem = `<a class="ext-player-link" href="${url}?vid=${id}" target="_blank"><div class="thumb-container"><div class="img-container"><img class="video-card-thumb" src="" /></div><div class="resume-bar" style="width:${resumeBarWidth}%"></div></div>${lengthElem}</a>`;
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
        let thumb = video.thumbnails[0];
        let thumbUrl;
        if(thumb && thumb.url){
            thumbUrl = thumb.url;
        }
        else{
            thumbUrl = "https://vod-secure.twitch.tv/_404/404_processing_320x240.png";
        }
        if(video.status === "recorded"){
            function imgLoaded(imgElement) {
              return imgElement.complete && imgElement.naturalHeight !== 0;
            }
            function switchSrc(){
                img.onerror = undefined;
                img.onload = undefined;
                img.src = thumbUrl;
                imgCont.style.transform = "translateY(-30px)";
            }

            img.onload = e=>{
                if(!imgLoaded(img)){
                    switchSrc();
                }
                else{
                    imgCont.classList.add("can-animate");
                    imgCont.addEventListener("mouseenter", e=>{
                        imgCont.classList.add("animated");
                    });
                    imgCont.addEventListener("mouseleave", e=>{
                        imgCont.classList.remove("animated");
                    });
                }
            };
            img.onerror = e=>{
                switchSrc();
            }
            img.src = animatedThumbUrl;
        }
        else{
            img.src = thumbUrl;
            imgCont.style.transform = "translateY(-30px)";
        }
    }

    addVideo(video){
        let card = this.createVideoCard(video);
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

    addVideos(videos){
        let video;
        for(video of videos){
            this.addVideo(video);
        }
    }
}


class Streams{
    constructor(params, nonlisted=false){
        if(nonlisted){
            this.nonlisted = true;
            this.loadnonlisted();
        }
        else{
            this.getter = new LiveStreamsGetter(params.perPage, params.page, params.game);
        }

    }

    loadnonlisted(){
        this.getter = new LiveStreamsGetter(100, 1, "", "en");
        let tryPages = 50;
        let delay = 5000;
        let fn = p=>{
            if(p<=tryPages && !this.noresults){
                this.load(p);
                setTimeout(()=>{
                    fn(p+1);
                }, delay);
            }
        };
        fn(1);
    }

    load(pageNr){
        if(pageNr){
            this.getter.page = pageNr;
        }
        return this.getter.get().then(streams=>{
            if(streams && streams.length){
                let s = [];
                if(this.nonlisted){
                    let i;
                    for(i of streams){
                        if(!i.game){
                            s.push(i);
                        }
                    }
                    streams = s;
                    if(!streams.length){
                        return false;
                    }
                }

                this.currentStreamsData = streams;
                this.processStreams(streams);
                return true;
            }
            else{
                this.noresults = true;
                return false;
            }
        });
    }

    processStreams(streams){
        utils.log(streams[0]);
        this.addStreams(streams);
    }

    createStreamCard(stream){
        let uptime = utils.twTimeStrToTimePassed(stream.created_at);
        let game = stream.game;
        let thumb = stream.preview["medium"];
        let title = utils.escape(stream["channel"]["status"]);
        let url = stream["channel"]["url"];
        let viewers = stream["viewers"].toString();
        if(viewers.length > 3){
            viewers = viewers.substring(0, viewers.length-3) + "," + viewers.substring(viewers.length-3);
        }
        let channel = stream["channel"]["name"];
        let displayName = stream["channel"]["display_name"];
        let logoUrl = stream["channel"]["logo"];
        logoUrl = logoUrl.replace("300x300", "50x50");
        let playerUrl = `player.html?channel=${channel}&channelID=${stream["channel"]["_id"]}`;
        let logoElem = `<div class="video-card__logo"><img src="${logoUrl}"></div>`;
        let lengthElem = `<div class="video-card__overlay video-length">${uptime}</div>`;
        let viewersElem = `<div class="video-card__overlay video-viewers">${viewers} viewers</div>`;
        let gameElem = `<div class="video-card__game"><a target="_blank" href="${location.pathname}?perPage=30&page=1&type=live&game=${encodeURIComponent(game)}">${game}</a></div>`;
        let titleElem = `<div title="${title}" class="video-card__title">${title}</div>`;
        let thumbElem = `<a class="ext-player-link" href="${playerUrl}" target="_blank"><div class="thumb-container"><div class="img-container"><img class="video-card-thumb" src="${thumb}" /></div></div>${viewersElem}${lengthElem}</a>`;
        let nameElem = `<div class="video-card__name"><a target="_blank" href="${location.pathname}?perPage=30&page=1&type=archive&channel=${channel}">${displayName}</a></div>`;
        let elem = document.createElement("div");
        elem.className = "video-card";
        elem.innerHTML = `${thumbElem}${logoElem}${titleElem}${nameElem}${gameElem}`;

        return elem;
    }

    addStream(stream){
        let card = this.createStreamCard(stream);
        elements.resultList.appendChild(card);
    }

    addStreams(streams){
        let stream;
        for(stream of streams){
            this.addStream(stream);
        }
    }
}


export {Videos, Streams};
