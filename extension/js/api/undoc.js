import {AbstractApi} from './core.js';


class UndocumentedApi extends AbstractApi{
    constructor(){
        super();
        this.params = {
            "method": "GET",
            "accept": "application/vnd.twitchtv.v5+json",
            "credentials": "omit",
            "mode": "cors",
            "includeClientId": true,
        };
    }

    videoAuth(vId){
        let url = `https://api.twitch.tv/api/vods/${vId}/access_token.json?as3=t&adblock=false&need_https=true&platform=web&player_type=site`;
        return this.call(url);
    }

    streamAuth(sId){
        let url = `https://api.twitch.tv/api/channels/${sId}/access_token?as3=t&adblock=false&need_https=true&platform=_`;
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
            let url = `https://usher.ttvnw.net/api/channel/hls/${sId.toLowerCase()}.m3u8?player=twitchweb&p=${p}&type=any&allow_source=true&allow_audio_only=true&allow_spectre=false&sig=${sig}&token=${token}`;
            return url;
        });
    }

    getClipStatus(clipName){
        let query = `{
clip(slug: "${clipName}") {
    broadcaster {
      displayName
    }
    createdAt
    curator {
      displayName
      id
    }
    durationSeconds
    id
    tiny: thumbnailURL(width: 86, height: 45)
    small: thumbnailURL(width: 260, height: 147)
    medium: thumbnailURL(width: 480, height: 272)
    title
    videoQualities {
      frameRate
      quality
      sourceURL
    }
    viewCount
    }
}`;
        let url = `https://gql.twitch.tv/gql?query=${query}`;
        return this.call(url, true, false);
    }              
}

const undocApi = new UndocumentedApi();

export {undocApi};
