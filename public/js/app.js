// ===================
// Screen
// ===================

/**
 * Audio filter
 */

var audioElement, context, gainL, gainR, splitter, source;
var isVideoRunOnce = false;

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
	//Connect the source to the splitter
	source.connect(splitter, 0, 0);
	//Connect splitter' outputs to each Gain Nodes
	splitter.connect(gainL, 0);
	splitter.connect(gainR, 1);

	//Connect Left and Right Nodes to the output
	//Assuming stereo as initial status
	gainL.connect(context.destination, 0);
	gainR.connect(context.destination, 0);

	// Sound Touch
	var t = new RateTransposer(true);
	var s = new Stretch(true);
	var st = new SoundTouch();
	st.pitch = 1.0;
	s.tempo = 0.5;
	st.rate = 1.0;
	f = new SimpleFilter(source, st);
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

function toggleVocal(isVocal){
	if(isVocal){
		panToStereo();
	}else{
		panToLeft();
	}
}

/**
 * Screen Panel
 */

var ScreenPanel = React.createClass({
	getInitialState: function() {
		var songData = {
			dataFolder:'',
			singerType:[],
			languageType:[],
			songList:[],
			songPlayList:[],
			playState: true,
			analogState: false
		};

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
			var url = songData.dataFolder + '/' + songData.songList[songNum].url;

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



// ===================
// Remote
// ===================

/**
 * Song Play Control
 */

var SongPlayControlBar = React.createClass({
	playAction: function(e) {
		var action = e.currentTarget.value;
		this.props.onPlayAction(action);
	},

	render: function() {
		var playBtn, analogBtn;

		if(this.props.songData.playState == true) {
			playBtn = <a className="playBtn" onClick={this.playAction} value="pause"><svg><use xlinkHref="#svg_pause"></use></svg></a>;
			//playBtn = <button className="playBtn" onClick={this.playAction} value="pause"><span>Pause</span></button>;
		} else if(this.props.songData.playState == false) {
			playBtn = <a className="playBtn" onClick={this.playAction} value="play"><svg><use xlinkHref="#svg_play"></use></svg></a>;
		}

		if(this.props.songData.analogState == false) {
			analogBtn = <a className="analogBtn" onClick={this.playAction} value="analogOff"><svg><use xlinkHref="#svg_analog_on"></use></svg></a>;
			//analogBtn = <button className="analogBtn" onClick={this.playAction} value="analogOff"><span>Analog: Off</span></button>;
		} else if(this.props.songData.analogState == true) {
			analogBtn = <a className="analogBtn" onClick={this.playAction} value="analogOn"><svg><use xlinkHref="#svg_analog_off"></use></svg></a>;
			//analogBtn = <button className="analogBtn" onClick={this.playAction} value="analogOn"><span>Analog: On</span></button>
		}

		return (
			<div className="videoController">
				{playBtn}
				<a className="nextBtn" onClick={this.playAction} value="next"><svg><use xlinkHref="#svg_next"></use></svg></a>
				<a className="replayBtn" onClick={this.playAction} value="replay"><svg><use xlinkHref="#svg_replay"></use></svg></a>
				{analogBtn}
			</div>
		);
	}
});


/**
 * Song per row
 */

var SongRow = React.createClass({
	songButtonAction: function(e){
		//var action = this.refs.actionButton.value;
		var action = e.currentTarget.value;
		this.props.onSongButtonAction(this.props.song.songId, action, this.props.song.title, this.props.song.singer);
	},

	render: function() {
		var singerType = this.props.songData.singerType;
		var languageType = this.props.songData.languageType;
		var actionButton, actionButton2;

		if (this.props.source == 'playlist' && this.props.id == '0') {
			actionButton = <a className="listPlayIcon"><svg><use xlinkHref="#svg_list_play"></use></svg></a>;
		} else if (this.props.song.status == 'idle') {
			actionButton = <a className="listAddIcon" onClick={this.songButtonAction} value="add" ref="actionButton"><svg><use xlinkHref="#svg_list_add"></use></svg></a>;
		} else if (this.props.song.status == 'add') {
			actionButton = <a className="listCutIcon" onClick={this.songButtonAction} value="cut" ref="actionButton"><svg><use xlinkHref="#svg_list_cut"></use></svg></a>;
			actionButton2 = <a className="listRemoveIcon" onClick={this.songButtonAction} value="remove" ref="actionButton"><svg><use xlinkHref="#svg_no"></use></svg></a>;
		}

		var languageStyle = {
			'background-color': languageType[this.props.song.language].color
		}

		var singerStyle = {
			'background-color': singerType[this.props.song.singerType].color
		}

		return (
			<div className={"song-item " + this.props.song.status}>
				<h2 className="song-title">{this.props.song.title}</h2>
				<h3 className="song-singer">{this.props.song.singer}</h3>
				<h4 className="song-language" style={languageStyle}>{languageType[this.props.song.language].display}</h4>
				<h4 className="song-singerType" style={singerStyle}>{singerType[this.props.song.singerType].display}</h4>
				{actionButton}
				{actionButton2}
			</div>
		);
	}
});

/**
 * Play list - added song by user
 */

var SongPlayList = React.createClass({
	render: function() {
		var rows = [];
		var songPlayList = this.props.songData.songPlayList;
		var songs = this.props.songData.songList;

		songPlayList.forEach(function (songId, index) {
			rows.push(
				<SongRow
					id={index}
					source='playlist'
					song={songs[songId]}
					key={'play-' + songs[songId].singer + '-' + songs[songId].title}
					onSongButtonAction={this.props.onSongButtonAction}
					songData={this.props.songData}
				/>
			);
		}.bind(this));

		return (
			<div className="songListContainer songPlayList">
				<SongPlayControlBar
					songData={this.props.songData}
					onPlayAction={this.props.onPlayAction}
				/>
				<div className="scrollWrap">
					<div className="rowWrap">
						{rows}
					</div>
				</div>
			</div>
		);
	}
});

/**
 * Display all the song
 */

var SongList = React.createClass({
	render: function() {
		var rows = [];
		var singerType = this.props.songData.singerType;
		var languageType = this.props.songData.languageType;
		var songs = this.props.songData.songList;

		songs.forEach(function(song, index) {
			
			// Check if song is not include filter text
			if (song.singer.indexOf(this.props.filterText) === -1 && song.title.indexOf(this.props.filterText) === -1) {
				return;
			}

			// Check if song is not in same singer type
			if (singerType[song.singerType].name != this.props.singerType && this.props.singerType != 'all') {
				return;
			}

			// Check if song is not in same language type
			if (languageType[song.language].name != this.props.languageType && this.props.languageType != 'all') {
				return;
			}

			rows.push(
				<SongRow
					id={index}
					source='songList'
					songId={index}
					song={song}
					key={'list-' + song.singer + '-' + song.title}
					onSongButtonAction={this.props.onSongButtonAction}
					songData={this.props.songData}
				/>
			);
		}.bind(this));

		return (
			<div className="scrollWrap">
				<div className="rowWrap">
					{rows}
				</div>
			</div>
		);
	}
});

/**
 * Filter system
 */

var FilterBar = React.createClass({
	handleChange: function(e) {
		// on change name
		var targetName = e.target.name;

		// on change value
		var targetValue = e.target.value;

		this.props.onUserInput(
			targetName == 'filterTextInput' ? targetValue : this.props.filterText,
			targetName == 'singerTypeInput' ? targetValue : this.props.singerType,
			targetName == 'languageInput' ? targetValue : this.props.languageType
		);
	},

	render: function() {
		return (
			<div className="songFilter">
				<input
					type="text"
					placeholder="Search"
					value={this.props.filterText}
					name="filterTextInput"
					onChange={this.handleChange}
				/>
				
				{this.addRadio(
					'singerTypeInput',
					{
						lists: this.props.songData.singerType,
						defaultCheckedValue: this.props.singerType
					},
					this.handleChange
				)}

				{this.addRadio(
					'languageInput',
					{
						lists: this.props.songData.languageType,
						defaultCheckedValue: this.props.languageType
					},
					this.handleChange
				)}
			</div>
		);
	},

	addRadio: function(id, options, onChange) {
		var radios = options.lists.map(function(value) {
			var defaultChecked = (value.name == options.defaultCheckedValue);
			return (
				<li>
					<label className={'radio-img-' + value.name}>
						<input type="radio" name={id} value={value.name} defaultChecked={defaultChecked} onChange={onChange}/>
						{value.display}
					</label>
				</li>
			)
		});

		return <ul>{radios}</ul>
	}
});

/**
 * Display all the song and user is able to add song to playlist
 */

var SongSelectList = React.createClass({
	render: function() {
		return (
			<div className="songListContainer songSelectList">
				<FilterBar
					filterText={this.props.filterText}
					singerType={this.props.singerType}
					languageType={this.props.languageType}
					songData={this.props.songData}
					onUserInput={this.props.onUserInput}
				/>
				<SongList
					filterText={this.props.filterText}
					singerType={this.props.singerType}
					languageType={this.props.languageType}
					songData={this.props.songData}
					onSongButtonAction={this.props.onSongButtonAction}
				/>
			</div>
		);
	}
});

/**
 * Song controller
 */

var SongPanel = React.createClass({
	getInitialState: function() {
		var songData = {
			dataFolder:'',
			singerType:[],
			languageType:[],
			songList:[],
			songPlayList:[],
			playState: true,
			analogState: false
		};

		songCtrl.onUpdateSongList(function(songData) {
			this.setState({songData: songData});
		}.bind(this));

		return {
			filterText: '',
			singerType: 'all',
			languageType: 'all',
			songData: songData,
			message: {
				active: 'hide',
				title:'',
				text:'',
				singer:'',
				id:'',
				type:''
			}
		}
	},

	handleUserInput: function(filterText, singerType, languageType) {
		this.setState({
			filterText: filterText,
			singerType: singerType,
			languageType: languageType
		});
	},

	handleSongUpdate: function(id, type, title, singer) {
		if (type == 'add') {
			songCtrl.onAddSong(id);
		} else if (type == 'cut') {
			this.setState({
				message: {
					active: 'show',
					text: 'Do you want to cut',
					title: title,
					singer: singer,
					id: id,
					type:'cut'
				}
			})
		} else if (type == 'remove') {
			this.setState({
				message: {
					active: 'show',
					text: 'Do you want to remove',
					title: title,
					singer: singer,
					id: id,
					type:'remove'
				}
			})
		}
	},

	handlePlayAction: function(action) {
		if (action == 'play') {
			songCtrl.onPlayAction(true);
		} else if (action == 'pause') {
			songCtrl.onPlayAction(false);
		} else if (action == 'replay') {
			songCtrl.onReplayAction();
		} else if (action == 'next') {
			songCtrl.onNextAction();
		} else if (action == 'analogOn') {
			songCtrl.onAnalogAction(false);
		} else if (action == 'analogOff') {
			songCtrl.onAnalogAction(true);
		}
	},

	switchPanel: function(e) {
		if(e.currentTarget.value == 'selectBtn') {
			$('.songSelectList').css('z-index',2);
			$('.songPlayList').css('z-index',1);
		} else if(e.currentTarget.value == 'playBtn') {
			$('.songSelectList').css('z-index',1);
			$('.songPlayList').css('z-index',2);
		}
	},

	cutSong: function(e) {
		if(e.currentTarget.value == 'yes' && this.state.message.type == 'cut') {
			songCtrl.onCutSong(this.state.message.id);
		} else if(e.currentTarget.value == 'yes' && this.state.message.type == 'remove') {
			songCtrl.onRemoveSong(this.state.message.id);
		}

		this.setState({
			message: {
				active: 'hide'
			}
		});
	},

	render: function() {
		setTimeout(function(){
			songContainerResize.updateSize();
		}, 500);

		return (
			<div className="songPanelWrapper">
				<div className={'messageWrapper ' + this.state.message.active}>
					<div className="messagePanel">
						<h1>{this.state.message.text}</h1>
						<h2>{this.state.message.title}</h2>
						<h3>{this.state.message.singer}</h3>
						<a className="yesBtn" onClick={this.cutSong} value="yes"><svg><use xlinkHref="#svg_yes"></use></svg></a>
						<a className="noBtn" onClick={this.cutSong} value="no"><svg><use xlinkHref="#svg_no"></use></svg></a>
					</div>
				</div>
				<div className="listBtnWrap">
					<a className="songPanelButton songListBtn" onClick={this.switchPanel} value="selectBtn" >Song List</a>
					<a className="songPanelButton playListBtn" onClick={this.switchPanel} value="playBtn" >Play List</a>
				</div>
				<div className="songListWraper">
					<SongSelectList
						filterText={this.state.filterText}
						singerType={this.state.singerType}
						languageType={this.state.languageType}
						songData={this.state.songData}
						onUserInput={this.handleUserInput}
						onSongButtonAction={this.handleSongUpdate}
					/>
					<SongPlayList
						songData={this.state.songData}
						onSongButtonAction={this.handleSongUpdate}
						onPlayAction={this.handlePlayAction}
					/>
				</div>
			</div>
		);
	}
});

// ===================
// Menu
// ===================

/**
 * Home Menu
 */

var MenuPanel = React.createClass({
	createRoom: function() {
		this.props.onUpdatePanelState('screen');
	},

	joinRoom: function() {
		this.props.onUpdatePanelState('remote');
	},

	render: function() {
		return(
			<div className="startMenuWrapper">
				<div className="startMenuBox remoteBox">
					<div className="startMenuIcon">
						<svg><use xlinkHref="#svg_remote"></use></svg>
					</div>
					<h1>Remote</h1>
					<a id="btnJoinRoom" className="goBtn" onClick={this.joinRoom}><svg><use xlinkHref="#svg_go"></use></svg></a>
				</div>
				<div className="startMenuBox screenBox">
					<div className="startMenuIcon">
						<svg><use xlinkHref="#svg_screen"></use></svg>
					</div>
					<h1>Screen</h1>
					<a id="btnCreateRoom" className="goBtn" onClick={this.createRoom}><svg><use xlinkHref="#svg_go"></use></svg></a>
				</div>
			</div>
		)
	}
});

/**
 * Main controller
 */

var MainController = React.createClass({
	getInitialState: function() {
		return {
			currentPanel: 'menu',
		}
	},

	updatePanelState: function(state) {
		songCtrl.onChangePanel(state, function(newState, data) {
			this.setState({currentPanel: newState});
		}.bind(this));
	},

	render: function() {
		var panel;

		if (this.state.currentPanel == 'menu') {
			panel = <MenuPanel onUpdatePanelState={this.updatePanelState} />;
		} else if (this.state.currentPanel == 'remote') {
			panel = <SongPanel />;
		} else if (this.state.currentPanel == 'screen') {
			panel = <ScreenPanel />;
		}

		return (
			<div className="reactWrap">
				{panel}
			</div>
		)
	}
});


ReactDOM.render(
	<MainController />,
	document.getElementById('main')
);

// resize
var songContainerResize = (function($, window, document){
	var isActive = false;

	var resizeContainer = function() {
		var filterH = $('.songFilter').outerHeight();
		var listBtnH = $('.songListBtn').outerHeight();

		var controllerH = $('.videoController').outerHeight();
		var playBtnH = $('.playListBtn').outerHeight();

		var windowH = $(window).outerHeight();

		var containerLeftH = windowH - filterH - listBtnH;
		$('.songSelectList .scrollWrap').height(containerLeftH);

		var containerRightH = windowH - controllerH - playBtnH;
		$('.songPlayList .scrollWrap').height(containerRightH);
	};

	$(window).resize(function() {
		resizeContainer();
	});

	return {
		updateSize: function() {
			resizeContainer();
			isActive = true;
		}
	}
})(jQuery, window, document);

// fast click
$(function() {
    FastClick.attach(document.body);
});