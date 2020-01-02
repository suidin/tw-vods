import {AbstractApi} from './core.js';


class V5Api extends AbstractApi{
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

    video(vId){
        let url = `https://api.twitch.tv/kraken/videos/${vId}`;
        return this.call(url);
    }

    getStreamData(vId){
        let url = `https://api.twitch.tv/kraken/streams/${vId}`;
        return this.call(url);
    }

    videos(id, type="archive", limit=30, sort="time", offset=0){
        let url = `https://api.twitch.tv/kraken/channels/${id}/videos?limit=${limit}&broadcast_type=${type}&offset=${offset}&sort=${sort}`
        return this.call(url);
    }

    streams(limit=25, offset=0, language="en", game=""){
        let url = `https://api.twitch.tv/kraken/streams/?limit=${limit}&offset=${offset}&language=${language}&game=${game}`;
        return this.call(url);
    }

    clip(id){
        let url = `https://api.twitch.tv/kraken/clips/${id}`;
        return this.call(url);
    }    

    clips(channel, limit=100, period="all", trending=false){
        let url = `https://api.twitch.tv/kraken/clips/top?period=${period}&channel=${channel}&limit=${limit}&trending=${trending}`;
        return this.call(url);
    }

    comments(vId, ident){
        let url;
        if(Number.isInteger(ident)){
            url = `https://api.twitch.tv/v5/videos/${vId}/comments?content_offset_seconds=${ident}`;
        }
        else{
            url = `https://api.twitch.tv/v5/videos/${vId}/comments?cursor=${ident}`;
        }
        return this.call(url);
    }

    follows(id, limit=25){
        let url = `https://api.twitch.tv/kraken/users/${id}/follows/channels?limit=${limit}`;
        return this.call(url);
    }

    badges(id){
        let url = `https://api.twitch.tv/kraken/chat/${id}/badges`;
        return this.call(url);
    }

    userID(username){
        let url = `https://api.twitch.tv/kraken/users?login=${username}`;
        return this.call(url);
    }

    search(entity, ...args){
        if(entity === "channels"){
            return this.searchChannels(...args);
        }
        else if(entity === "games"){
            return this.searchGames(...args);
        }
        else{
            console.error(`search for: "${entity}" is not implemented`);
        }
    }

    searchChannels(query, limit=25){
        let url = `https://api.twitch.tv/kraken/search/channels?query=${query}&limit=${limit}&type=suggest`;
        return this.call(url);
    }

    searchGames(query){
        let url = `https://api.twitch.tv/kraken/search/games?query=${query}&type=suggest`;
        return this.call(url);
    }
}


const v5Api = new V5Api();

class ClipsEndpoint{
    call(params){
        let p = v5Api.clips(params.channel);
        return p.then(r=>{
            let clips = [];
            if (r && r.clips){
                let clip;
                for (clip of r.clips){
                    clips.push({
                        "id": clip.slug,
                        "extUrl": clip.url,
                        "game": clip.game,
                        "title": clip.title,
                        "views": clip.views,
                        "created_at": clip.created_at,
                        "thumb": clip.thumbnails.medium,
                        "vod_id": clip.vod && clip.vod.id,
                        "vod_time": clip.vod && clip.vod.url.split("t=")[1],
                    });
                }
            }
            return clips;
        });
    }
}

const clipsEndpoint = new ClipsEndpoint();

export {v5Api, clipsEndpoint};
