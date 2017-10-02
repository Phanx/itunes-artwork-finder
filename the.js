"use strict"

let activeCallbackName

const getRandomInt = (len) => {
	const min = Math.pow(10, len - 1)
	const max = Math.pow(10, len) - 1
	return Math.floor(Math.random() * (max - min + 1)) + min
}

const getCallbackName = () => {
	return "handleItunesSearchResults" + getRandomInt(6)
}

const getSearchParameters = () => {
	const params = {}
	window.location.search.substr(1).split("&").forEach(param => {
		const pair = param.split("=")
		params[pair[0]] = decodeURIComponent(pair[1]).replace("+"," ")
	})
	return params
}

const getSearchURL = (country, entity, term) => {
	const callbackName = getCallbackName()

	const url = "https://itunes.apple.com/search" +
		"?term=" + encodeURIComponent(term).replace("%20", "+") +
		"&country=" + country + 
		"&entity=" + entity +
		"&limit=25" +
		"&callback=" + callbackName

	console.log("getSearchURL", url)
	return { url, callbackName }
}

const renderResult = (result, targetElement) => {
	console.log("renderResult", result)

	const smallImage = result.artworkUrl100.replace("100x100", "600x600")
	const largeImage = result.artworkUrl100.replace("100x100bb", "100000x100000-999").replace("//is3.mzstatic.com", "//is5.mzstatic.com")

	let title    = result.collectionName
	let subtitle = null
	let width    = 600
	let height   = 600

	if (result.kind === "ebook") {
		title = result.trackName
		subtitle = result.artistName
		width = 400
	} else if (result.collectionType === "Album" || result.collectionType === "Compilation") {
		subtitle = result.artistName
	} else if (result.kind === "feature-movie") {
		title = result.trackName
	}

	const figure = document.createElement("figure")

	const a = document.createElement("a")
	a.href = largeImage

	const img = document.createElement("img")
	img.alt = ""
	img.src = smallImage
	img.height = height
	img.width = width
	a.appendChild(img)

	const figcaption = document.createElement("figcaption")
	if (subtitle) {
		const span = document.createElement("span")
		span.classList.add("subtitle")
		span.textContent = subtitle
		figcaption.appendChild(span)
	}
	figcaption.appendChild(document.createTextNode(title))
	a.appendChild(figcaption)

	figure.appendChild(a)
	targetElement.appendChild(figure)
}

const setButtonState = (enabled) => {
	const submit = document.getElementById("submit")
	if (enabled) {
		submit.disabled = false
		submit.textContent = "Search"
	} else {
		submit.disabled = true
		submit.textContent = "Searching..."
	}
}

const handleResponse = (response) => {
	delete window[activeCallbackName]

	console.log("handleResponse", response)
	if (response && Array.isArray(response.results) && response.results.length > 0) {
		document.body.classList.add("has-results")

		const el = document.getElementById("results")
		response.results.forEach(result => {
			renderResult(result, el)
		})
	}

	setButtonState(true)
}

const doSearch = () => {
	const country = document.getElementById("country").value || "us"
	const entity = document.getElementById("entity").value || "tvSeason"
	const term = document.getElementById("term").value

	console.log("doSearch", country, entity, term)

	setButtonState(false)

	const resultsContainer = document.getElementById("results")
	while (resultsContainer.hasChildNodes()) {
		resultsContainer.removeChild(resultsContainer.lastChild)
	}

	const { url, callbackName } = getSearchURL(country, entity, term)

	// Prevent handling response to old query
	if (activeCallbackName && window[activeCallbackName]) delete window[activeCallbackName]

	// Set up handler for current query
	activeCallbackName = callbackName
	window[callbackName] = handleResponse

	const script = document.createElement("script")
	script.src = url
	script.type = "text/javascript"
	script.crossorigin = "anonymous"
	document.body.appendChild(script)
	document.body.removeChild(script)
}

const init = () => {
	console.log("init")

	setButtonState(true)
	// ^ workaround for Firefox annoyance whereby if the page is reloaded
	// while a search is pending, the button's disabled state is persisted.

	const params = getSearchParameters()
	if (params.country && params.entity && params.term) {
		console.log("found search params in url")
		document.getElementById("country").value = params.country
		document.getElementById("entity").value = params.entity
		document.getElementById("term").value = params.term
		doSearch()
	}

	document.querySelector("form").addEventListener("submit", function(event) {
		console.log("submit")
		event.preventDefault()
		doSearch()
	})
}

init()
