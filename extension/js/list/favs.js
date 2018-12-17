import {utils} from '../utils/utils.js';
import {elements} from './elements.js';

class Favourites{
    constructor(){
        this.storageName = "favourites";
        this.init();
        this.channelsMaxSize = 200;
    }
    init(){
        this.channels = utils.storage.getItem(this.storageName);
        let channel, elem;
        for(channel of this.channels){
            elem = this.makeChannelLink(channel);
            elements.linkList.appendChild(elem);
        }
    }

    makeChannelLink(channel){
        let channelElem = document.createElement("div");
        channelElem.className = "link-list__item c__" + channel;
        channelElem.innerHTML = `<a href="${location.pathname}?perPage=30&page=1&type=archive&channel=${channel}" class="link-list__link">${channel}</a><span class="link-list__remove"> X</span>`;
        return channelElem;
    }

    add(channel){
        if(this.channels.indexOf(channel)>=0){return;}
        this.channels.unshift(channel);
        if(this.channels.length >= this.channelsMaxSize){
            this.channels.pop();
        }
        utils.storage.setItem(this.storageName, this.channels);
        this.addElem(channel);
    }

    addElem(channel){
        let channelElem = this.makeChannelLink(channel);
        elements.linkList.insertBefore(channelElem, elements.linkList.firstChild);
    }

    remove(channel){
        let index = this.channels.indexOf(channel);
        if(index>=0){
            this.channels.splice(index, 1);
            utils.storage.setItem(this.storageName, this.channels);
            this.removeElem(channel);
        }
    }

    removeElem(channel){
        let item = document.querySelector(".link-list__item.c__" + channel);
        item.remove();
    }
}

export {Favourites};
