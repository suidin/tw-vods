import {v5Api} from '../api/v5.js';


const searcherCache = {
    "games":  {},
    "channels": {},
};

const defaultParams = {
    "minChars": 4,
    "cooldown": 2000,
    "delay": 200,
}

const typeDefs = {
    "games": {
        "listAttr": "games",
        "itemAttr": "name",
    },
    "channels": {
        "listAttr": "channels",
        "itemAttr": "display_name",
    },
}

class AweSearcher{
    constructor(elem, type, params){
        if(params){
            params = Object.assign({}, defaultParams, params);
        }
        else{
            params = defaultParams;
        }
        this.awe = new Awesomplete(elem, {list: [], autoFirst: true, minChars: 1, sort: false});
        this.params = params;
        this.type = type;
        this.cache = searcherCache[type];
        this.elem = elem;

        this.init();
    }

    getCache(query){
        return this.cache[query];
    }

    setCache(query, list){
        this.cache[query] = list;
    }

    init(){
        let timeout;
        let now;
        let lastRequest = 0;
        let tDiff
        let currentVal = "";
        let cachedList;
        let scheduleIn;
        let arr;
        const type = this.type;
        const typeDef = typeDefs[type];
        const delay = this.params.delay;
        const cd = this.params.cooldown;
        const minChars = this.params.minChars;

        this.elem.addEventListener("input", e=>{
            currentVal = this.elem.value;
            cachedList = this.getCache(currentVal);
            if(cachedList){
                this.awe.list = cachedList;
                this.awe.evaluate();
                return;
            }
            now = performance.now();
            tDiff = now - lastRequest;
            if(currentVal.length < minChars) return;
            clearTimeout(timeout);
            scheduleIn = Math.max(cd - tDiff, delay);
            timeout = setTimeout(()=>{
                lastRequest = performance.now();
                v5Api.search(type, (encodeURIComponent(currentVal))).then(json=>{
                    if(!(json && json[typeDef.listAttr] && json[typeDef.listAttr].length)) return;
                    arr = json[typeDef.listAttr].map(g=>{
                        return g[typeDef.itemAttr];
                    });
                    this.setCache(currentVal, arr);
                    this.awe.list = arr;
                    this.awe.evaluate();
                });
            }, scheduleIn);
        });
    }
}


export {AweSearcher};
