var request = require("request")

module.exports = function(req, res) {
	var search  = req.query.query
	if (search) {
		var entity = req.query.entity || "tvSeason"
		var country = req.query.country || "us"
		var width = 600
		var height = 600
		var warning = ""

		var shortFilm = false
		if (entity === "shortFilm") {
			shortFilm = true
			entity = "movie"
		}

		var url
		if (entity == "id") {
			url = "https://itunes.apple.com/lookup?id="
				+ encodeURIComponent(search)
				+ "&country=" + country
		} else {
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

	request(url, function(err, res, body) {
		if (!err && res.statusCode == 200) {
			console.log("Request succeeded!")
		} else {
			console.log("Request failed: " + res.statusCode + ", " + err)
		}
	})
}
