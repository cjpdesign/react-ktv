# React Home Karaoke System

This is a React home Karaoke system that you can remote control your song playlist on your desktop or mobile device using your browser.

[![React Home Karaoke System Preview][1]][1]

### Features

* Using socket.io to connect between server and device
* Update playlist in realtime on your devices
* Easy to build up the song library data
* Display all the artists in an organized category system
* Easy to filter the category and artist name
* Display played history list

## Setup

### Initialize

* `git clone` this repo
* `npm install`

### Setup Song Folder

* The following image is an example to organize your video files into a designed folder system. `song/artistType/artistName/language/artistName-songName.mp4`
* You can also add artist profile picture in the artist folder, or system will use default image.
* `/song_temp` is the reference folder to organize your video files.

[![Song Folder Organize System][2]][2]

### Video File Format

This web Karaoke system requires to use MP4 file format with vocal on right audio channel and no vocal on left audio channel to operate properly.

### Building Song Library Data

After organize your video folders, you can start building your song library data.

* run `npm buildSongData.js`
* This will create `songArtists.json` and `songData.json`

### Start Karaoke

* `npm start`
* The terminal will display your server ip address and port number (default port `8888`)
* Your home address will be your remote controller that you can access from your desktop or mobile device.
* `ipAddress/screen` directory will be your Karaoke screen panel that you can connect your computer to your TV screen for better experience.

## How to use

### Main Navigation Panel

* Artist - display all the songs in your song library
* Playlist - display the songs that is added to playlist
* History - display all the played songs to allow user to add song back to playlist
* Search - display allows user to search song by entering the name of artist or the name of song

[![Main Navigation Panel][7]][7]

### Add Song to Playlist

Slide to right to add song to playlist

[![Add Song to Playlist][3]][3]

### Remove Song to Playlist

Slide to left to remove the song from playlist

[![Remove Song to Playlist][5]][5]

### Selected Song to Play Next

Slide to right to make selected song to play next when the song is already in the playlist

[![Selected Song to Play Next][4]][4]

### Main Play Control Panel

* Next - play next song on the playlist
* Pause - pause the video
* Replay - replay the current video again
* Vocal On/Off - turn on/off the vocal
* Pitch Up - increase the pitch of the video
* Pitch Down - decrease the ptich of the video
* Pitch Reset - reset the pitch back to default

[![Main Play Control Panel][6]][6]

[1]: ./docs/ktv_preview.jpg
[2]: ./docs/song_folder_system.jpg
[3]: ./docs/ktv_add.jpg
[4]: ./docs/ktv_play_next.jpg
[5]: ./docs/ktv_remove.jpg
[6]: ./docs/ktv_control.jpg
[7]: ./docs/ktv_nav.jpg
