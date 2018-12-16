import {AbstractApi} from './core.js';


class UndocumentedApi extends AbstractApi{
    constructor(){
        super();
        this.params = {
            "method": "GET",
            "accept": "application/vnd.twitchtv.v5+json",
            "mode": "cors",
            "includeClientId": true,
        };
    }

    videoAuth(vId){
        let url = `https://api.twitch.tv/api/vods/${vId}/access_token.json?as3=t&adblock=false&need_https=true&platform=web&player_type=site`;
        return this.call(url);
    }

    streamAuth(sId){
        let url = `https://api.twitch.tv/api/channels/${sId}/access_token.json?as3=t&adblock=false&need_https=true&platform=web&player_type=site`;
        return this.call(url);
    }

    getVideoManifestUrl(vId){
        let authP = this.videoAuth(vId);
        return authP.then(json=>{
            let sig = json.sig;
            let token = json.token;
            let p = parseInt(Math.random() * 999999);
            let url = `https://usher.ttvnw.net/vod/${vId}?player=twitchweb&p=${p}&type=any&allow_source=true&allow_audio_only=true&allow_spectre=false&nauthsig=${sig}&nauth=${token}`;
            return url;
        });
    }

    getStreamManifestUrl(sId){
        let authP = this.streamAuth(sId);
        return authP.then(json=>{
            let sig = json.sig;
            let token = json.token;
            let p = parseInt(Math.random() * 999999);
            let url = `https://usher.ttvnw.net/api/channel/hls/${this.vid.toLowerCase()}.m3u8?player=twitchweb&p=${p}&type=any&allow_source=true&allow_audio_only=true&allow_spectre=false&nauthsig=${sig}&nauth=${token}`;
            return url;
        });
    }
}

const undocApi = new UndocumentedApi();

export {undocApi};
