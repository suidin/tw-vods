import {elements} from './elements.js';
import {settings} from '../settings.js';
import {Pagination} from '../utils/pagination.js';
import {utils} from '../utils/utils.js';


class WatchLater{
    constructor(){
        this.ready = this.get().then(wl=>{
            this.videos = wl;
            return wl;
        });
    }

    get(){
        return utils.storage.getItem("watchlater");
    }

    set(){
        utils.storage.setItem("watchlater", this.videos);
    }

    contains(video){
        for(let i in this.videos){
            if(this.videos[i]._id === video._id){
                return i;
            }
        }
        return -1;
    }

    add(video){
        this.get().then(wl=>{
            this.videos = wl;
            if(this.contains(video)<0){
                delete video._links;
                delete video.fps;
                delete video.resolutions;
                delete video.preview;
                video.thumbnails = [video.thumbnails[0]];
                this.videos.unshift(video);
                this.set();
            }
        });
    }

    remove(video){
        this.get().then(wl=>{
            this.videos = wl;
            let index = this.contains(video);
            if(index >= 0){
                this.videos.splice(index, 1);
                this.set();
            }
        });
    }
}


export {WatchLater};
