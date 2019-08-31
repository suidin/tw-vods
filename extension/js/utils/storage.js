class Storage{
    constructor(){

    }

    export(){
        let msg = {
            "op": "getAllData",
        }
        return this.sendToBg(msg, true).then(storedData=>{
            return JSON.stringify(storedData)
        });
    }

    import(s){
        let locS
        try{
            locS = JSON.parse(s);
        }
        catch(e){
            return false;
        }
        let msg = {
            "op": "setAllData",
            "data": locS,
        }
        this.sendToBg(msg, false);
        return true;
    }

    
    sendToBg(msg, expectResponse=true){
        msg.event = "storage";
        if (expectResponse){
            let p = new Promise(resolve=>{
                chrome.runtime.sendMessage(msg, response => {
                    resolve(response);
                });
            });
            return p;
        }
        else{
            chrome.runtime.sendMessage(msg);
        }
    }

    setItem(key, val){
        let msg = {
            "op": "set",
            "key": key,
            "val": val,
        }
        this.sendToBg(msg, false);
    }

    getItem(key){
        let msg = {
            "op": "get",
            "key": key,
        }
        return this.sendToBg(msg, true);
    }

    

    setLastChatPos(left, top){
        this.setItem("lastChatPos", {"left": left, "top": top});
    }

    getLastChatPos(){
        return this.getItem("lastChatPos");
    }

    setLastChatDim(width, height){
        this.setItem("lastChatDim", {"width": width, "height": height});
    }

    getLastChatDim(){
        return this.getItem("lastChatDim");
    }

    getLastSetQuality(){
        return this.getItem("lastSetQuality");
    }
    setLastSetQuality(quality){
        return this.setItem("lastSetQuality", quality);
    }
    getLastSetVolume(){
        return this.getItem("lastSetVolume");
    }
    setLastSetVolume(volume){
        return this.setItem("lastSetVolume", volume);
    }

    setFav(channel){
        let msg = {
            "op": "setFav",
            "channel": channel,
        }
        this.sendToBg(msg, false);
    }

    unsetFav(channel){
        let msg = {
            "op": "unsetFav",
            "channel": channel,
        }
        this.sendToBg(msg, false);
    }


    getResumePoint(vid){
        let msg = {
            "op": "getResumePoint",
            "vid": vid,
        }
        return this.sendToBg(msg, true);
    }

    setResumePoint(vid, secs){
        let msg = {
            "op": "setResumePoint",
            "vid": vid,
            "secs": secs,
        }
        this.sendToBg(msg, false);
    }
    getUserId(username){
        let msg = {
            "op": "getUserId",
            "username": username,
        }
        return this.sendToBg(msg, true);
    }
    setUserId(username, id){
        let msg = {
            "op": "setUserId",
            "username": username,
            "id": id,
        }
        this.sendToBg(msg, false);
    }
}

const storage = new Storage();
export {storage};
