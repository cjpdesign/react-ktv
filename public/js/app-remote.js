/**
 * ----------------------------
 * Filter Array
 * ----------------------------
 */
function arrayObjectIndexOf(arrayItem, property, searchTerm) {
	for(var i=0; i < arrayItem.length; i++) {
		if(arrayItem[i][property] == searchTerm) {
			return i;
		}
	}
	return -1;
}

/**
 * ----------------------------
 * Song Header
 * ----------------------------
 */

var SongHeader = React.createClass({
	returnStep: function(e) {
		this.props.onReturnStep();
	},

	render: function() {
		return(
			<div className={"song-header-wrapper " + this.props.mainPanelStep + " " + this.props.artistPanelStep}>
				<a className="return-step" onClick={this.returnStep}><svg><use xlinkHref="#svg_return_step"></use></svg></a>
				<div className="current-title"><svg><use xlinkHref="#svg_logo"></use></svg></div>
			</div>
		);
	}
});

/**
 * ----------------------------
 * Header - Song Menu
 * ----------------------------
 */

var SongMenu = React.createClass({
	switchPanel: function(e) {
		var type = e.currentTarget.value;
		this.props.onToggleMainPanel(type);
	},

	render: function() {
		return(
			<nav className={"song-menu-wrapper " + this.props.mainPanelStep}>
				<ul>
					<li><a onClick={this.switchPanel} value="artist">Artists</a></li>
					<li><a onClick={this.switchPanel} value="playlist">Playlist</a></li>
					<li><a onClick={this.switchPanel} value="history">History</a></li>
					<li><a onClick={this.switchPanel} value="search">Search</a></li>
				</ul>
			</nav>
		);
	}
});

/**
 * ----------------------------
 * Category Row
 * ----------------------------
 */

var CategoryRow = React.createClass({
	changeCategory: function(e) {
		this.props.onUpdateFilter(this.props.category.artistType, this.props.category.languageType);
	},

	render: function() {
		return(
			<li className="category-item">
				<a className="list-el-wrap" onClick={this.changeCategory}>
					<h2>{this.props.category.display}</h2>
					<div className="cta">
						<svg className="svg-arrow"><use xlinkHref="#svg_arrow"></use></svg>
					</div>
				</a>
			</li>
		);
	}
});


/**
 * ----------------------------
 * Category List
 * ----------------------------
 */

var CategoryList = React.createClass({
	render: function() {
		var rows = [];
		var categoryList = this.props.songData.categoryMenu;

		categoryList.forEach(function(data, id) {
			rows.push(
				<CategoryRow
					id={id}
					category={data}
					key={'category-' + id}
					onUpdateFilter={this.props.onUpdateFilter}
				/>
			);
		}.bind(this));

		return(
			<div className="category-list-wrapper artist-container list-scroll">
				<ul>
					{rows}
				</ul>
			</div>
		);
	}
});

/**
 * ----------------------------
 * Artist Row
 * ----------------------------
 */

var ArtistRow = React.createClass({
	changeArtist: function() {
		this.props.onUpdateArtist(this.props.data.name);
	},

	render: function() {
		var photoURL = this.props.data.photo;

		if(photoURL != '') {
			photoURL = this.props.songData.dataFolder + '/' + photoURL;
		} else {
			photoURL = '/images/default-photo.jpg';
		}

		return(
			<li>
				<a className="grid-tiles list-el-wrap" onClick={this.changeArtist}>
					<div className="photo">
						<img src={photoURL} />
					</div>
					<div className="info">
						<h2>{this.props.data.name}</h2>
						<h3>{this.props.numberSongs} Songs</h3>
					</div>
					<div className="cta">
						<svg className="svg-arrow"><use xlinkHref="#svg_arrow"></use></svg>
					</div>
				</a>
			</li>
		);
	}
});

/**
 * ----------------------------
 * Artist List
 * ----------------------------
 */

