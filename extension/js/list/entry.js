import {settings} from '../settings.js';
import {utils} from '../utils/utils.js';
import {Ui} from './list.js';
import {makeElements} from './elements.js';


function load(){
    makeElements();
    utils.ready.then(()=>{
        let ui = new Ui();
    });
}


window.onload = load;
