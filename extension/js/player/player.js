import {Video, Live} from '../video/video.js';
import {settings} from '../settings.js';
import {utils} from '../utils/utils.js';


class DummyPlayer{
    constructor(){
        this.cachedTime = 0;
        this.paused = true;
    }

    start(vId){
        this.video = new Video(vId);
        return this.video.loaded.then(() => {
            utils.storage.getResumePoint(vId).then(secs=>{
                this.seek(secs);
                this.play();
            });
        });
    }

    play(){
        this.dateResumed = new Date();
        this.paused = false;
        this.onplay && this.onplay();
    }

    timePassed(){
        return (new Date() - this.dateResumed) / 1000;
    }

    pause(){
        this.cachedTime = this.getCurrentTime();
        this.paused = true;
        this.onpause && this.onpause();
    }

    getCurrentTime(){
        if(this.paused){
            return this.cachedTime;
        }
        else{
            return this.cachedTime + this.timePassed();
        }
    }

    getDuration(){
        return this.video.lengthInSecs;
    }

    seek(secs){
        let dur = this.getDuration();
        if(secs > dur){
            secs = dur;
        }
        else if(secs < 0){
            secs = 0;
        }
        this.timeBeforeSeek = this.getCurrentTime();
        this.cachedTime = secs;
        if(!this.paused){
            this.dateResumed  = new Date();
        }
        this.onseeking && this.onseeking();
    }
}

function getPlayer(vElem){
    if(settings.mode === "video"){
        vElem.start = (vId, time)=>{
            vElem.video = new Video(vId);
            return vElem.video.startStream().then(() => {
                vElem.volume = vElem.video.config.volume;
            });
        };
        vElem.seek = (secs)=>{
            vElem.timeBeforeSeek = vElem.currentTime;
            vElem.currentTime = secs;
        };
        vElem.getDuration = ()=>{
            return vElem.duration;
        };
        vElem.getCurrentTime = ()=>{
            return vElem.currentTime;
        };
    }
    else if(settings.mode === "live"){
        vElem.start = (channel)=>{
            vElem.video = new Live(channel);
            return vElem.video.startStream().then(() => {
                vElem.volume = vElem.video.config.volume;
            });
        };
        vElem.seek = (secs)=>{
            // vElem.timeBeforeSeek = vElem.currentTime;
            vElem.currentTime = secs + vElem.video.stream.hls.streamController.mediaBuffer.buffered.start(0);
        };
        vElem.getDuration = ()=>{
            return vElem.duration - vElem.video.stream.hls.streamController.mediaBuffer.buffered.start(0);
        };
        vElem.getCurrentTime = ()=>{
            return vElem.currentTime - vElem.video.stream.hls.streamController.mediaBuffer.buffered.start(0);
        };
    }
    return vElem;
}

export {getPlayer, DummyPlayer};


