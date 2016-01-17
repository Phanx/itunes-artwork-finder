var express = require("express")
var app = express()

// Set up templating engine
app.set("view engine", "jade")
app.set("views", "views")

// Serve static files from the public directory
app.use(express.static(__dirname + "/public"))

// Handle search queries
app.get("/search", require("./routes/search.js"))

// Default page
app.get("/", function(req, res) {
	res.render("index")
})

// Start the server
app.set("port", process.env.PORT || 10101)
app.listen(app.get("port"), function() {
	console.log("Serving on port " + app.get("port"))
})
