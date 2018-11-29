// quality-of-life reassignments
const $ = (el) => document.querySelector(el)
function toggle(el, show) {
	if (!el) return
	if (show)
		el.style.display = ''
	else
		el.style.display = 'none'
}
const auth = solid.auth

// basic DOM flow stuff
$('.logged-in').style.display = 'none'
$('#response').style.display = 'none'
$('#login').onclick = () => auth.popupLogin({"popupUri": "/popup.html"})
$('#logout').onclick = () => auth.logout()
$('#upload').onclick = () => {
	const files = $('#files').files
	const uri = encodeURI($('#uri').value).replace(/\/?$/, '/')
	for (i=0; i<files.length; i++) {
		auth.fetch(uri+files[i].name, { method: 'PUT', body: files[i] })
		.then(showResponse)
	}
}
$('#delete').onclick = () => {
	const uri = encodeURI($('#uri').value)

	auth.fetch(uri, {
		method: 'DELETE'
	}).then(showResponse)
}

auth.trackSession(session => {
	const loggedIn = !!session
	toggle($('.logged-out'), !loggedIn)
	toggle($('.logged-in'), loggedIn)
	if (session)
		$('#user').textContent = session.webId
})

async function showResponse(response) {
	const data = await response.text()
	$('#response p').textContent = data
	$('#response').style.display = ''
}

// directory listing
$('#view').onclick = () => loadDir($('#url').value)

const LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#')
const NS = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')

async function loadDir(uri) {
	const store = $rdf.graph()
	const fetcher = new $rdf.Fetcher(store)

	await fetcher.load(uri)
	console.log(store)
	// get list of all nodes in dir
	const nodes = store.each($rdf.sym(uri), LDP('contains'))
	console.log(store.statementsMatching(undefined, NS('type'), LDP('Container')))
	for (i=0; i<nodes.length; i++) {
		console.log(store.each(nodes[i], NS('type')))
	}
}
