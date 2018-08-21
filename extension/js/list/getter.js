import {utils} from '../utils/utils.js';

class Api{
    constructor(){
    }

    fetchVideos(channel, type="archive", limit=30, sort="time", offset=0){

        let url = `https://api.twitch.tv/kraken/channels/${channel}/videos?limit=${limit}&broadcast_type=${type}&offset=${offset}&sort=${sort}`

        return utils.getRequestPromise(url, {then:"json", headers:{}});
    }
}

class VideosGetter{
    constructor(channel, limit=10, offset=0, type="archive", sort="time"){
        this.api = new Api();
        this.channel = channel;
        this.type = type;
        this.limit = limit;
        this.sort = sort;
        this.initialOffset = offset;
        this.offset = offset;
        this.hasNextPage = true;
        this.fetching = false;
    }

    getNext(callback){
        this.fetching = true;
        if (this.hasNextPage === false){
            utils.log("no next page");
            return
        }
        let promise = this.api.fetchVideos(this.channel, this.type, this.limit, this.sort, this.offset);
        return promise.then(json=>{
            if(!json){return;}
            this.total = json["_total"];
            this.offset = this.offset + this.limit;
            this.hasNextPage = this.offset < (this.total-1);
            this.fetching = false;
            return json.videos;

        });
    }
}

export {VideosGetter};
