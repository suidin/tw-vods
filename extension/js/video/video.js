import {settings} from '../settings.js';
import {utils} from '../utils/utils.js';
import {v5Api} from '../api/v5.js';
import {undocApi} from '../api/undoc.js';


class Stream{
    constructor(manifestUrl, config){
        this.config = config;
        this.manifestUrl = manifestUrl;
        let hlsConfig = settings.hlsConfig;
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
            this.getClosestLevel(data.levels).then(nextLevel=>{
                hls.nextLevel = nextLevel;
                cb && cb();
                resolver();
            });
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

    getClosestLevel(levels){
        return utils.storage.getLastSetQuality().then(last=>{
            if(last === "Auto"){
                return -1;
            }
            let index = 0;
            let level, bitrate;
            for(level of levels){
                bitrate = level.bitrate;
                if(bitrate>last){
                    return index-1;
                }
                else{
                    index++;
                }
            }
            return index-1;
        });
    }
}

class Video{
    constructor(vid){
        this.vid = vid;
        this.loaded = this.loadData();
        this.loaded = this.loaded.then(()=>{
            return this.makeConfig();
        });
    }

    startStream(){
        return undocApi.getVideoManifestUrl(this.vid).then(url => {
            return this.loaded.then(()=>{
                this.stream = new Stream(url, this.config);
                return new Promise(resolve=>{
                    this.stream.loadHls(resolve);
                });
            });
        });
    }

    loadData(){
        return v5Api.video(this.vid).then(json=>{
            this.mutedSegments = json["muted_segments"];
            this.lengthInSecs = json["length"];
            this.lengthInHMS = utils.secsToHMS(this.lengthInSecs);
            this.channel = json["channel"].name;
            this.channelDisplay = json["channel"].display_name;
            this.channelId = json["channel"]._id;
            this.videoStatus = json["status"];
            if(this.videoStatus === "recorded"){
                this.loadHoverThumbsInfo(json["seek_previews_url"]);
            }
            this.videoTitle = json["title"];
            this.resolutions = Object.keys(json["resolutions"]);
            utils.log("channel: ", this.channel);
        });
    }

    loadHoverThumbsInfo(infoUrl){
        if(!infoUrl){
            return
        }
        let promise = utils.fetch(infoUrl).then(json=>{
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
        return utils.storage.getResumePoint(this.vid).then(resumePoint=>{
            return utils.storage.getLastSetVolume().then(volume=>{
                let config = {};
                let GETTime = parseInt(utils.findGetParameter("time"));
                let startPosition = GETTime || resumePoint || 0;
                config.startPosition = startPosition;
                volume = volume || 0.5;
                config.volume = volume;

                this.config = config;
            });
        });
    }
}

class Clip{
    constructor(vid){
        this.vid = vid;
        this.loaded = this.loadData();
        this.loaded = this.loaded.then(()=>{
            return this.makeConfig();
        });
    }

    startStream(){
        return undocApi.getClipStatus(this.vid).then(url => {
            debugger;
            return this.loaded.then(()=>{
                this.stream = new Stream(url, this.config);
                return new Promise(resolve=>{
                    this.stream.loadHls(resolve);
                });
            });
        });
    }

    loadData(){
        return new Promise(resolve=>{
            resolve();
        });
    }

    makeConfig(){
        return utils.storage.getLastSetVolume().then(volume=>{
            let config = {};
            config.startPosition = 0;
            volume = volume || 0.5;
            config.volume = volume;

            this.config = config;
        });
    }
}


class Live{
    constructor(vid){
        this.vid = vid;
        this.makeConfig();
    }

    startStream(){
        return undocApi.getStreamManifestUrl(this.vid).then(url => {
            this.stream = new Stream(url, this.config);
            return new Promise(resolve=>{
                this.stream.loadHls(resolve);
            });
        });
    }

    loadData(){
    }

    makeConfig(){
        return utils.storage.getLastSetVolume().then(volume=>{
            let config = {};
            config.volume = volume || 0.5;
            this.config = config;
        });
    }
    
}

export {Video, Live, Clip};
