import {Video} from '../video/video.js';
import {settings} from '../settings.js';
import {utils} from '../utils/utils.js';





function getPlayer(vElem){
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
    return vElem;
}

export {getPlayer};


