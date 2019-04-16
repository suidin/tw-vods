class Dialog{
    constructor(){
    }

    do(type, text){
        if(!this.elems){
            this.setup();
        }
        this.type = type;
        this.elems.elem.id = type;
        this.elems.text.textContent = text;
        this.elems.input.value = "";
        this.elems.elem.showModal();
        return new Promise(resolve=>{
            this.handlers(resolve);
        });
    }

    prompt(text){
        return this.do("prompt", text);
    }
    promptFile(text){
        return this.do("promptFile", text);
    }
    alert(text){
        return this.do("alert", text);
    }
    dialog(text){
        return this.do("dialog", text);
    }

    setup(){
        let elem = document.createElement("dialog");
        elem.innerHTML = `<form method="dialog">
            <div>
                <div class="dialog-text">:</div>
                <input type="text">
                <input type="file">
            </div>
            <menu>
                <button class="dialog-cancel" type="reset">Cancel</button>
                <button class="dialog-submit" type="submit">Ok</button>
            </menu>
        </form>`;
        document.body.appendChild(elem);
        let elems = {"elem": elem};
        elems.text = elem.querySelector(".dialog-text");
        elems.input = elem.querySelector("input");
        elems.inputFile = elem.querySelector("input[type=file]");
        elems.cancel = elem.querySelector(".dialog-cancel");
        elems.form = elem.querySelector("form");
        this.elems = elems;
    }

    handlers(resolve){
        let cancel = e=>{
            this.elems.elem.close();
            this.elems.cancel.removeEventListener("click", cancel);
            resolve(null);
        };

        let submit = e=>{
            this.elems.elem.close();
            let val;
            if (this.type == "promptFile"){
                val = new FileReader();
                val.readAsText(this.elems.inputFile.files[0]);
                val.length = 1;
            }
            else{
                val = this.elems.input.value;
            }
            if(!val.length){
                val = true;
            }
            this.elems.form.removeEventListener("submit", submit);
            resolve(val);
        }

        this.elems.cancel.addEventListener("click", cancel);
        this.elems.form.addEventListener("submit", submit);
    }

}

export {Dialog};
