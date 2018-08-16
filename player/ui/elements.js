


class Elements{
    constructor(){
        this.video = document.querySelector("video");
        this.playIcon = document.querySelector("#icon_play");
        this.pauseIcon = document.querySelector("#icon_pause");
        this.qualitySelector = document.querySelector(".select-quality");
        this.slider = document.querySelector(".player-time-slider");
        this.sliderSeen = this.slider.querySelector(".player-time-slider__seen");
        this.sliderBuffer = this.slider.querySelector(".player-time-slider__buffer");
        this.currentTime = document.querySelector(".player-current-time");
        this.totalTime = document.querySelector(".player-total-time");
        this.volumeControl = document.querySelector(".player-volume-control__slider");
        this.timeHover = document.querySelector(".player-hover-time");
        this.interfaceBottom = document.querySelector(".player-interface__bottom");
        this.app = document.querySelector(".app");
        this.volumeIcon = document.querySelector("#icon_volumefull");
        this.mutedIcon = document.querySelector("#icon_volumemute");
        this.mutedSegments = document.querySelector(".player-time-slider__muted-segments");
        this.seekingOverlay = document.querySelector(".seeking-overlay");
        this.chat = document.querySelector(".chat");
        this.chatCont = this.chat.querySelector(".chat-container");
        this.chatOptions = this.chat.querySelector(".chat-options");
        this.previewAndTime = document.querySelector(".preview-and-time");
        this.hoverPreviewContainer = this.previewAndTime.querySelector(".hover-preview-container");
        this.hoverPreviewImg = this.hoverPreviewContainer.querySelector(".hover-preview-img");
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
