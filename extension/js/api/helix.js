import {AbstractApi} from './core.js';


class HelixApi extends AbstractApi{
    constructor(){
        super();
        this.params = {
            "method": "GET",
            "accept": "",
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
        return parts.join("");
    }

    cursorStr(direction, cursor){
        let cursorParam = "";
        if(cursor){
            cursorParam = `&${direction}=${cursor}`;
        }
        return cursorParam;
    }

    games(game_ids){
        let gamesParam = this.arrToHelixStr("id", game_ids);
        gamesParam = gamesParam.substr(1);
        let url = `https://api.twitch.tv/helix/games?${gamesParam}`;
        return this.call(url);
    }

    topGames({first=100}={}, direction, cursor){
        let cursorParam = this.cursorStr(direction, cursor);
        let url = `https://api.twitch.tv/helix/games/top?first=${first}${cursorParam}`;
        return this.call(url);
    }


    videos({vIds}={}){
        let idsParam = this.arrToHelixStr("id", vIds).substr(1);;
        let url = `https://api.twitch.tv/helix/videos?${idsParam}`;
        return this.call(url);
    }

    userVideos({uid, first=100, type="archive", sort="time"}={}, direction="after", cursor=false){
        let cursorParam = this.cursorStr(direction, cursor);
        let url = `https://api.twitch.tv/helix/videos?user_id=${uid}&first=${first}&type=${type}${cursorParam}&sort=${sort}`;
        return this.call(url);
    }

    gameVideos({gid, first=100, type="archive", sort="views", period="month"}={}, direction="after", cursor=false){
        let cursorParam = this.cursorStr(direction, cursor);
        let url = `https://api.twitch.tv/helix/videos?game_id=${gid}&first=${first}&type=${type}${cursorParam}&sort=${sort}&language=en&period=${period}`;
        return this.call(url);
    }

    streams({first=100, languages=["en"], game_ids=false} = {}, direction="after", cursor=false){
        let gamesParam = this.arrToHelixStr("game_id", game_ids);
        let languagesParam = this.arrToHelixStr("language", languages);
        let cursorParam = this.cursorStr(direction, cursor);
        let url = `https://api.twitch.tv/helix/streams?first=${first}${cursorParam}${languagesParam}${gamesParam}`;
        return this.call(url);
    }

    userStreams({users, first=100}={}, direction="after", cursor=false){
        let usersParam = this.arrToHelixStr("user_login", users);
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


const helixApi = new HelixApi();


class HelixEndpoint{
    constructor(endpoint){
        this.endpoint = endpoint;
        this.lastCursor = null;
    }
    _call(params, direction, cursor){
        if (params){
            this.lastParams = params;
        }
        else{
            params = this.lastParams;
        }

        let p = helixApi[this.endpoint](params, direction, cursor);
        return p.then(r=>{
            this.lastCursor = r.pagination && r.pagination.cursor;
            this.lastData = r.data;
            return r.data;
        });
    }

    call(params){
        return this._call(params)
    }

    next(){
        return new Promise((resolve, reject)=>{
            if(this.lastCursor){
                this._call(null, "after", this.lastCursor).then(data=>{
                    resolve(data);
                });
            }
            else{
                reject();
            }
        });
    }

    previous(){
        return new Promise((resolve, reject)=>{
            if(this.lastCursor){
                this._call(null, "before", this.lastCursor).then(data=>{
                    resolve(data);
                });
            }
            else{
                reject();
            }
        });
    }

}

export {helixApi, HelixEndpoint};
