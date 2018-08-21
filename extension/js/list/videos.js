import {VideosGetter} from './getter.js';
import {elements} from './elements.js';
import {utils} from '../utils/utils.js';



class Videos{
    constructor(channel, params){
        this.channel = channel;
        this.getter = new VideosGetter(channel, params.limit, params.offset, params.type);
        this.resumePositions = utils.storage.getItem("resumePositions");
    }

    load(){
        return this.getter.getNext().then(videos=>{
            if(videos && videos.length){
                this.processVideos(videos);
                return true;
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


export {Videos};
