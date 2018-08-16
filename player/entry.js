import {settings} from '../settings.js';
import { Ui } from './ui/ui.js';
import {makeElements} from './ui/elements.js';


function load(){
    makeElements();

    let ui = new Ui();
}


window.onload = load;
