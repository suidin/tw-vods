import {utils} from '../../utils/utils.js';
import {settings} from '../../settings.js';


const options = [
    {
        "name": "fontSize",
        "label": "Font Size",
        "type": "range",
        "min": 12,
        "max": 32,
        "default": 17,
        "changeFn": (val) => {
            document.querySelector(".chat-container").style.fontSize = val+"px";
        },
        "clean": (val) => {
            val = parseInt(val);
            if (val < 12 ){
                val = 12;
            }
            else if (val > 32){
                val = 32;
            }
            return val
        }
    },
    {
        "name": "bgVisibility",
        "label": "Background Visibility",
        "type": "range",
        "min": 0,
        "max": 100,
        "default": 75,
        "changeFn": (val) => {
            let opacity = val / 100
            let color = `rgba(41,41,41, ${opacity})`;
            document.querySelector(".chat-container").style.backgroundColor = color;
        },
        "clean": function(val) {
            val = parseInt(val);
            let opacity = val;
            if (opacity > this.max){
                opacity = this.max;
            }
            else if (opacity < this.min){
                opacity = this.min;
            }
            return opacity
        }
    },
    {
        "name": "syncTime",
        "label": "Sync Time",
        "type": "number",
        "dontStore": true,
        "mode": "video",
        "min": -99,
        "max": 999,
        "default": 0,
        "changeFn": (val) => {
            // this.time = val;
        },
        "clean": val => {
            return parseInt(val);
        }
    },
]

class ChatOption{
    constructor(obj){
        this.name = obj.name;
        this.dontStore = obj.dontStore;
        this.type = obj.type;
        this.label = obj.label;
        this.clean = obj.clean;
        this.changeFn = obj.changeFn;
        this.default = obj.default;
        this.id = "chat-option-" + this.name;
        let range = "";
        this.event = "input";
        if (this.type === "range" || this.type === "number"){
            range = `min=${obj.min} max=${obj.max}`;
        }
        else if (this.type === "checkbox"){
            this.event = "change";
        }
        this.html = `<label class="title" for="${this.id}">${this.label}: </label><input class="input" type="${this.type}" id="${this.id}" ${range}>`
        this.storageName = "chatOption" + utils.capitalize(this.name);

        let elem = document.createElement("div");
        elem.className = "chat-option";
        elem.innerHTML = this.html;
        this.input = elem.querySelector(".input");
        this.elem = elem;
    }

    init(){
        this.getInitial().then(val=>{
            val = this.clean(val);
            this.changeFn(val);
            this.val = val;
            this.updateInput();
        });
    }

    getInitial(){
        if(this.dontStore){
            return new Promise(resolve=>{
                resolve(this.default);
            });
        }
        return utils.storage.getItem(this.storageName).then(val=>{
            if (val === undefined || val === null){
                val = this.default;
            }
            return val;
        });
    }

    updateVal(val){
        val = this.clean(val);
        this.changeFn(val);
        this.val = val;
        if(!this.dontStore){
            utils.storage.setItem(this.storageName, val);
        }
    }

    updateInput(){
        if (this.type === "checkbox"){
            this.input.checked = this.val;
        }
        else{
            this.input.value = this.val;
        }
    }

    handler(input){
        let val;
        if (this.type === "checkbox"){
            val = input.checked;
        }
        else{
            val = input.value;
        }
        this.updateVal(val);
    }

    addHandler(){
        this.input.addEventListener(this.event, (e) => {
            this.handler(this.input);
        });
    }

}

class ChatOptions{
    constructor(elem){
        this.elem = elem;
        this.makeOptions();
        this.init();
    }

    makeOptions(){
        let thisoptions = {}, optionDef, option;
        for(optionDef of options){
            if(optionDef.mode && optionDef.mode !== settings.mode)continue;
            option = new ChatOption(optionDef);
            thisoptions[option.name] = option;
        }
        this.options = thisoptions;
    }

    update(){

    }

    init(){
        let index ,option;
        for (index in this.options){
            option = this.options[index];
            option.init();
            this.elem.appendChild(option.elem);
            option.addHandler();
        }
    }
}


export {ChatOptions};
