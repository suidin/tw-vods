import {elements} from './elements.js';
import {settings} from '../settings.js';
import {Pagination} from '../utils/pagination.js';
import {utils} from '../utils/utils.js';


class WatchLater{
    constructor(){
    }

    get(){
        return utils.storage.getItem("watchlater");
    }

    set(videos){
        utils.storage.setItem("watchlater", videos);
    }

    contains(videos, video){
        for(let i in videos){
            if(videos[i]._id === video._id){
                return i;
            }
        }
        return -1;
    }

    add(video){
        let videos = this.get();
        if(this.contains(videos, video)<0){
            videos.unshift(video);
            this.set(videos);
        }
    }

    remove(video){
        let videos = this.get();
        let index = this.contains(videos, video);
        if(index >= 0){
            videos.splice(index, 1);
            this.set(videos);
        }
    }
}


export {WatchLater};
