

function openList(){
    let newUrl = chrome.runtime.getURL("list/list.html");
    chrome.tabs.create({ url: newUrl });
}

chrome.browserAction.onClicked.addListener(function(tab) {
    openList();
});
chrome.runtime.onInstalled.addListener(function (object) {
    if(chrome.runtime.OnInstalledReason.INSTALL === object.reason){
        openList();   
    }
});
