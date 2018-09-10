import {VideosGetter, LiveStreamsGetter} from './getter.js';
import {elements} from './elements.js';
import {settings} from '../settings.js';
import {utils} from '../utils/utils.js';



class Videos{
    constructor(params){
        this.getter = new VideosGetter(params.channel, params.perPage, params.page, params.type);
        this.resumePositions = utils.storage.getItem("resumePositions");
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
        let game = video.game;
        let title = video.title;
        let url = video.url;
        let date = video.recorded_at;
        let when = utils.twTimeStrToReadable(date);
        let id = video["_id"].substr(1);
        let resumePos = this.resumePositions[id] || 0;
        let resumeBarWidth = (resumePos / video.length) * 100;
        let playerUrl = "player.html";
        let popoutElem = `<a href="${url}" target="_blank">watch on twitch.tv</a>`;
        let lengthElem = `<div class="video-card__overlay video-length">${length}</div>`;
        let gameElem = this.makeInfoElem("Game", game);
        let titleElem = `<div title="${title}" class="video-card__title">${title}</div>`;
        let thumbElem = `<a class="ext-player-link" href="${playerUrl}?vid=${id}" target="_blank"><div class="thumb-container"><div class="img-container"><img class="video-card-thumb" src="" /></div><div class="resume-bar" style="width:${resumeBarWidth}%"></div></div>${lengthElem}</a>`;
        let timePassedElem = `<div class="video-card__date">${when} ${popoutElem}</div>`;
        let elem = document.createElement("div");
        elem.className = "video-card";
        elem.innerHTML = `${thumbElem}${titleElem}${gameElem}${timePassedElem}`;

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
    constructor(params){
        this.getter = new LiveStreamsGetter(params.perPage, params.page, params.game);
    }

    load(pageNr){
        if(pageNr){
            this.getter.page = pageNr;
        }
        return this.getter.get().then(streams=>{
            if(streams && streams.length){
                this.currentStreamsData = streams;
                this.processStreams(streams);
                return true;
            }
            else{
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
        let title = stream["channel"]["status"];
        let url = stream["channel"]["url"];
        let viewers = stream["viewers"].toString();
        if(viewers.length > 3){
            viewers = viewers.substring(0, viewers.length-3) + "," + viewers.substring(viewers.length-3);
        }
        let channel = stream["channel"]["name"];
        let displayName = stream["channel"]["display_name"];
        let logoUrl = stream["channel"]["logo"];
        let playerUrl = settings.altPlayerExtId && settings.altPlayerExtId.length ? `chrome-extension://${settings.altPlayerExtId}/player.html?channel=${channel}` : url;
        let logoElem = `<div class="video-card__logo"><img src="${logoUrl}"></div>`;
        let lengthElem = `<div class="video-card__overlay video-length">${uptime}</div>`;
        let viewersElem = `<div class="video-card__overlay video-viewers">${viewers} viewers</div>`;
        let gameElem = `<div class="video-card__game"><a target="_blank" href="${location.pathname}?perPage=30&page=1&type=live&game=${encodeURI(game)}">${game}</a></div>`;
        let titleElem = `<div title="${title}" class="video-card__title">${title}</div>`;
        let thumbElem = `<a class="ext-player-link" href="${playerUrl}" target="_blank"><div class="thumb-container"><div class="img-container"><img class="video-card-thumb" src="${thumb}" /></div></div>${viewersElem}${lengthElem}</a>`;
        let nameElem = `<div class="video-card__name"><a target="_blank" href="${location.pathname}?perPage=30&page=1&type=archive&channel=${displayName}">${displayName}</a></div>`;
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
