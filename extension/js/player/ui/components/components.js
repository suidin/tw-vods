import { elements } from '../elements.js';
import { utils } from '../../../utils/utils.js';
import { settings } from '../../../settings.js';




class Component{
    constructor(player, elem){
        this.player = player;
        this.elem = elem;
    }

}


class Slider extends Component{

    handlers(){
        this.elem.addEventListener("click", e=>{
            let percentage = this.percentageFromXpos(e.clientX);
            this.player.seek(this.secsFromPercentage(percentage));
        });

        this.elem.addEventListener("mousemove", e=>{
            this.showPreviewAndTime(e.clientX);
        });
        this.elem.addEventListener("mouseleave", e=>{
            elements.previewAndTime.style.display = "none";
        });
    }

    updateFromSecs(secs){
        let percentage = this.percentageFromSecs(secs);
        this.update(percentage);
    }

    update(percentage){
        elements.sliderSeen.style.width = percentage * 100 + "%";
    }

    showPreviewAndTime(xPos, secs=0){
        let percentage;
        if(secs){
            percentage = this.percentageFromSecs(secs);
        }
        else{
            percentage = this.percentageFromXpos(xPos);
            secs = this.secsFromPercentage(percentage);
        }
        let hms;
        if(settings.mode === "video"){
            hms = utils.secsToHMS(secs);
        }
        else{
            hms = "-" + utils.secsToHMS(this.player.getDuration() - secs);
        }

        if(this.info){
            this.createPreviewImg(percentage);
        }

        let sliderWidth = this.widthFromPercentage(percentage);
        elements.previewAndTime.style.display = "block";
        let previewWidth = elements.previewAndTime.clientWidth;
        elements.timeHover.textContent = hms;

        let left = sliderWidth - previewWidth/2;
        let barWidth = elements.slider.clientWidth;
        if(left<0){
            left = -9.5;
            elements.timeHoverArrow.style.left = sliderWidth + "px";
        }
        else if (left + previewWidth > barWidth){
            left = barWidth - previewWidth;
            elements.timeHoverArrow.style.left = (sliderWidth - left - 15) + "px";
            left = left + 4;
        }
        else{
            elements.timeHoverArrow.style.left = previewWidth/2 - 10 + "px";
        }
        elements.previewAndTime.style.left = left + "px";
    }

    getMutedSegmentElem(offset, duration){
        let p1 = this.percentageFromSecs(offset);
        let left = p1 * 100 + "%";

        let p2 = this.percentageFromSecs(duration);
        let width = p2 * 100 + "%";

        let elem = document.createElement("span");
        elem.className = "player-slider__muted";
        elem.style.width = width;
        elem.style.left = left;

        return elem;
    }

    drawMutedSegments(){
        let segs = this.player.video.mutedSegments;
        if(!segs){return;}
        let elem, segment;
        for(segment of segs){
            elem = this.getMutedSegmentElem(segment.offset, segment.duration);
            elements.mutedSegments.appendChild(elem);
        }
    }

    createPreviewImg(p){
        let thumbNr = Math.floor(p * this.info.count);
        let imgIndex = Math.floor(thumbNr / this.info.per);
        let url = this.info.urlTemplate + this.info.images[imgIndex];

        thumbNr = thumbNr % this.info.per;

        let [row, col] = [Math.floor(thumbNr / this.info.cols), thumbNr % this.info.cols];
        let [left, top] = [col*this.info.width, row*this.info.height];
        [left, top] = [left+"px", top+"px"];

        elements.hoverPreviewImg.style.transform = `translate(-${left}, -${top})`;

        elements.hoverPreviewContainer.style.width = this.info.width + "px";
        elements.hoverPreviewContainer.style.height = this.info.height + "px";

        elements.hoverPreviewImg.src = url;
    }

    getCurrentImgUrl(p){
        let index = Math.floor(p * this.info.l);
        return this.info.urlTemplate + this.info.images[index];
    }

    prepareHoverThumbs(info){
        info.l = info.images.length;
        info.per = info.rows * info.cols;
        this.info = info;
        elements.hoverPreviewContainer.style.display = "block";
    }


    // tools:
    secsFromPercentage(percentage){
        return Math.floor(this.player.getDuration() * percentage);
    }

    widthFromPercentage(percentage){
        let width = this.elem.clientWidth;
        return width*percentage;
    }

    percentageFromXpos(xPos){
        let rect = this.elem.getBoundingClientRect();
        xPos = xPos - rect.left;
        let width = rect.width;
        return xPos/width;
    }
    percentageFromSecs(secs){
        return secs / this.player.getDuration();
    }


    // update buffer display on new segment appended to buffer:
    initOnBufferAppended(){
        this.player.video.stream.onbufferappended(this.updateBufferDisplay.bind(this));
    }
    updateBufferDisplay(segmentEndTime){
        let p = this.percentageFromSecs(segmentEndTime);
        elements.sliderBuffer.style.width = p*100 + "%";
    }
}


