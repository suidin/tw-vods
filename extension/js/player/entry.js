import {settings} from '../settings.js';
import {utils} from '../utils/utils.js';
import { Ui } from './ui/ui.js';
import {makeElements} from './ui/elements.js';


function load(){
    makeElements();
    utils.ready.then(()=>{
        let ui = new Ui();
    });
}


window.onload = load;
