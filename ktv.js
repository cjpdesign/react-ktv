var io;
var ktvSocket;
var ipaddr;
var fs = require("fs");
var songData;

/**
 * Initial song data
 */

function loadSongData() {
	// Load in externial file
	var content_setting = fs.readFileSync("./songSetting.json");
	var songSettingJSON = JSON.parse(content_setting);

	var data = songSettingJSON;

	// -------------
	// Load in song data list
	
	var contents_data = fs.readFileSync("./songData.json");
	var songDataJSON = JSON.parse(contents_data);

	data.songList = songDataJSON;

	var songDataList = data.songList;

	// Sort song name alphabetically
	songDataList.sort(function(a, b){
		if(a.title < b.title) return -1;
		if(a.title > b.title) return 1;
		return 0;
	});

	// Add idle status 
	songDataList.forEach(function(song, index) {
		song.status = 'idle';
		song.songId = index;
	});

	// -------------
	// Load in song data list
	
	var artists_data = fs.readFileSync("./songArtists.json");
	var artistsDataJSON = JSON.parse(artists_data);

	data.artistList = artistsDataJSON;

	var artistList = data.artistList;

	// Sort artist name alphabetically
	artistList.sort(function(a, b){
		if(a.name < b.name) return -1;
		if(a.name > b.name) return 1;
		return 0;
	});

	// -------------
	// Create empty play list
	data.songPlayList = [];

	// Create empty history list
	data.historyList = [];

	// Setup play when video load
	data.playState = true;

	// Setup no analog
	data.analogState = false;

	// Setup audio pitch
	data.pitch = 0;

	return data;
}

// Setup song data
songData = loadSongData();


// ===================
// Initial KTV system
// ===================

exports.initKTV = function(sio, socket, sipaddr) {
	io = sio;
	ktvSocket = socket;

	// Emit a connected message once connect with user
	ktvSocket.emit('connected', { message: "You are connected!"});

	// Check Client IP
	ipaddr = sipaddr;
	var clientIP = getClientIP(socket, ipaddr);
	console.log("Client's IP is " + clientIP);

	// Screen Events
	

	// Remote Events
	ktvSocket.on('remoteUpdateSongList', remoteUpdateSongList);
	ktvSocket.on('remoteAddSong', remoteAddSong);
	ktvSocket.on('remoteCutSong', remoteCutSong);
	ktvSocket.on('remoteRemoveSong', remoteRemoveSong);
	ktvSocket.on('remotePlayAction', remotePlayAction);
	ktvSocket.on('remoteAnalogAction', remoteAnalogAction);
	ktvSocket.on('remoteReplayAction', remoteReplayAction);
	ktvSocket.on('remoteNextAction', remoteNextAction);
	ktvSocket.on('remoteUpdatePitchAction', remoteUpdatePitchAction);
	ktvSocket.on('screenCurrentPlay', screenCurrentPlay);
}

/** 
 * Check clinet IP
 */

function getClientIP() {
	var ip = ktvSocket.request.connection.remoteAddress;
	
	if (ipaddr.IPv6.isValid(ip)) {
		var ip = ipaddr.IPv6.parse(ip);
		if (ip.isIPv4MappedAddress()) {
			ip = ip.toIPv4Address().toString();
		}
	}

	return ip;
}

// ===================
// Screen Function
// ===================



// ===================
// Remote Function
// ===================

function remoteUpdateSongList() {
	io.sockets.emit('newSongList', songData);
}

function remoteAddSong(id) {
	if(songData.songPlayList.indexOf(id) == -1) {
		songData.songPlayList.push(id);
		songData.songList[id].status = 'add';
	}

	remoteUpdateSongList();
}

function remoteCutSong(id) {
	var playList = songData.songPlayList;
	var indexNum = playList.indexOf(String(id));
	playList.splice(1, 0, playList.splice(indexNum, 1)[0]);
	songData.pitch = 0;

	remoteUpdateSongList();
}

function remoteRemoveSong(id) {
	var playList = songData.songPlayList;
	var indexNum = playList.indexOf(String(id));
	songData.songList[id].status = 'idle';
	playList.splice(indexNum, 1);
	songData.pitch = 0;

	remoteUpdateSongList();
}

function remotePlayAction(value) {
	songData.playState = value;

	remoteUpdateSongList();
}

function remoteAnalogAction(value) {
	songData.analogState = value;
	remoteUpdateSongList();
}

function remoteReplayAction() {
	io.sockets.emit('replaySong');
}

function remoteNextAction() {
	if (songData.songPlayList.length > 0) {
		var id = songData.songPlayList[0];
		// Set previous play song status to idle
		songData.songList[id].status = 'idle';

		// Store previous song id to history
		if(songData.historyList.indexOf(id) == -1) {
			songData.historyList.push(id);
		}

		songData.songPlayList.shift();
		songData.pitch = 0;
	}
	
	remoteUpdateSongList();
}

function remoteUpdatePitchAction(value) {
	if(value > 1) {
		value = 1;
	} else if(value < -1) {
		value = -1;
	}
	songData.pitch = value;
	remoteUpdateSongList();
}

function screenCurrentPlay(id) {
	songData.songList[id].status = 'play';
	remoteUpdateSongList();
}