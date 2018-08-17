function pauseEvent(e){
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
}


class Draggable{
    constructor(elem, config){
        this.elem = elem;
        this.outer = config.outer;
        this.handle = config.handle;
        this.onEnd = config.onEnd;
        this.startX = 0;
        this.startY = 0;
    }

    cleanPos(pos){
        if(pos.left < 0){pos.left = 0}
        if(pos.top < 0){pos.top = 0}
        let elemWidth = this.elem.clientWidth;
        let windowWidth = window.innerWidth;
        if(pos.left + elemWidth > windowWidth){
            pos.left = windowWidth - elemWidth;
        }
        let elemHeight = this.elem.clientHeight;
        let windowHeight = window.innerHeight;
        if(pos.top + elemHeight > windowHeight){
            pos.top = windowHeight - elemHeight;
        }
        pos.left = (pos.left / windowWidth) * 100 + "%";
        pos.top = (pos.top / windowHeight) * 100 + "%";
    }

    moveHandler(e){
        pauseEvent(e);
        let pos = this.getNewPos(e);
        this.cleanPos(pos);
        this.elem.style.left = pos.left;
        this.elem.style.top = pos.top;
    }

    init(){
        let moveFn = this.moveHandler.bind(this);
        this.handle.addEventListener("mousedown", e=>{
            pauseEvent(e);
            this.makeStartDiff(e);
            this.dragging = true;
            this.outer.addEventListener("mousemove", moveFn);
            let endDragFn = e=>{
                this.dragging = false;
                this.outer.removeEventListener("mousemove", moveFn);
                this.outer.removeEventListener("mouseup", endDragFn);
                if(this.onEnd){
                    this.onEnd();
                }
            };
            this.outer.addEventListener("mouseup", endDragFn);
        });
    }

    makeStartDiff(e){
        let rect = this.elem.getBoundingClientRect();
        this.startX = rect.left - e.clientX;
        this.startY = rect.top - e.clientY;
    }

    getNewPos(e){

        let x = e.clientX;
        let y = e.clientY;
        let newX = x + this.startX;
        let newY = y + this.startY;
        let pos = {left: newX, top: newY};
        return pos;
    }
}

class Resizable{
    constructor(elem, config){
        this.elem = elem;
        this.outer = config.outer;
        this.handle = config.handle;
        this.onEnd = config.onEnd;
        this.startX = 0;
        this.startY = 0;
    }

    cleanPos(pos){
        // if(pos.left < 0){pos.left = 0}
        // if(pos.top < 0){pos.top = 0}
        // let elemWidth = this.elem.clientWidth;
        let windowWidth = window.innerWidth;
        if(pos.width > windowWidth){
            pos.width = windowWidth;
        }
        let elemHeight = this.elem.clientHeight;
        let windowHeight = window.innerHeight;
        if(pos.height > windowHeight){
            pos.height = windowHeight;
        }
        pos.width = (pos.width / windowWidth) * 100 + "%";
        pos.height = (pos.height / windowHeight) * 100 + "%";
    }

    moveHandler(e){
        pauseEvent(e);
        let pos = this.getNewPos(e);
        this.cleanPos(pos);
        this.elem.style.width = pos.width;
        this.elem.style.height = pos.height;
    }

    init(){
        let moveFn = this.moveHandler.bind(this);
        this.handle.addEventListener("mousedown", e=>{
            pauseEvent(e);
            this.makeStartDiff(e);
            this.dragging = true;
            this.outer.addEventListener("mousemove", moveFn);
            let endDragFn = e=>{
                this.dragging = false;
                this.outer.removeEventListener("mousemove", moveFn);
                this.outer.removeEventListener("mouseup", endDragFn);
                if(this.onEnd){
                    this.onEnd();
                }
            };
            this.outer.addEventListener("mouseup", endDragFn);
        });
    }

    makeStartDiff(e){
        let rect = this.elem.getBoundingClientRect();
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startWidth = rect.width;
        this.startHeight = rect.height;
    }

    getNewPos(e){
        let movedX = this.startX - e.clientX;
        let movedY = this.startY - e.clientY;

        let width = this.startWidth - movedX;
        let height = this.startHeight - movedY;
        let pos = {"width": width, "height": height};
        return pos;
    }
}



export {Draggable, Resizable};
