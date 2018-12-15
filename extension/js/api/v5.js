import {AbstractApi} from 'core.js';


class V5Api extends AbstractApi{
    constructor(key){
        super(key);
    }

    video(vId){
        return `https://api.twitch.tv/kraken/videos/${vId}`;
    }
}
