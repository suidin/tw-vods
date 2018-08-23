

class Pagination{
    constructor(elem, showMax=7){
        this.elem = elem;
        this.showMax = showMax;
    }

    update(lastPage, page){
        this.current = page;
        this.middle = page;
        this.lastPage = lastPage;
        this.calcPages(page, lastPage);
        this.draw();
    }

    calcPages(page, lastPage){
        let pages = [];

        let start = page - Math.floor(this.showMax/2);
        if(start<=1){
            start=1;
        }
        else{
            pages.push(1);
            if(start === 3){
                pages.push(2);
            }
            else if(start > 3){
                pages.push("...");
            }
        }
        let end = start + this.showMax - 1;
        if(end>lastPage){
            end=lastPage;
        }
        for(let i=start;i<=end;i++){
            if(i>lastPage)continue;
            pages.push(i);
        }
        if(end !== lastPage){
            let diff = lastPage - end;
            if(diff > 2){
                pages.push("...");
            }
            else if(start === 2){
                pages.push(lastPage-1);
            }
            pages.push(lastPage);
        }
        this.pages = pages;
    }

    getPageElemStr(page, current=false){
        let cls;
        if(page === "..."){
            cls = "pagination-page pagination-page-gap"; 
        }
        else{
            cls = current ? "pagination-page pagination-page-current" : "pagination-page";
        }
        return `<div class="${cls}">${page}</div>`;
    }

    draw(){
        let page;
        let current = this.current;
        let pages = this.pages;
        let arr = [];
        for(page of pages){
            arr.push(this.getPageElemStr(page, page===current));
        }
        this.elem.innerHTML = arr.join("");
    }

    rotate(direction){
        if(direction===1){
            this.middle = Math.min(this.middle + this.showMax, this.lastPage - 4)
        }
        else if(direction===-1){
            this.middle = Math.max(this.middle - this.showMax, 4);
        }
        this.calcPages(this.middle, this.lastPage);
        this.draw();
    }
}


export {Pagination};
