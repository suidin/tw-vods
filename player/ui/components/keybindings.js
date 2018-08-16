import {elements} from '../elements.js';
import {Component} from './components.js';
import { utils } from '../../../utils/utils.js';


class KeyBindings extends Component{
    constructor(ui){
        super(ui);
        this.player = this.ui.player;
        this.seekingMultiplier = 0;
        this.VIDEO_SEEK_AMOUNT = 30;
    }

    seekVideo(seconds){
        let newTime = this.player.currentTime + seconds;
        if(newTime<0){newTime=0;}
        if(newTime>=this.player.duration){newTime=this.player.duration-1;}
        this.player.currentTime = newTime;
    }

    getSeekStr(seconds){
        if (seconds === 0){
            return " 00:00 ";
        }
        let sign = seconds < 0 ? "-" : "+";
        seconds = Math.abs(seconds);
        let mins = Math.floor(seconds / 60);
        seconds = seconds % 60
        return sign + utils.padDigits(mins, 2) + ":" + utils.padDigits(seconds, 2);
    }

    handlers(){
        document.addEventListener("keyup", (e) => {
            if (e.keyCode == 18){
                elements.seekingOverlay.style.display = "none";
                elements.previewAndTime.style.display = "none";
                if (this.seekingMultiplier !== 0){
                    this.seekVideo(this.VIDEO_SEEK_AMOUNT * this.seekingMultiplier);
                    this.seekingMultiplier = 0;
                }
                this.ui.components.playerControls.showFn();
            }
        });

        document.addEventListener("keydown", (e) => {
            let volume;
            if(e.shiftKey || e.ctrlKey){
                return;
            }
            else if(e.altKey){
                switch(e.keyCode){
                    case 187:
                        if (e.altKey){
                            this.updateSeekingOverlay(1);
                        }
                        else{
                            this.seekVideo(this.VIDEO_SEEK_AMOUNT);
                        }
                        break;
                    case 189:
                        if (e.altKey){
                            this.updateSeekingOverlay(-1);
                        }
                        else{
                            this.seekVideo(-this.VIDEO_SEEK_AMOUNT);   
                        }
                        break;
                    default:
                        return;
                }
            }
            else{  
                switch(e.keyCode){
                    case 39:
                        this.seekVideo(5);
                        break;
                    case 37:
                        this.seekVideo(-5);
                        break;
                    case 38:
                        volume = this.player.volume + 0.05;
                        if(volume>1){volume = 1;}
                        this.player.volume = volume;
                        break;
                    case 40:
                        volume = this.player.volume - 0.05;
                        if(volume<0){volume = 0;}
                        this.player.volume = volume;
                        break;
                    case 32:
                        if(this.player.paused){
                            this.player.play();
                        }
                        else{
                            this.player.pause();
                        }
                        break;
                    case 77:
                        if(e.ctrlKey){return;}
                        this.ui.components.playerButtons.toggleMute();
                        break;
                    case 70:
                        this.ui.toggleFullscreen();
                        break;
                    case 67:
                        this.ui.components.chat.toggleChat();
                        break;
                    default:
                        return;
                }
            }
            this.ui.components.playerControls.showFn();
        });
    }

    updateSeekingOverlay(sign){
        this.seekingMultiplier += sign;
        let seekValue = this.seekingMultiplier * this.VIDEO_SEEK_AMOUNT;
        let text = this.getSeekStr(seekValue);
        elements.seekingOverlay.querySelector("span").textContent = text;
        elements.seekingOverlay.style.display = "block";
        this.ui.components.slider.showPreviewAndTime(null, this.ui.player.currentTime + seekValue);
    }
}

export {KeyBindings};