var ArtistList = React.createClass({
	render: function() {
		var rows = [];

		var artistType = this.props.songData.artistType;

		// Check Language ID
		var languageType = this.props.songData.languageType;
		var filterLanguageID = arrayObjectIndexOf(languageType, 'name', this.props.filterLanguage);

		var artistList = this.props.songData.artistList;

		// Go over each artist
		artistList.forEach(function(data, id) {

			// If same as filter gender or all
			if(artistType[data.gender].name != this.props.filterGender && this.props.filterGender != 'all') {
				return;
			}

			var languageIndex, numberSongs = 0;

			if(this.props.filterLanguage != 'all') {
				// check the language for the song
				languageIndex = arrayObjectIndexOf(data.languages, 'id', filterLanguageID);

				if(languageIndex != -1) {
					// store the number of song within filter language category
					numberSongs = data.languages[languageIndex].quantity;
				}else {
					// if ther is no match
					return;
				}
			} else {
				// add up all the songs
				for(var i = 0; i < data.languages.length; i++) {
					numberSongs += data.languages[i].quantity;
				}
			}

			rows.push(
				<ArtistRow
					id={id}
					data={data}
					key={'artist-' + id}
					songData={this.props.songData}
					numberSongs={numberSongs}
					onUpdateArtist={this.props.onUpdateArtist}
				/>
			);
		}.bind(this));

		return(
			<div className="artist-list-wrapper artist-container list-scroll">
				<ul>
					{rows}
				</ul>
			</div>
		);
	}
});

/**
 * ----------------------------
 * Song Row
 * ----------------------------
 */

var SongRow = React.createClass({
	render: function() {
		var photoURL = this.props.photo;

		if(photoURL != '') {
			photoURL = this.props.songData.dataFolder + '/' + photoURL;
		} else {
			photoURL = '/images/default-photo.jpg';
		}

		if(this.props.song.status == 'idle') {
			this.statusClass = 'command-left';
			this.songFeatureClass = 'song-add-symbol';
			this.songFeatureSVG = '#svg_song_add';
			this.playStatus = '';
		} else if(this.props.song.status == 'add') {
			this.statusClass = 'command-both';
			this.songFeatureClass = 'song-next-symbol';
			this.songFeatureSVG = '#svg_song_next';
			this.playStatus = '';
		} else if(this.props.song.status == 'play') {
			this.statusClass = 'command-right';
			this.songFeatureClass = 'song-play-symbol';
			this.playStatus = <span className="playStatus">PLAYING</span>;
		}

		var artistType = this.props.songData.artistType;
		var languageType = this.props.songData.languageType;

		return(
			<li className={"drag-wrapper " + this.statusClass}>
				<div className="grid-tiles list-el-wrap" data-id={this.props.id}>
					<div className="photo">
						<img src={photoURL} draggable="false"/>
					</div>
					<div className="info">
						<h2>{this.props.song.title}{this.playStatus}</h2>
						<h3>{this.props.song.songArtist}</h3>
						<div>
							<h4>{languageType[this.props.song.language].display}</h4>
							<h4>{artistType[this.props.song.gender].display}</h4>
						</div>
					</div>
				</div>
				<div className="song-delete-symbol">
					<svg className="svg-36 svg-round-border"><use xlinkHref="#svg_song_remove"></use></svg>
				</div>
				<div className={this.songFeatureClass}>
					<svg className="svg-36 svg-round-border"><use xlinkHref={this.songFeatureSVG}></use></svg>
				</div>
			</li>
		);
	}
});

/**
 * ----------------------------
 * Song List
 * ----------------------------
 */

