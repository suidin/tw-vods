import {elements} from './elements.js';
import {v5Api} from '../api/v5.js';


const searcherCache = {
    "games":  {},
    "channels": {},
};

const defaultParams = {
    "minChars": 3,
    "maxItems": 10,
    "cooldown": 2000,
    "delay": 200,
}

const typeDefs = {
    "games": {
        "listAttr": "games",
        "labelAttr": "name",
        "valAttr": "_id",
        "sort": false,
    },
    "channels": {
        "listAttr": "channels",
        "labelAttr": "display_name",
        "sort": (c1, c2)=>{
            return c2.followers - c1.followers;
        },
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
        let justSelected = false;
        this.elem.addEventListener("awesomplete-select", e=>{
            justSelected = true;
            let label = e.text.label;
            let value = e.text.value;
            if(value){
                // elements.optionsGame.value = label;
                elements.optionsGameId.value = value;
                e.text.value = label;
                // e.preventDefault();
            }
        });


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
            if(justSelected){
                clearTimeout(timeout);
                justSelected = false;
                return;
            }
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
                    arr = json[typeDef.listAttr];
                    typeDef.sort && arr.sort(typeDef.sort);
                    arr = arr.map(g=>{
                        if (typeDef.valAttr){
                            return [g[typeDef.labelAttr], g[typeDef.valAttr]];
                        }
                        else{
                            return g[typeDef.labelAttr];
                        }
                    });
                    this.setCache(currentVal, arr);
                    if(justSelected){
                        return;
                    }
                    this.awe.list = arr;
                    this.awe.evaluate();
                });
            }, scheduleIn);
        });
    }
}


export {AweSearcher};
