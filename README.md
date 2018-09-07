Chrome Extension to list and watch twitch.tv vods (past broadcasts) with recorded chat.

# General
All media data is loaded from twitch.tv. Api calls are used to collect varous datasets from twitch.tv.

This extension uses the hls streaming library hls.js from https://github.com/video-dev/hls.js.

After installing the List page will open. Otherwise click on the new extension icon to load the List.
I recommend saving this site as a bookmark.
Right now you need to provide your own twitch.tv client ID or OAuth for it to work (you will be prompted on first start).

## List
Enter a channel name to see recent vods of that channel. By clicking a thumbnail the player will open.

Entered channels will be saved for quick access.

### Keybindings

* ```tab``` select the next video in the list
* ```shift+tab``` select the previous video in the list

Press ```Enter``` open the selected video. 

## Player

### Keybindings

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

### Chat

You can move and resize the chat window.
Use "Sync Time" in the chat Options (top right in the chat window) to sync the chat with the video.
This is usually only needed for IRL streams that lagged during live broadcast.

If you increase the time the chat will catch up to the video.
Values < 0 are almost never needed unless you want to see chat with a delay.


# Known Issues

* Memory consumption can get very high over time. Especially when alot of vods where opened. Close all extension pages and wait 5 seconds to clear memory.
* Some Badges and Bit Emotes are missing