var SongList = React.createClass({
	toggleCommend: function(direction, id) {
		var state = this.props.songData.songList[id].status;
		var title = this.props.songData.songList[id].title;
		var artist = this.props.songData.songList[id].songArtist;

		if(state == 'idle' && direction == 'right') {
			// Add Song
			this.props.onSongSliderAction(id, 'add');
		} else if(state == 'add' && direction == 'left') {
			this.props.onSongSliderAction(id, 'remove', title, artist);
		} else if(state == 'add' && direction == 'right') {
			this.props.onSongSliderAction(id, 'cut', title, artist);
		} else if(state == 'play' && direction == 'left') {
			this.props.onSongSliderAction(id, 'next');
		}
	},

	componentDidUpdate: function() {
		var self = this;
		dragOperator.updateElements('.drag-wrapper', '.grid-tiles');
		dragOperator.setCallbackFunc(function(direction, id){
			self.toggleCommend(direction, id);
		});
	},

	render: function() {
		if (this.props.songData.songList.length != 0) {
			var rows =[];
			var selectedArtist = this.props.selectedArtist;
			var filterLanguage = this.props.songData.filterLanguage;
			var songList = this.props.songData.songList;
			var artistList = this.props.songData.artistList;

			var languageType = this.props.songData.languageType;
			var filterLanguageID = arrayObjectIndexOf(languageType, 'name', this.props.filterLanguage);

			if(selectedArtist != '') {
				var photo = artistList[arrayObjectIndexOf(artistList, 'name', selectedArtist)].photo;

				songList.forEach(function(song, id){
					if(song.artist.indexOf(selectedArtist) != -1 && (song.language == filterLanguageID || filterLanguageID == 0)) {
						rows.push(<SongRow
							id={id}
							song={song}
							songData={this.props.songData}
							key={'song-' + id}
							photo={photo}
						/>);
					}
				}.bind(this));
			} else {
				rows = <div className="empty-data">Select an artist</div>;
			}
		}

		return(
			<div className="song-list-wrapper list-scroll">
				<ul>
					{rows}
				</ul>
			</div>
		);
	}
});

/**
 * ----------------------------
 * Play List
 * ----------------------------
 */

var PlayList = React.createClass({
	render: function() {
		if(this.props.songData.songPlayList.length != 0) {
			var rows = [];
			var songPlayList = this.props.songData.songPlayList;
			var songList = this.props.songData.songList;
			var artistList = this.props.songData.artistList;

			for(var i=0; i < songPlayList.length; i++) {
				var id = songPlayList[i];
				var song = songList[id];
				var artist = song.artist;
				var photo = artistList[arrayObjectIndexOf(artistList, 'name', artist)].photo;

				rows.push(<SongRow
					id = {id}
					song = {song}
					songData = {this.props.songData}
					key = {'play-' + i}
					photo = {photo}
				/>);
			}
		} else {
			rows = <div className="empty-data">Empty Playlist</div>;
		}

		return(
			<div className="play-list-wrapper list-scroll">
				<ul>
					{rows}
				</ul>
			</div>
		);
	}
});

/**
 * ----------------------------
 * History List
 * ----------------------------
 */

var HistoryList = React.createClass({
	render: function() {
		if (this.props.songData.historyList.length != 0) {
			var rows = [];
			var historyList = this.props.songData.historyList;
			var songList = this.props.songData.songList;
			var artistList = this.props.songData.artistList;

			for(var i=historyList.length - 1; i >= 0; i--) {
				var id = historyList[i];
				var song = songList[id];
				var artist = song.artist;
				var photo = artistList[arrayObjectIndexOf(artistList, 'name', artist)].photo;

				rows.push(<SongRow
					id = {id}
					song = {song}
					songData = {this.props.songData}
					key = {'history-' + i}
					photo = {photo}
				/>);
			}
		} else {
			rows = <div className="empty-data">Empty History List</div>;
		}

		return(
			<div className="history-list-wrapper list-scroll">
				<ul>
					{rows}
				</ul>
			</div>
		);
	}
});

/**
 * ----------------------------
 * Search Bar
 * ----------------------------
 */

