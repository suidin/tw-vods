class Storage{
    constructor(){
        this.maxResumePositions = 200;
        this.defaultValues = {
            "resumePositions": {},
            "lastChatPos": {left:0,top:0},
            "lastChatDim": {width: "300px", height: "500px"},
            "lastSetQuality": "chunked",
        }
        
        this.cleanResumePositions();
    }

    cleanResumePositions(){
        let positions = this.getItem("resumePositions");
        let positionsArr = Object.keys(positions).sort((p1,p2)=>{
            return parseInt(p1)-parseInt(p2);
        });
        if(positionsArr.length >= this.maxResumePositions){
            console.log("max resume pos reached", positions.length);
            let toDelete = positionsArr.slice(0, this.maxResumePositions);
            for(let id of toDelete){
                delete positions[id];
            }
        }
        this.setItem("resumePositions", positions);
    }

    setItem(key, val){
        localStorage.setItem(key, JSON.stringify(val));
    }

    getItem(key){
        return JSON.parse(localStorage.getItem(key)) || this.defaultValues[key];
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


    getResumePoint(vid){
        let resumePositions = this.getItem("resumePositions");
        return resumePositions && resumePositions[vid];
    }   

    setResumePoint(vid, secs){
        let resumePositions = this.getItem("resumePositions");
        resumePositions[vid] = secs;
        this.setItem("resumePositions", resumePositions)
    }
}

const storage = new Storage();
export {storage};
