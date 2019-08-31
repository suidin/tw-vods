import {utils} from '../utils/utils.js';
import {v5Api} from '../api/v5.js';




class VideosGetter{
    constructor(channel, perPage=10, page=1, type="archive", sort="time"){
        this.channel = channel;
        this.type = type;
        this.sort = sort;
        this.perPage = perPage;
        this.page = page;
        this.hasNextPage = true;
        this.fetching = false;
    }

    get(callback){
        this.fetching = true;
        if (this.page > this.lastPage){
            this.page = this.lastPage;
        }
        return utils.getUid(this.channel).then(uid=>{
            return v5Api.videos(uid, this.type, this.perPage, this.sort, this.currentOffset());
        }).then(json=>{
            if(!json){return;}
            this.total = json["_total"];
            this.lastPage = Math.ceil(this.total/this.perPage);
            this.fetching = false;
            return json.videos;

        });
    }

    currentOffset(){
        return this.offsetFromPage(this.page);
    }

    offsetFromPage(page){
        return this.perPage * (page - 1)
    }
}

class LiveStreamsGetter{
    constructor(perPage=25, page=1, game="", language="en"){
        this.type = "live";
        this.perPage = perPage;
        this.page = page;
        this.game = encodeURIComponent(game);
        this.language = language;
        this.fetching = false;
    }

    get(callback){
        this.fetching = true;
        if (this.page > this.lastPage){
            this.page = this.lastPage;
        }
        let promise = v5Api.streams(this.perPage, this.currentOffset(), this.language, this.game);
        return promise.then(json=>{
            if(!json){return;}
            this.total = json["_total"];
            this.lastPage = Math.ceil(this.total/this.perPage);
            this.fetching = false;
            return json.streams;

        });
    }

    currentOffset(){
        return this.offsetFromPage(this.page);
    }

    offsetFromPage(page){
        return this.perPage * (page - 1)
    }
}


export {VideosGetter, LiveStreamsGetter};