var SearchBar = React.createClass({
	handleChange: function(e) {
		var targetValue = e.target.value;

		this.props.onSearchInput(targetValue);
	},

	render: function() {
		return(
			<div className="songFilter">
				<input
					type="text"
					placeholder="Enter song or artist name"
					name="searchTextInput"
					onChange={this.handleChange}
				/>
			</div>
		);
	}
});

/**
 * ----------------------------
 * Search List
 * ----------------------------
 */

var SearchList = React.createClass({
	render: function() {
		if (this.props.songData.songList.length !=0 && this.props.searchText != '') {
			var rows = [];
			var songData = this.props.songData;
			var songList = this.props.songData.songList;
			var artistList = this.props.songData.artistList;
			var searchText = this.props.searchText;
			var searchLanguage = this.props.searchLanguage;

			songList.forEach(function(song, id) {

				// Check if song is not include search text
				if(song.songArtist.indexOf(searchText) === -1 && song.title.indexOf(searchText) == -1) {
					return;
				}

				var photo = artistList[arrayObjectIndexOf(artistList, 'name', song.artist)].photo;

				rows.push(<SongRow
					id={id}
					song={song}
					songData={songData}
					key={'song-' + id}
					photo={photo}
				/>);
			});
		} else {
			rows = <div className="empty-data">Enter search words</div>;
		}

		return(
			<div className="search-list-wrapper">
				<SearchBar
					searchText={this.props.searchText}
					onSearchInput={this.props.onSearchInput}
				/>
				<div className="list-scroll">
					<ul>
						{rows}
					</ul>
				</div>
			</div>
		);
	}
});

/**
 * ----------------------------
 * Song Controller
 * ----------------------------
 */

var SongController = React.createClass({
	ctrlAction: function(e) {
		var type = e.currentTarget.value;
		if (type == 'more') {
			$('.audio-controller').toggleClass('active');
			$('.more-btn').toggleClass('active');
		} else {
			this.props.onSongCtrlAction(type);
		}
	},

	render: function() {
		var playSVG, playText, analogSVG, analogText;

		// Pause and play
		if(this.props.songData.playState) {
			playSVG = '#svg_pause';
			playText = 'Pause';
		} else if(!this.props.songData.playState) {
			playSVG = '#svg_play';
			playText = 'Play';
		}

		// Analog
		if(this.props.songData.analogState) {
			analogSVG = '#svg_analog_off';
			analogText = 'Vocal Off';
		} else if(!this.props.songData.analogState) {
			analogSVG = '#svg_analog_on';
			analogText = 'Vocal On';
		}

		return(
			<div className="song-controller-wrapper">
				<ul className="main-controller">
					<li><a onClick={this.ctrlAction} value="next">
						<svg className="svg-36 svg-round"><use xlinkHref="#svg_play_next"></use></svg>
						<span>Next</span>
					</a></li>
					<li><a onClick={this.ctrlAction} value="pause">
						<svg className="svg-36 svg-round"><use xlinkHref={playSVG}></use></svg>
						<span>{playText}</span>
					</a></li>
					<li><a onClick={this.ctrlAction} value="replay">
						<svg className="svg-36 svg-round"><use xlinkHref="#svg_replay"></use></svg>
						<span>Replay</span>
					</a></li>
					<li className="more-btn"><a onClick={this.ctrlAction} value="more">
						<svg className="svg-36 svg-round"><use xlinkHref="#svg_more"></use></svg>
						<span>More</span>
					</a></li>
				</ul>
				<ul className="audio-controller">
					<li><a onClick={this.ctrlAction} value="vocal">
						<svg className="svg-36 svg-round"><use xlinkHref={analogSVG}></use></svg>
						<span>{analogText}</span>
					</a></li>
					<li><a onClick={this.ctrlAction} value="pitch-up">
						<svg className="svg-36 svg-round"><use xlinkHref="#svg_pitch_up"></use></svg>
						<span>Pitch Up</span>
					</a></li>
					<li><a onClick={this.ctrlAction} value="pitch-down">
						<svg className="svg-36 svg-round"><use xlinkHref="#svg_pitch_down"></use></svg>
						<span>Pitch Down</span>
					</a></li>
					<li><a onClick={this.ctrlAction} value="pitch-reset">
						<svg className="svg-36 svg-round"><use xlinkHref="#svg_pitch_reset"></use></svg>
						<span>Pitch Reset</span>
					</a></li>
				</ul>
			</div>
		);
	}
});


