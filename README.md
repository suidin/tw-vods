Chrome Extension to list and watch twitch.tv vods (past broadcasts) with recorded chat. 
Live Streams also work for the most part.

# General
All media data is loaded from twitch.tv. Api calls are used to collect various datasets from twitch.tv.

This extension uses the hls streaming library hls.js from https://github.com/video-dev/hls.js.

After installing the List page will open. Otherwise click on the new extension icon to load the List.
I recommend saving this site as a bookmark.

# Player Keybindings

* ```f``` enter/leave fullscreen
* ```space``` play/pause
* ```m``` mute/unmute
* ```c``` hide/show chat
* ```→``` go 5secs forward
* ```←``` go 5secs back
* ```+``` go 30secs forward
* ```-``` go 30secs backwards
* ```↑``` increase volume
* ```↓``` decrease volume

While holding ```Alt``` and pressing ```+/-``` you can go forward/backwards multiples of 30secs.

# Chat

You can move and resize the chat window.
Use "Sync Time" in the chat Options (top right in the chat window) to sync the chat with the video.
This is usually only needed for IRL streams that lagged during live broadcast.

If you increase the time the chat will catch up to the video.
Values < 0 are almost never needed unless you want to see chat with a delay.
