

chrome.browserAction.onClicked.addListener(function(tab) {
    let newUrl = chrome.runtime.getURL("list/list.html");
    console.log("new url: ", newUrl);
    chrome.tabs.create({ url: newUrl });
});