/**
 * ----------------------------
 * Song Panel
 * ----------------------------
 */

var SongPanel = React.createClass({
	// Inital Setting
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

		songCtrl.onSetRole('remote');

		songCtrl.onUpdateSongList(function(songData) {
			this.setState({songData: songData});
		}.bind(this));

		return {
			searchText: '',
			searchGender: 'all',
			searchLanguage: 'all',
			filterGender: 'all',
			filterLanguage: 'all',
			selectedArtist: '',
			songData: songData,
			listState: 'Artist',
			artistPanelStep: 'step-1',
			mainPanelStep: 'artist',
			message: {
				active: 'hide',
				title:'',
				text:'',
				artist:'',
				id:'',
				type:''
			}
		}
	},

	// Artist - artist panel
	updateFilter: function(filterGender, filterLanguage) {
		this.setState({
			filterGender: filterGender,
			filterLanguage: filterLanguage,
			selectedArtist:'',
			artistPanelStep: 'step-2'
		});

		$('.artist-list-wrapper').scrollTop(0);
	},

	// Artist - song panel
	updateArtist: function(name) {
		this.setState({
			selectedArtist: name,
			artistPanelStep: 'step-3'
		});

		$('.song-list-wrapper').scrollTop(0);
	},

	returnStep: function() {
		if(this.state.artistPanelStep == 'step-3') {
			this.setState({
				artistPanelStep: 'step-2'
			});
		} else if (this.state.artistPanelStep == 'step-2') {
			this.setState({
				artistPanelStep: 'step-1'
			});
		}
		console.log(this.state.artistPanelStep)
	},

	// Switch between sections
	toggleMainPanel: function(type) {
		if (type == 'artist') {
			this.setState({
				selectedArtist: '',
				artistPanelStep: 'step-1',
				mainPanelStep: type
			});
		} else if (type == 'playlist' || type == 'history' || type == 'search') {
			this.setState({
				selectedArtist: '',
				mainPanelStep: type
			});
		}
	},

	// System control panel
	songCtrlAction: function(type) {
		if (type == 'next') {
			var id = this.state.songData.songPlayList[1];
			var title = this.state.songData.songList[id].title;
			var artist = this.state.songData.songList[id].songArtist;
			
			this.setState({
				message: {
					active: 'show',
					text: 'Do you want to play next',
					title: title,
					artist: artist,
					id: id,
					type:'next'
				}
			});
		} else if (type == 'pause') {
			songCtrl.onPlayAction(!this.state.songData.playState);
		} else if (type == 'replay') {
			songCtrl.onReplayAction();
		} else if (type == 'vocal') {
			songCtrl.onAnalogAction(!this.state.songData.analogState);
		} else if (type == 'pitch-up') {
			var pitch = Math.round((this.state.songData.pitch + 0.05) * 10) / 10;
			if(pitch > 1) {pitch = 1;}
			songCtrl.onUpdatePitch(pitch);
		} else if (type == 'pitch-down') {
			var pitch = Math.round((this.state.songData.pitch - 0.05) * 10) / 10;
			if(pitch < -1) {pitch = -1;}
			songCtrl.onUpdatePitch(pitch);
		} else if (type == 'pitch-reset') {
			songCtrl.onUpdatePitch(0);
		}
	},

	// Song slider action
	songSliderAction: function(id, type, title, artist) {
		if (type == 'add') {
			songCtrl.onAddSong(id);
		} else if (type == 'cut') {
			this.setState({
				message: {
					active: 'show',
					text: 'Do you want to play next?',
					title: title,
					artist: artist,
					id: id,
					type:'cut'
				}
			})
		} else if (type == 'remove') {
			this.setState({
				message: {
					active: 'show',
					text: 'Do you want to delete?',
					title: title,
					artist: artist,
					id: id,
					type:'remove'
				}
			})
		} else if (type == 'next') {
			var id = this.state.songData.songPlayList[1];
			var title = this.state.songData.songList[id].title;
			var artist = this.state.songData.songList[id].songArtist;
			
			this.setState({
				message: {
					active: 'show',
					text: 'Do you want to play next?',
					title: title,
					artist: artist,
					id: id,
					type:'next'
				}
			});
		}
	},

	// Message panel feedback
	onMessageFeedback: function(e) {
		if(e.currentTarget.value == 'yes' && this.state.message.type == 'cut') {
			songCtrl.onCutSong(this.state.message.id);
		} else if(e.currentTarget.value == 'yes' && this.state.message.type == 'remove') {
			songCtrl.onRemoveSong(this.state.message.id);
		} else if(e.currentTarget.value == 'yes' && this.state.message.type == 'next') {
			songCtrl.onNextAction();
		}

		this.setState({
			message: {
				active: 'hide'
			}
		});
	},

	handleSearchInput: function(text) {
		this.setState({
			searchText: text
		});
	},

	render: function() {
		return (
			<div className="songPanelWrapper">
				<div className={'messageWrapper ' + this.state.message.active}>
					<div className="messagePanel">
					<div className="messageContent">
							<h1>{this.state.message.text}</h1>
							<h2>{this.state.message.title}</h2>
							<h3>{this.state.message.artist}</h3>
						</div>
						<a className="yesBtn" onClick={this.onMessageFeedback} value="yes"><svg><use xlinkHref="#svg_yes"></use></svg></a>
						<a className="noBtn" onClick={this.onMessageFeedback} value="no"><svg><use xlinkHref="#svg_no"></use></svg></a>
					</div>
				</div>
				<SongHeader 
					onReturnStep={this.returnStep}
					artistPanelStep={this.state.artistPanelStep}
					mainPanelStep={this.state.mainPanelStep}
				/>
				<SongMenu
					onToggleMainPanel={this.toggleMainPanel}
					mainPanelStep={this.state.mainPanelStep}
				/>
				<div className={"list-wrapper " + this.state.mainPanelStep}>
					<div className={"artist-main-wapper " + this.state.artistPanelStep}>
						<CategoryList
							songData={this.state.songData}
							onUpdateFilter={this.updateFilter}
						/>
						<ArtistList
							songData={this.state.songData}
							filterGender={this.state.filterGender}
							filterLanguage={this.state.filterLanguage}
							onUpdateArtist={this.updateArtist}
						/>
						<SongList
							songData={this.state.songData}
							selectedArtist={this.state.selectedArtist}
							filterLanguage={this.state.filterLanguage}
							onSongSliderAction={this.songSliderAction}
						/>
					</div>
					<PlayList
						songData={this.state.songData}
					/>
					<HistoryList
						songData={this.state.songData}
					/>
					<SearchList
						songData={this.state.songData}
						searchText={this.state.searchText}
						searchGender={this.state.searchGender}
						searchLanguage={this.state.searchLanguage}
						onSearchInput={this.handleSearchInput}
					/>
				</div>
				<SongController
					onSongCtrlAction={this.songCtrlAction}
					songData={this.state.songData}
				/>
			</div>
		);
	}
});



ReactDOM.render(
	<SongPanel />,
	document.getElementById('main')
);


// fast click
$(function() {
    FastClick.attach(document.body);
});