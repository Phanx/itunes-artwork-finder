var urlParse = require("url-parse")

module.exports = function(req, res) {
	var search  = req.query.query
	if (search) {
		var entity = req.query.entity || "tvSeason"
		var country = req.query.country || "us"

		var shortFilm = false
		if (entity === "shortFilm") {
			shortFilm = true
			entity = "movie"
		}

		var http, url
		if (entity == "id") {
			http = require("https")
			url = "https://itunes.apple.com/lookup?id="
				+ encodeURIComponent(search)
				+ "&country=" + country
		} else {
			http = require("http")
			url = "http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/wa/wsSearch?term="
				+ encodeURIComponent(search)
				+ "&country=" + country
				+ "&entity=" + entity
			if (shortFilm) {
				url += "&attribute=shortFilmTerm"
				entity = "shortFilm"
			}
		}
	}

	var fetched = ""
	console.log("Sending request: " + url)
	http.get(url, (getres) => {
		console.log("Request status: " + getres.statusCode)
		getres.on("data", function(data) {
			console.log("Request data: "/* + data */)
			fetched = fetched + data
		})
		getres.on("end", function() {
			console.log("Request finished!")
			var data = JSON.parse(fetched)

			var results = []
			for (var result of data.results) {
				var data = {
					height : 600,
					width  : 600,
					warning: ""
				}
				data.url = result.artworkUrl100.replace("100x100", "600x600")

				var hires = result.artworkUrl100.replace("100x100bb", "100000x100000-999")
				var parts = urlParse(hires)
				hires = "http://is5.mzstatic.com" + parts.path
				data.hires = hires

				switch (entity) {
					case "musicVideo":
						data.title = result.trackName + " (by " + result.artistName + ")"
						data.url = hires
						data.width = 640
						data.height = 464
						break
					case "tvSeason":
						data.title = result.collectionName
						break
					case "movie":
					case "id":
					case "shortFilm":
						data.title = result.trackName
						data.url = hires
						data.width = 400
						data.warning = "(may not work)"
						break
					case "ebook":
						data.title = result.trackName + " (by " + result.artistName + ")"
						data.width = 400
						data.warning = "(probably won‘t work)"
						break
					case "album":
						data.title = result.collectionName + " (by " + result.artistName + ")"
						break
					case "audiobook":
						data.title = result.collectionName + " (by " + result.artistName + ")"
						data.warning = "(probably won‘t work)"
						break
					case "podcast":
						data.title = result.collectionName + " (by " + result.artistName + ")"
						break
					case "software":
						data.title = result.trackName
						data.url = result.artworkUrl512.replace("512x512bb", "1024x1024bb")
						data.appstore = result.trackViewUrl
						data.width = 512
						data.height = 512
						break
					default:
						break
				}

				if (data.title) {
					results.push(data)
				}
			}
			return res.status(200).json(results)
		})
	})
	.on("error", (err) => {
		console.log("Request error: " + err.message)
		return res.send(200).json({ error: err.message })
	})
}
