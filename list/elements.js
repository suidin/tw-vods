

class Elements{
    constructor(){   
        this.channelForm = document.querySelector(".interface form");
        this.optionsLimit = this.channelForm.querySelector(".search-option__limit");
        this.optionsOffset = this.channelForm.querySelector(".search-option__offset");
        this.optionsType = this.channelForm.querySelector(".search-option__type");
        this.channelInput = this.channelForm.querySelector("input.channelInput");
        this.clientIdButton = document.querySelector(".client-id-button");
        this.optionsButton = document.querySelector(".search-options-button");
        this.optionsElem = document.querySelector(".search-options");
        this.importButton = document.querySelector(".import-button");
        this.exportButton = document.querySelector(".export-button");
        this.resultList = document.querySelector(".results .list");
        this.more = document.querySelector(".results .more");
        this.channelTitleChannel = document.querySelector(".results .channel-title__channel");
        this.channelTitleInfo = document.querySelector(".results .channel-title__info");
        this.linkList = document.querySelector(".pre-results .link-list");
    }
}


let elements;
function makeElements(){
    if(!elements){
        elements = new Elements();
    }
    return elements
}

export {elements, makeElements};
