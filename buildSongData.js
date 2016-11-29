var fs = require('fs');
var path = require('path');


// convert diretory tree to JSON
var diretoryTreeToObj = function(dir, done) {
	var results = [];

	fs.readdir(dir, function(err, list) {
		if (err)
			return done(err);

		var pending = list.length;

		if (!pending)
			return done(null, {name: path.basename(dir), type: 'folder', children: results});

		list.forEach(function(file) {
			file = path.resolve(dir, file);
			fs.stat(file, function(err, stat) {
				if (stat && stat.isDirectory()) {
					diretoryTreeToObj(file, function(err, res) {
						results.push({
							name: path.basename(file),
							type: 'folder',
							children: res
						});
						if (!--pending)
							done(null, results);
					});
				}
				else {
					results.push({
						type: 'file',
						name: path.basename(file)
					});
					if (!--pending)
						done(null, results);
				}
			});
		});
	});
};

var dirTree = ('./song');

var content_setting = fs.readFileSync("./songSetting.json");
var songSettingJSON = JSON.parse(content_setting);
var languageData = songSettingJSON.languageType;
var artistData = songSettingJSON.artistType;

diretoryTreeToObj(dirTree, function(err, res){
	if(err)
		console.error(err);

	var jsonData = res;

	var songData = [];
	var songArtists = [];

	// artist type
	jsonData.forEach(function(artistTypelist) {
		var artistType = artistTypelist.name;
		if(artistType != '_temp' && artistType != '.DS_Store') {
			var genderID;

			for(i=0; i<artistData.length; i++) {
				if(artistData[i].name == artistType) {
					genderID = i;
				}
			}

			// signer
			artistTypelist.children.forEach(function(artistList) {
				var artist = artistList.name;
				if(artist != '.DS_Store') {
					
					console.log('----- ' + artist + ' -----');
					
					var languages = [];

					// language
					artistList.children.forEach(function(languageList) {
						var language = languageList.name;
						var child = languageList.children;

						if(languageList.type == 'folder' && languageList.children.name == undefined) {
							var songCounter = 0;
							var languageID;

							for(i=0; i<languageData.length; i++) {
								if(languageData[i].name == language) {
									languageID = i;
								}
							}

							languageList.children.forEach(function(file) {
								if(file.name != '.DS_Store') {

									console.log(file.name);

									var fileName = file.name.split('-');
									var artistName = fileName[0];
									var titleName = fileName[1].split('.');

									songData.push({
										"artist": artist,
										"songArtist": artistName,
										"title": titleName[0],
										"url": artistType + '/' + artist + '/' + language + '/' + file.name,
										"language":languageID,
										"gender": genderID
									});

									songCounter ++;
								}
							});

							languages.push({
								id: languageID,
								quantity: songCounter
							});
						}
					});

					// check if contains artist photo
					var artistImg = '';

					for(var i = 0; i < artistList.children.length; i++) {
						var target = artistList.children[i];
						if (target.type == 'file' && (target.name.includes('jpg') || target.name.includes('jpg'))) {
							artistImg = artistType + '/' + artist + '/' + target.name;
						}
					}

					songArtists.push({
						'name': artistList.name,
						"gender": genderID,
						'photo': artistImg,
						'languages':languages
					});
				}
			});
		}
	});

	fs.writeFile('./songData.json', JSON.stringify(songData), function() {
		console.log('The song data has been successfully converted!')
	});

	fs.writeFile('./songArtists.json', JSON.stringify(songArtists), function() {
		console.log('The song artist has been successfully converted!')
	});
});