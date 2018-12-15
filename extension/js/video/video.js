import {settings} from '../settings.js';
import {utils} from '../utils/utils.js';


class VideoConnector{
    constructor(vid){
        this.vid = vid;
    }

    getAuth(mode){
        let url = `https://api.twitch.tv/api/${mode}/${this.vid}/access_token.json?as3=t&adblock=false&need_https=true&platform=web&player_type=site`;
        return utils.getRequestPromise(url);
    }

    getManifestUrl(){
        let mode;
        if(settings.mode==="video"){
            mode = "vod";
        }
        else{
            mode = "channel";
        }
        return this.getAuth(mode+"s").then(map => {
            let sig = map.get("sig");
            let token = map.get("token");
            let p = parseInt(Math.random() * 999999);
            let url;
            if(mode === "channel"){
                url = `https://usher.ttvnw.net/api/${mode}/hls/${this.vid.toLowerCase()}.m3u8?player=twitchweb&p=${p}&type=any&allow_source=true&allow_audio_only=true&allow_spectre=false&nauthsig=${sig}&nauth=${token}`;
            }
            else{
                url = `https://usher.ttvnw.net/${mode}/${this.vid}?player=twitchweb&p=${p}&type=any&allow_source=true&allow_audio_only=true&allow_spectre=false&nauthsig=${sig}&nauth=${token}`;
            }
            return url;
        });
    }

    getVideoPlaylist(manifestUrl){
        return utils.getRequestPromise(manifestUrl, "");
    }

    getVideoData(){
        let url = `https://api.twitch.tv/kraken/videos/${this.vid}`;
        return utils.getRequestPromise(url);
    }

    // getStreamData(){
    //     let url = `https://api.twitch.tv/kraken/streams/${this.vid}`;
    //     return 
    // }

    getStreamManifest(){
        return getManifestUrl.then(url=>{
            return this.getVideoPlaylist(url);
        }).then(response =>{
            return response.text();
        });
    }
};

class Stream{
    constructor(manifestUrl, config){
        this.config = config;
        this.manifestUrl = manifestUrl;
        let hlsConfig = settings.hlsConfig;
        hlsConfig.startLevel = config.startLevel;
        if(settings.mode === "video"){
            hlsConfig.startPosition = config.startPosition;
        }
        this.hls = new Hls(hlsConfig);
    }

    loadHls(resolver,cb){
        let hls = this.hls;
        let videoElem = document.querySelector("video");
        hls.attachMedia(videoElem);
        hls.on(Hls.Events.MEDIA_ATTACHED,() => {
          utils.log("video and hls.js are now bound together !");
          hls.loadSource(this.manifestUrl);
          hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            utils.log("manifest loaded, found " + data.levels.length + " quality level");
            hls.nextLevel = this.config.startLevel;
            cb && cb();
            resolver();
          });
        });
    }

    onbufferappended(fn){
        this.hls.on(Hls.Events.FRAG_BUFFERED, (event, data) =>{
            fn(data.frag.endPTS);
        });
    }

    onlevelchange(fn){
        this.hls.on(Hls.Events.LEVEL_SWITCHED, (e, data)=>{
            fn(data.level);
        });
    }
}

class Video{
    constructor(vid){
        this.vid = vid;
        this.connector = new VideoConnector(vid);
        this.loaded = this.loadData();
        this.loaded = this.loaded.then(()=>{
            this.makeConfig();
        });
    }

    startStream(){
        return this.connector.getManifestUrl().then(url => {
            return this.loaded.then(()=>{
                this.stream = new Stream(url, this.config);
                return new Promise(resolve=>{
                    this.stream.loadHls(resolve);
                });
            });
        });
    }

    loadData(){
        return this.connector.getVideoData().then(data=>{
            this.mutedSegments = data.get("muted_segments");
            this.lengthInSecs = data.get("length");
            this.lengthInHMS = utils.secsToHMS(this.lengthInSecs);
            this.channel = data.get("channel").name;
            this.channelDisplay = data.get("channel").display_name;
            this.channelId = data.get("channel")._id;
            this.videoStatus = data.get("status");
            if(this.videoStatus === "recorded"){
                this.loadHoverThumbsInfo(data.get("seek_previews_url"));
            }
            this.videoTitle = data.get("title");
            this.resolutions = Object.keys(data.get("resolutions"));
            utils.log("channel: ", this.channel);
        });
    }

    loadHoverThumbsInfo(infoUrl){
        if(!infoUrl){
            return
        }
        let promise = utils.getRequestPromise(infoUrl, {then:"json", headers:{}}).then(json=>{
            if(!json){return false;}
            let q
            for(q of json){
                if(q.quality === "high"){
                    break;
                }
            }
            let urlTemplate = infoUrl.split("/");
            urlTemplate.pop();
            q.urlTemplate = urlTemplate.join("/") + "/";
            return q;
        });
        this.hoverThumbsInfoLoaded = promise;
    }

    makeConfig(){
        let config = {};
        let lastSetQuality = utils.storage.getLastSetQuality();
        config.startLevel = this.getClosestQuality(lastSetQuality);
        let GETTime = parseInt(utils.findGetParameter("time"));
        let startPosition = GETTime || utils.storage.getResumePoint(this.vid) || 0;
        config.startPosition = startPosition;
        let volume = utils.storage.getLastSetVolume() || 0.5;
        config.volume = volume;

        this.config = config;
    }
    
    getClosestQuality(desired){
        if(desired === "Auto"){
            return -1;
        }
        let qualityToNumber = (str)=>{
            if(str === "chunked"){return 10000;}
            let [res, fps] = str.split("p");
            return parseInt(res)*parseInt(fps)/30;
        }
        let q, i, n;
        let dNum = qualityToNumber(desired);
        let resos = this.resolutions;
        let nums = resos.map(qualityToNumber);
        for(i in resos){
            q = resos[i];
            n = nums[i];
            if(q === desired){return i;}
            if(n > dNum){
                if(i===0){
                    return 0;
                }
                else{
                    return i-1;
                }
            }
        }
        return i;
    }
}


class Live{
    constructor(vid){
        this.vid = vid;
        this.connector = new VideoConnector(vid);
        this.makeConfig();
    }

    startStream(){
        return this.connector.getManifestUrl().then(url => {
            this.stream = new Stream(url, this.config);
            return new Promise(resolve=>{
                this.stream.loadHls(resolve, ()=>{
                    let lvl = this.getClosestQuality(utils.storage.getLastSetQuality());
                    lvl = parseInt(lvl);
                    this.stream.hls.nextLevel = lvl;
                });
            });
        });
    }

    loadData(){
    }

    makeConfig(){
        let config = {};
        config.startLevel = 0;
        let volume = utils.storage.getLastSetVolume() || 0.5;
        config.volume = volume;

        this.config = config;
    }
    
    getClosestQuality(desired){
        if(desired === "Auto"){
            return -1;
        }
        let qualityToNumber = (str)=>{
            if(str === "chunked"){return 10000;}
            let [res, fps] = str.split("p");
            return parseInt(res)*parseInt(fps)/30;
        }
        let q, i, n;
        let dNum = qualityToNumber(desired);
        let resos = this.stream.hls.levels.map(l=>l.attrs.VIDEO);
        let nums = resos.map(qualityToNumber);
        for(i in resos){
            q = resos[i];
            n = nums[i];
            if(q === desired){return i;}
            if(n > dNum){
                if(i===0){
                    return 0;
                }
                else{
                    return i-1;
                }
            }
        }
        return i;
    }
}

export {Video, Live, VideoConnector};
