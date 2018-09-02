import {settings} from '../settings.js';
import {Ui} from './list.js';
import {makeElements} from './elements.js';


function load(){
    makeElements();

    let ui = new Ui();
}


window.onload = load;
