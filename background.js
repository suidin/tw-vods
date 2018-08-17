

chrome.browserAction.onClicked.addListener(function(tab) {
    let newUrl = chrome.runtime.getURL("list/list.html");
    chrome.tabs.create({ url: newUrl });
});
