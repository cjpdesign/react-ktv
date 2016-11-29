// ===================
// Screen
// ===================

/**
 * Audio filter
 */

var audioElement, context, gainL, gainR, splitter, source, jungle;
var isVideoRunOnce = false;
var previousPitch = 0;
var transpose = false;

function initVideo(){

	//Init AudioContext
	//window.audioContext = window.audioContext||window.webkitAudioContext; //fallback for older chrome browsers
	context = new AudioContext();
	//context.createGain = context.createGain||context.createGainNode; //fallback for gain naming
	gainL = context.createGain();
	gainR = context.createGain();

	splitter = context.createChannelSplitter(2);

	//Connect to source
	source = context.createMediaElementSource(audioElement);
	
	// Pitch filter
	jungle = new Jungle(context);

	//Connect the source to the splitter
	source.connect(splitter, 0, 0);
	//Connect splitter' outputs to each Gain Nodes
	splitter.connect(gainL, 0);
	splitter.connect(gainR, 1);

	//Connect Left and Right Nodes to the output
	//Assuming stereo as initial status
	gainL.connect(jungle.input, 0);
	gainR.connect(jungle.input, 0);

	updatePitch(0);
	jungle.output.connect(context.destination, 0);
}

//Mute left channel and set the right gain to normal
function panToRight(){
	gainL.gain.value = 0;
	gainR.gain.value = 1;
}

//Mute right channel and set the left gain to normal
function panToLeft(){
	gainL.gain.value = 1;
	gainR.gain.value = 0;
}

//Restore stereo
function panToStereo(){
	gainL.gain.value = 1;
	gainR.gain.value = 1;
}

// toggle vocal setting
function toggleVocal(isVocal){
	if(isVocal){
		panToStereo();
	}else{
		panToLeft();
	}
}

// update audio pitch
function updatePitch(val) {
	previousPitch = val;
	jungle.setPitchOffset(previousPitch, transpose);
}

/**
 * Screen Panel
 */

var previousURL = '';

var ScreenPanel = React.createClass({
	getInitialState: function() {
		var songData = {
			dataFolder:'',
			artistType:[],
			languageType:[],
			categoryMenu:[],
			songList:[],
			artistList:[],
			songPlayList:[],
			historyList:[],
			playState: true,
			analogState: false,
			pitch: 0
		};

		songCtrl.onSetRole('screen');

		songCtrl.onUpdateSongList(function(songData) {
			this.setState({songData: songData});
		}.bind(this));

		songCtrl.onReplayActionScreen(function() {
			audioElement.currentTime = 0;
		}.bind(this));

		return {
			songData: songData
		}
	},

	render: function() {
		if(this.state.songData.songPlayList.length > 0) {
			var songData = this.state.songData;

			// Get song id number
			var songNum = songData.songPlayList[0];

			// Get song url
			var newURL = songData.songList[songNum].url;

			// if it is new url
			if (previousURL != newURL) {
				// store new url
				previousURL = newURL;

				var url = '/' + songData.dataFolder + '/' + newURL;

				// set current song to play status
				songCtrl.onScreenCurrentPlay(songNum);
			}

			// Init the audio setting
			if(isVideoRunOnce == false) {
				isVideoRunOnce = true;

				audioElement = document.getElementById('ktvPlayer');

				// Check when the video play to the end
				audioElement.addEventListener('ended', function() {
					songCtrl.onNextAction();
				}, false);

				// initial the video setting
				initVideo();
			}

			// Check the if need to switch to analog mode
			toggleVocal(songData.analogState);

			// Update the pitch
			updatePitch(songData.pitch);

			// check if play state is play/pause
			if (songData.playState == true) {
				setTimeout(function(){
					if(audioElement.readyState === 4 ) {
						audioElement.play();
					} else {
						audioElement.onloadedmetadata = function(){
							audioElement.play();
						};
					}
				},100);
			} else {
				audioElement.pause();
			}
			
		}

		return (
			<div className="screenWrapper">
				<video id="ktvPlayer" src={url} type="video/mp4" controls />;
			</div>
		);
	}
});



ReactDOM.render(
	<ScreenPanel />,
	document.getElementById('main')
);