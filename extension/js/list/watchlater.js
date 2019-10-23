import {elements} from './elements.js';
import {settings} from '../settings.js';
import {Pagination} from '../utils/pagination.js';
import {utils} from '../utils/utils.js';


class WatchLater{
    constructor(){
        this.ready = this.get();
    }

    get(){
        return utils.storage.getItem("watchlater").then(wl=>{
            this.videos = wl;
            return wl;
        });
    }

    set(){
        utils.storage.setItem("watchlater", this.videos);
    }

    contains(id){
        return this.videos.indexOf(id)>=0;
    }

    add(id){
        this.get().then(wl=>{
            if(this.videos.indexOf(id)<0){
                this.videos.unshift(id);
                this.set();
            }
        });
    }

    remove(id){
        this.get().then(wl=>{
            let index = this.videos.indexOf(id);
            if(index >= 0){
                this.videos.splice(index, 1);
                this.set();
            }
        });
    }
}


export {WatchLater};
