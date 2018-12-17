import {AbstractApi} from './core.js';


class V5Api extends AbstractApi{
    constructor(){
        super();
        this.params = {
            "method": "GET",
            "accept": "application/vnd.twitchtv.v5+json",
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

    videos(channel, type="archive", limit=30, sort="time", offset=0){
        let url = `https://api.twitch.tv/kraken/channels/${channel}/videos?limit=${limit}&broadcast_type=${type}&offset=${offset}&sort=${sort}`
        // for some reason this api call only works if you DONT include the accept header.
        // otherwise the server expects a clientID and returns 500
        return this.call(url, true, false);
    }

    streams(limit=25, offset=0, language="en", game=""){
        let url = `https://api.twitch.tv/kraken/streams/?limit=${limit}&offset=${offset}&language=${language}&game=${game}`;
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

    follows(username, limit=25){
        let url = `https://api.twitch.tv/kraken/users/${username}/follows/channels?limit=${limit}`;
        return this.call(url, true, false);
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

export {v5Api};
