import {Video, Live} from '../video/video.js';
import {settings} from '../settings.js';
import {utils} from '../utils/utils.js';




function getPlayer(vElem){
    if(settings.mode === "video"){
        vElem.start = (vId, time)=>{
            vElem.video = new Video(vId);
            return vElem.video.startStream().then(() => {
                vElem.volume = vElem.video.config.volume;
            });
        }
        vElem.seek = (secs)=>{
            vElem.timeBeforeSeek = vElem.currentTime;
            vElem.currentTime = secs;
        }
    }
    else if(settings.mode === "live"){
        vElem.start = (channel)=>{
            vElem.video = new Live(channel);
            return vElem.video.startStream().then(() => {
                vElem.volume = vElem.video.config.volume;
            });
        }
    }
    return vElem;
}

export {getPlayer};


