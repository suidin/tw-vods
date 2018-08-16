Chrome Extension to list and watch twitch vods (past broadcasts) with recorded chat.
 from https://twitch.tv

# General
All media data is loaded from twitch.tv. Api calls are used to collect varous datasets from twitch.tv.

This extension uses the hls streaming library hls.js from https://github.com/video-dev/hls.js.

Right now you need to provide your own twitch.tv client ID or OAuth for it to work (you will be prompted on first start).
After installing click on the new extension icon to load the vod list.
I recommend saving this site as a bookmark.

## List
Enter a channel name to see recent vods of that channel. By clicking a thumbnail the player will open.

Entered channels will be saved for quick access.

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


# Missing Features:

These features are missing because I didn't find them important enough for the required work (keep in mind thant I only intendet to make this for myself). I may or may not implement those in the future. I also wanted to keep this extension pretty lightweight.

* emotes: right now global bttv, ffz and twitch.tv emotes are loaded. Sub emotes of the current channel are also loaded but no emotes from other channels. Emote permissions are also not checked.
* badges: only staff, mod and subscriber badges are loaded.
