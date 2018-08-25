import {settings} from '../settings.js';
import {utils, FixedSizeArray} from '../utils/utils.js';


class Chat{
    constructor(vid){
        this.vid = vid;
        this.next = 0;
        this.maxMessages = 200;
        this.maxChunkBuffer = 80;
        this.chunkBuffer = new Map();
        this.chunkTimes = new Map();
        this.messages = new FixedSizeArray(350);
        this.clear = false;
        this.failed = 0;
    }

    halfChunkBuffer(){
        let half = Math.floor(this.chunkBuffer.size / 2);
        if(half === 0){return;}
        let i = 0;
        let keys = [...this.chunkTimes.keys()].sort((range1, range2)=>{
            return range1[0] - range2[0];
        });
        let key, value;
        for(key of keys){
            if(i>=half){return}
            this.chunkBuffer.delete(this.chunkTimes.get(key));
            this.chunkTimes.delete(key);
            i++;
        }
    }

    processChunk(chunk, ident){
        let comments = chunk["comments"];
        if (!(comments && comments[0])){
            return;
        }
        let index, comment, message;
        for (index in comments){
            comment = comments[index];
            message = {
                "text": comment["message"]["body"],
                "from": comment["commenter"]["display_name"],
                "time": comment["content_offset_seconds"],
                "color": comment["message"]["user_color"],
                "badges": comment["message"]["user_badges"]
            };
            comments[index] = message;
        }
        this.messages.push(...comments);


        // buffer stuff:
        this.chunkBuffer.set(ident, {"messages": comments, "next": chunk._next});
        let timeRange = [comments[0].time, comments[comments.length-1].time];
        this.chunkTimes.set(timeRange, ident);
        utils.log("chunkbuffersize: ", this.chunkBuffer.size);
        if(this.chunkBuffer.size>this.maxChunkBuffer){
            utils.log("clearing half of buffer...");
            this.halfChunkBuffer();
        }
    }

    chunkFromBuffer(ident, offset){
        if(offset){
            let range, thisIdent;
            for(range of this.chunkTimes.keys()){
                if(range[0]<ident && ident<range[1]){
                    thisIdent = this.chunkTimes.get(range);
                    return this.chunkBuffer.get(thisIdent);
                }
            }
        }
        else{
            return this.chunkBuffer.get(ident);
        }
    }

    get(ident){
        if(!this.messages.canPush()){
            return;
        }
        let offset = this.identIsOffset(ident);
        if (offset && offset < 0) return;
        let url = this.getUrl(ident, offset);
        this.gettingident = ident;

        let chunk = this.chunkFromBuffer(ident, offset);
        if(chunk){
            utils.log("got chunk from buffer");
            this.messages.push(...chunk.messages);
            this.next = chunk.next;
            this.gettingident = undefined;
        }
        else{
            return utils.getRequestPromise(url, {then:"json"}).then((json) =>{
                if(json && json.comments && json.comments[0]){
                    this.processChunk(json, ident);
                    if(json._next !== ident){
                        this.next = json._next;
                        this.gettingident = undefined;
                    }
                }
                else{
                    this.failed++;
                    setTimeout(()=>{
                        this.gettingident = undefined;
                    }, this.failed*1000);
                }
            });
        }
    }

    getNext(){
        if (this.next !== undefined && this.gettingIdentifier === undefined){
            if(this.clear){
                this.clear = false;
                this.messages.reset();
                this.next = this.seekTime;
            }
            this.get(this.next);
        }
    }

    identIsOffset(ident){
        return Number.isInteger(ident);
    }
    identIsCursor(ident){
        return !this.identIsOffset(ident);
    }

    getUrl(ident, offset=false){
        let url;
        if (offset){
            url = this.getRechatOffsetUrl(ident);
        }
        else{
            url = this.getRechatCursorUrl(ident);
        }
        return url;
    }
    seek(secs){
        this.clear = true;
        this.seekTime = Math.floor(secs);
    }

    getRechatOffsetUrl(offset){
        return `https://api.twitch.tv/v5/videos/${this.vid}/comments?content_offset_seconds=${offset}`;
    }
    getRechatCursorUrl(cursor){
        return `https://api.twitch.tv/v5/videos/${this.vid}/comments?cursor=${cursor}`;
    }

    start(offset=0){
        this.get(Math.floor(offset));
    }
}



export {Chat};