class QualityOptions extends Component{

    handlers(){
        this.elem.addEventListener("change", e=>{
            let val = this.elem.options[this.elem.selectedIndex].value;
            if(val === "Auto"){
                this.player.video.stream.hls.nextLevel = -1;
            }
            else{
                let index = this.getQualityIndex(val);
                this.player.video.stream.hls.nextLevel = index;
                val = this.qualityOptions[index].bitrate;
                utils.storage.setLastSetQuality(val);
            }
        });

        this.elem.addEventListener("focus", e=>{
            this.elem.blur();
        });
    }

    makeOptionElem(name){
        let elem = document.createElement("option");
        elem.value = name;
        if(name==="chunked"){
                elem.textContent = "source";
        }
        else{
            elem.textContent = name;
        }
        return elem;
    }

    loadQualityOptions(){
        this.qualityOptions = this.player.video.stream.hls.levels;
        let chunkedElem;
        this.qualityOptions.forEach(q=>{
            let name = q.attrs.VIDEO;
            let elem = this.makeOptionElem(name);
            if(name === "chunked"){
                chunkedElem = elem;
            }
            else{
                this.elem.insertBefore(elem, this.elem.firstChild);
            }
        });
        this.elem.insertBefore(chunkedElem, this.elem.firstChild);
        let autoOptionElem = this.makeOptionElem("Auto");
        this.elem.appendChild(autoOptionElem);
        this.elem.firstChild.selected = true;
    }

    updateCurrentQuality(level){
        let q = this.qualityOptions[level].attrs.VIDEO;
        let option = this.elem.querySelector(`option[value="${q}"]`);
        option.selected = true;
    }

    getQualityIndex(name){
        let l = this.qualityOptions.length;
        for(let i=0;i<l;i++){
            let q = this.qualityOptions[i];
            if(name === q.attrs.VIDEO){
                return this.qualityOptions.indexOf(q);
            }
        }
    }

    initOnLevelChange(){
        this.player.video.stream.onlevelchange(this.updateCurrentQuality.bind(this));
    }
}

class PlayerButtons extends Component{

    handlers(){
        elements.playIcon.addEventListener("click", e=>{
            this.player.play();
        });
        elements.pauseIcon.addEventListener("click", e=>{
            this.player.pause();
        });
        elements.mutedIcon.addEventListener("click", e=>{
            this.toggleMute();
        });
        elements.volumeIcon.addEventListener("click", e=>{
            this.toggleMute();
        });

        elements.volumeControl.addEventListener("input", e=>{
            this.player.volume = parseFloat(elements.volumeControl.value);
        });
        elements.volumeControl.addEventListener("focus", e=>{
            elements.volumeControl.blur();
        });

        this.player.onvolumechange = ()=>{
            let volume = this.player.volume;
            elements.volumeControl.value = volume;
            utils.storage.setLastSetVolume(volume);
        };
        this.player.onplay = ()=>{
            this.showPlay();
        }
        this.player.onpause = ()=>{
            this.showPause();
        }
    }

    showPlay(){
        elements.playIcon.style.display = "none";
        elements.pauseIcon.style.display = "block";
    }
    showPause(){
        elements.pauseIcon.style.display = "none";
        elements.playIcon.style.display = "block";
    }
    toggleMute(){
        let display = elements.volumeIcon.style.display;
        elements.volumeIcon.style.display = elements.mutedIcon.style.display;
        elements.mutedIcon.style.display = display;
        this.player.muted = !this.player.muted;
    }

}

class PlayerControls extends Component{


    handlers(){
        this.hideTimeOut = 0;
        this.showFn = ()=>{
            this.elem.style.opacity = "1";
            elements.app.style.cursor = "initial";
        }
        this.hideFn = ()=>{
            this.elem.style.opacity = "0";
            elements.app.style.cursor = "none";
        }
        this.initiateShow = e=>{
            if(this.mouseInUi){return;}
            clearTimeout(this.hideTimeOut);
            this.showFn();
            this.hideTimeOut = setTimeout(this.hideFn, 3000);
        };

        elements.app.addEventListener("mousemove", this.initiateShow);
        this.elem.addEventListener("mouseenter", e=>{
            this.mouseInUi = true;
            clearTimeout(this.hideTimeOut);
            this.showFn();
        });
        this.elem.addEventListener("mouseleave", e=>{
            this.mouseInUi = false;
            this.hideTimeOut = setTimeout(this.hideFn, 3000);
        })

        elements.playerOverlay.addEventListener("dblclick", this.toggleFullscreen);
    }

    toggleFullscreen(){
        if(document.webkitIsFullScreen){
            document.webkitCancelFullScreen();
        }
        else{
            elements.app.webkitRequestFullScreen();
        }
    }
}


export {Component, Slider, QualityOptions, PlayerButtons, PlayerControls};
