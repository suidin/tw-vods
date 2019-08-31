import {AbstractApi} from './core.js';


class HelixApi extends AbstractApi{
    constructor(){
        super();
        this.params = {
            "method": "GET",
            "accept": "application/vnd.twitchtv.v5+json",
            "credentials": "omit",
            "mode": "cors",
            "includeClientId": true,
        };
        this.includeApiHeader = false;
    }

    arrToHelixStr(paramName, arr){
        if (!arr){
            return "";
        }
        let parts = arr.map(e=>`&${paramName}=${e}`);
        return parts.join();
    }

    cursorStr(direction, cursor){
        let cursorParam = "";
        if(cursor){
            cursorParam = `&${direction}=${cursor}`;
        }
        return cursorParam;
    }

    video(vId){
        let url = `https://api.twitch.tv/helix/videos?id=${vId}`;
        return this.call(url);
    }

    userVideos(uid, first=30, direction="after", cursor=false, type="archive", sort="time"){
        let cursorParam = this.cursorStr(direction, cursor);
        let url = `https://api.twitch.tv/helix/videos?user_id=${uid}&first=${first}&type=${type}${cursorParam}&sort=${sort}`;
        return this.call(url);
    }

    gameVideos(gid, first=30, direction="after", cursor=false, type="archive", sort="views", period="month"){
        let cursorParam = this.cursorStr(direction, cursor);
        let url = `https://api.twitch.tv/helix/videos?game_id=${gid}&first=${first}&type=${type}${cursorParam}&sort=${sort}&language=en&period=${period}`;
        return this.call(url);
    }

    streams(first=30, direction="after", cursor=false, languages=["en"], game_ids=false){
        let gamesParam = this.arrToHelixStr("game_id", game_ids);
        let languagesParam = this.arrToHelixStr("language", languages);
        let cursorParam = this.cursorStr(direction, cursor);
        let url = `https://api.twitch.tv/helix/streams?first=${first}${cursorParam}${languagesParam}${gamesParam}`;
        return this.call(url);
    }

    userStreams(users, first=30, direction="after", cursor=false){
        let usersPart = this.arrToHelixStr("user_login", users);
        let cursorParam = this.cursorStr(direction, cursor);
        let url = `https://api.twitch.tv/helix/streams?first=${first}${cursorParam}${usersParam}`;
        return this.call(url);
    }

    // comments(vId, ident){
    //     let url;
    //     if(Number.isInteger(ident)){
    //         url = `https://api.twitch.tv/v5/videos/${vId}/comments?content_offset_seconds=${ident}`;
    //     }
    //     else{
    //         url = `https://api.twitch.tv/v5/videos/${vId}/comments?cursor=${ident}`;
    //     }
    //     return this.call(url, true, true, this.format, false, true);
    // }


    // badges(id){
    //     let url = `https://api.twitch.tv/kraken/chat/${id}/badges`;
    //     return this.call(url);
    // }

    userIDs(usernames){
        this.arrToHelixStr("login", usernames);
        let url = `https://api.twitch.tv/helix/users?${usersParam}`;
        return this.call(url);
    }
}


const helixApi = new helixApi();

export {helixApi};
