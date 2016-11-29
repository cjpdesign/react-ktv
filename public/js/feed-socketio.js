var songCtrl = (function($, window, document){

	var IO = {
		// STEP 1-1
		init: function() {
				IO.socket = io.connect();
				IO.bindEvents();
		},

		bindEvents: function() {
			IO.socket.on('connected', IO.onConnected);
			IO.socket.on('newSongList', IO.onNewSongList);
			IO.socket.on('replaySong', IO.onReplaySong);
		},

		onConnected: function(data) {
			console.log(data.message);
			App.myStocketId = IO.socket.id;
		},

		onNewSongList: function(data) {
			App[App.myRole].updateSongList(data);
		},

		onReplaySong: function() {
			if(App.myRole == 'Screen') {
				App.Screen.replaySong();
			}
		}
	}

	var App = {
		myRole: '',
		myStocketId: '',

		Screen: {
			initScreen: function() {
				App.myRole = 'Screen';
			},

			onUpdateSongList: function() {
				IO.socket.emit('remoteUpdateSongList');
			},

			updateSongList: function(data) {
				callbackFunction(data);
			},

			replaySong: function() {
				replayCallbackFunction();
			},

			onScreenCurrentPlay: function(id) {
				IO.socket.emit('screenCurrentPlay', id);
			}
		},

		Remote: {
			initRemote: function() {
				App.myRole = 'Remote';
			},

			onUpdateSongList: function() {
				IO.socket.emit('remoteUpdateSongList');
			},

			updateSongList: function(data) {
				callbackFunction(data);
			},

			onAddSong: function(id) {
				IO.socket.emit('remoteAddSong', id);
			},

			onCutSong: function(id) {
				IO.socket.emit('remoteCutSong', id);
			},

			onRemoveSong: function(id) {
				IO.socket.emit('remoteRemoveSong', id);
			},

			onPlayAction: function(value) {
				IO.socket.emit('remotePlayAction', value);
			},

			onAnalogAction: function(value) {
				IO.socket.emit('remoteAnalogAction', value);
			},

			onReplayAction: function() {
				IO.socket.emit('remoteReplayAction');
			},

			onNextAction: function() {
				IO.socket.emit('remoteNextAction');
			},

			onUpdatePitch: function(value) {
				IO.socket.emit('remoteUpdatePitchAction', value);
			}
		}
	}

	IO.init();

	var callbackFunction, replayCallbackFunction;

	return {
		// set role to screen or remote
		onSetRole: function(state, callback) {
			if (state == 'screen') {
				App.Screen.initScreen();
			} else if (state == 'remote') {
				App.Remote.initRemote();
			}
		},

		// request song data from server
		onUpdateSongList: function(callback) {
			callbackFunction = callback;
			App[App.myRole].onUpdateSongList();
		},

		// add song to playlist
		onAddSong: function(id) {
			App.Remote.onAddSong(id);
		},

		// cut song to 2nd item on the playlist
		onCutSong: function(id) {
			App.Remote.onCutSong(id);
		},

		// remove song from playlist
		onRemoveSong: function(id) {
			App.Remote.onRemoveSong(id);
		},

		// play or pause the video
		onPlayAction: function(value) {
			App.Remote.onPlayAction(value);
		},

		// replay the video
		onReplayAction: function() {
			App.Remote.onReplayAction();
		},

		// play next video from the playlist
		onNextAction: function() {
			App.Remote.onNextAction();
		},

		// turn on or off the artist analog
		onAnalogAction: function(value) {
			App.Remote.onAnalogAction(value);
		},

		// increase or decrease the audio pitch
		onUpdatePitch: function(value) {
			App.Remote.onUpdatePitch(value);
		},

		onReplayActionScreen: function(callback) {
			replayCallbackFunction = callback;
		},

		// set play status to the current play video
		onScreenCurrentPlay: function(id) {
			App.Screen.onScreenCurrentPlay(id);
		},
	}

})(jQuery, window, document);