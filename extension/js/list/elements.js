

class Elements{
    constructor(){
        this.form = document.querySelector(".interface form");
        this.optionsType = this.form.querySelector(".search-option__type");
        this.optionsChannel = this.form.querySelector(".search-option__channel");
        this.optionsGame = this.form.querySelector(".search-option__game");
        this.optionsLimit = this.form.querySelector(".search-option__limit");
        this.optionsPage = this.form.querySelector(".search-option__page");
        this.optionsElem = document.querySelector(".search-options");

        this.clientIdButton = document.querySelector(".client-id-button");
        this.wlButton = document.querySelector(".watch-later-button");
        this.nlButton = document.querySelector(".nonlisted-button");
        this.importButton = document.querySelector(".import-button");
        this.exportButton = document.querySelector(".export-button");
        this.importFollowsButton = document.querySelector(".import-follows-button");
        this.resultList = document.querySelector(".results .list");
        this.channelTitleChannel = document.querySelector(".results .channel-title__channel");
        this.channelTitleInfo = document.querySelector(".results .channel-title__info");
        this.linkList = document.querySelector(".pre-results .link-list");
        this.paginationPages = document.querySelector(".pagination-pages");
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
