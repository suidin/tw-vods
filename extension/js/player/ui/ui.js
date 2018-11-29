import { getPlayer } from '../player.js';
import { ReChatInterface, LiveChatInterface } from '../../chat/ui/chat.js';
import { elements } from './elements.js';
import * as components from './components/components.js';
import {KeyBindings} from './keybindings.js'
import { utils } from '../../utils/utils.js';
import { settings } from '../../settings.js';



class Ui{
    constructor(){
        let vid = utils.findGetParameter("vid");
        let channel = utils.findGetParameter("channel");
        let channelID = utils.findGetParameter("channelID");
        if(vid){
            settings.mode = "video";
            this.lastResumePoint = 0;
        }
        else if(channel){
            settings.mode = "live";
            elements.app.classList.add("live");
        }
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

        if(settings.mode === "video"){
            this.loadVideo(vid);
        }
        else{
            this.loadChannel(channel, channelID);  
        }

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

    loadChannelFromGET(){
        let channel = utils.findGetParameter("channel");

        if(channel){
            this.loadChannel(channel);
        }
    }

    handlers(){
        this.player.onseeking = (e)=>{
            let secs = this.player.getCurrentTime();
            this.seek(secs);
        }
        if(settings.mode === "video"){
            this.player.ondurationchange = (e)=>{
                this.setCurrentTotalTime();
            };
        }
        let onplayermetaloaded = ()=>{
            this.components.slider.drawMutedSegments();
            this.player.removeEventListener("loadedmetadata", onplayermetaloaded);
        }
        this.player.addEventListener("loadedmetadata", onplayermetaloaded);
        let component;
        for(component in this.components){
            if(!this.components[component]){continue;}
            utils.log("loading: ", component);
            this.components[component].handlers();
        }
        this.keyBindings.handlers();
    }

    init(){
        this.handlers();
        if(this.player.video.videoStatus && this.player.video.videoStatus === "recording"){
            this.videoRecordingAppendInterval = setInterval(()=>{
                this.player.video.stream.hls.levelController.loadLevel();
            }, 5*60*1000);
            let stillRecordingCount = 3;
            let durationThen = this.player.getDuration();
            let onLL = (e, data)=>{
                let durationNow = this.player.getDuration();
                if(durationThen === durationNow){
                    if(!(--stillRecordingCount)){
                        this.player.video.stream.hls.off(Hls.Events.LEVEL_LOADED, onLL);
                        clearInterval(this.videoRecordingAppendInterval);
                    }
                }
                else if (durationNow){
                    stillRecordingCount = 3;
                    durationThen = durationNow;
                }
            };
            this.player.video.stream.hls.on(Hls.Events.LEVEL_LOADED, onLL);
        }
        let canPlayHandler = ()=>{
            this.player.removeEventListener("canplay", canPlayHandler);
            this.updateAllInterval = setInterval(this.updateAll.bind(this), 500);
        };
        this.player.addEventListener("canplay", canPlayHandler);
    }

    loadChannel(channel, channelID){
        this.chatInterface = new LiveChatInterface(elements.chat);
        this.player.start(channel).then(e=>{
            this.components.qualityOptions.loadQualityOptions();
            this.player.play();
            if(!this.uiInitialized){
                this.init();
                this.uiInitialized = true;
            }
            this.components.qualityOptions.initOnLevelChange();
        });
        this.chatInterface.queueStart(channel.toLowerCase(), channelID);

    }

    loadVideo(vid){
        this.chatInterface = new ReChatInterface(elements.chat);
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
                    if(info && info.images && info.images.length){
                        this.components.slider.prepareHoverThumbs(info);
                    }
                });
            }
            this.chatInterface.queueStart(vid, this.player.video.channel, this.player.video.channelId, this.player.video.startPosition);

            document.title = `${this.player.video.channelDisplay} | ${this.player.video.videoTitle}`;
        });

    }

    seek(secs){
        this.components.slider.updateFromSecs(secs);
        if(settings.mode === "video"){  // TODO: actually seek chat in live too
            this.chatInterface.seek(secs, this.player.timeBeforeSeek);
        }
        this.updateResumePoint(secs);
    }

    setTotalTime(timeStr){
        elements.totalTime.textContent = timeStr;
    }

    setCurrentTotalTime(){
        this.setTotalTime(utils.secsToHMS(this.player.getDuration()));
    }

    updateCurrentTime(secs){
        if(settings.mode === "video"){
            elements.currentTime.textContent = utils.secsToHMS(secs);
            this.updateResumePoint(secs);
        }
        if(secs && !(Math.floor(secs) & 7)){
            this.components.slider.updateFromSecs(secs);
        }
    }

    updateResumePoint(secs){
        if(settings.mode === "live")return;
        if(Math.abs(secs - this.lastResumePoint) > 7){
            this.lastResumePoint = secs;
            utils.storage.setResumePoint(this.player.video.vid, secs);
        }
    }

    updateAll(){
        let secs = this.player.getCurrentTime();
        if(settings.mode === "video"){        
            this.chatInterface.iterate(secs);
        }
        this.updateCurrentTime(secs);
    }
}

export {Ui};
