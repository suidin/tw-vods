import {utils} from '../utils/utils.js';
import {elements} from './elements.js';


class Favourites{
    constructor(){
        this.storageName = "favourites";
        this.init();

    }
    init(){
        let channel, elem;
        utils.storage.getItem(this.storageName).then(channels=>{
            for(channel of channels){
                elem = this.makeChannelLink(channel);
                elements.linkList.appendChild(elem);
            }
        });
    }

    makeChannelLink(channel){
        let channelElem = document.createElement("div");
        channelElem.className = "link-list__item c__" + channel;
        channelElem.innerHTML = `<a href="${location.pathname}?perPage=30&page=1&type=archive&channel=${channel}" class="link-list__link">${channel}</a><span class="link-list__remove"> X</span>`;
        return channelElem;
    }

    faved(channel){
        return utils.storage.getItem(this.storageName).then(channels=>{
            return channels.indexOf(channel) >= 0;
        });
    }

    add(channel){
        utils.storage.setFav(channel);
        this.addElem(channel);
    }

    addElem(channel){
        let channelElem = this.makeChannelLink(channel);
        elements.linkList.insertBefore(channelElem, elements.linkList.firstChild);
    }

    remove(channel){
        utils.storage.unsetFav(channel);
        this.removeElem(channel);
    }

    removeElem(channel){
        let item = document.querySelector(".link-list__item.c__" + channel);
        item && item.remove();
    }
}

export {Favourites};
