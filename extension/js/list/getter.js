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
    constructor(channel, perPage=10, page=1, type="archive", sort="time"){
        this.api = new Api();
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
            utils.log("page out of range");
            return
        }
        let promise = this.api.fetchVideos(this.channel, this.type, this.perPage, this.sort, this.currentOffset());
        return promise.then(json=>{
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

export {VideosGetter};
