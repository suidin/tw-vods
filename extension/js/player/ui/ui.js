import { getPlayer } from '../player.js';
import { ChatInterface } from '../../chat/ui/chat.js';
import { elements } from './elements.js';
import * as components from './components/components.js';
import {KeyBindings} from './keybindings.js'
import { utils } from '../../utils/utils.js';
import { settings } from '../../settings.js';



class Ui{
    constructor(){
        this.player = getPlayer(elements.video);
        // components
        this.components = {
            "slider": new components.Slider(this.player, elements.slider),
            "qualityOptions": new components.QualityOptions(this.player, elements.qualitySelector),
            "playerButtons": new components.PlayerButtons(this.player),
            "playerControls": new components.PlayerControls(this.player, elements.interfaceBottom)
        }

        this.keyBindings = new KeyBindings(this.player, this.components);

        this.uiInitialized = false;
        this.loadVideoFromGET();

        if(settings.DEBUG){
            window.appInterface = this;
        }
    }

    loadVideoFromGET(){
        let vid = utils.findGetParameter("vid");

        if(vid){
            this.loadVideo(vid);
        }
    }

    handlers(){
        this.player.onseeking = (e)=>{
            let secs = this.player.currentTime;
            this.seek(secs);
        }
        let component;
        for(component in this.components){
            utils.log("loading: ", component);
            this.components[component].handlers();
        }
        this.keyBindings.handlers();
    }

    init(){
        this.handlers();

        this.currentTimeInterval = setInterval(this.updateAll.bind(this), 500);
    }



    loadVideo(vid){
        this.chatInterface = new ChatInterface(elements.chat);
        this.player.start(vid).then(()=>{
            this.components.qualityOptions.loadQualityOptions();
            this.player.play();
            if(!this.uiInitialized){
                this.init();
                this.uiInitialized = true;
            }
            this.components.qualityOptions.initOnLevelChange();
            this.components.slider.initOnBufferAppended();
        });
        this.player.video.loaded.then(()=>{
            if(this.player.video.hoverThumbsInfoLoaded){
                this.player.video.hoverThumbsInfoLoaded.then(info=>{
                    this.components.slider.prepareHoverThumbs(info);
                });
            }
            this.setTotalTime();
            this.components.slider.drawMutedSegments();
            this.chatInterface.queueStart(vid, this.player.video.channel, this.player.video.channelId, this.player.video.startPosition);

            document.title = `${this.player.video.channelDisplay} | ${this.player.video.videoTitle}`;
        });

    }

    seek(secs){
        this.components.slider.updateFromSecs(secs);
        this.chatInterface.seek(secs, this.player.timeBeforeSeek);
        this.updateResumePoint(secs);
    }

    setTotalTime(){
        elements.totalTime.textContent = this.player.video.lengthInHMS;
    }

    updateCurrentTime(secs){
        elements.currentTime.textContent = utils.secsToHMS(secs);
        if(!(Math.floor(secs) % 7)){
            this.components.slider.updateFromSecs(secs);
            this.updateResumePoint(secs);
        }
    }

    updateResumePoint(secs){
        utils.storage.setResumePoint(this.player.video.vid, secs);
    }

    updateAll(){
        let secs = this.player.currentTime;
        this.updateCurrentTime(secs);
        this.chatInterface.iterate(secs);
    }
}

export {Ui};
