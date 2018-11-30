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
$('#logged-in-content').style.display = 'none'
$('#response').style.display = 'none'
$('#login').onclick = () => auth.popupLogin({"popupUri": "/popup.html"})
$('#logout').onclick = () => auth.logout()
$('#upload').onclick = () => {
	const url = encodeURI($('#url').value).replace(/\/?$/, '/')
	const files = $('#files').files
	for (var i=0; i<files.length; i++) {
		auth.fetch(url+encodeURIComponent(files[i].name),
			{ method: 'PUT', body: files[i] })
		.then(showResponse)
	}
}
$('#delete').onclick = () => {
	const url = encodeURI($('#url').value).replace(/\/?$/, '/')
	const files = Array.from($('#dir').querySelectorAll('.node')).filter(
		node => node.querySelector('.node-check input').checked)
	for (var i=0; i<files.length; i++) {
		auth.fetch(url+encodeURIComponent(files[i]
				.querySelector('.node-name').textContent), {
			method: 'DELETE'
		}).then(showResponse)
	}
}
$('#download').onclick = () => {
	// downloads turtle file for dirs
	const url = encodeURI($('#url').value).replace(/\/?$/, '/')
	const files = Array.from($('#dir').querySelectorAll('.node')).filter(
		node => node.querySelector('.node-check input').checked)
	for (var i=0; i<files.length; i++) {
		Promise.all([
			auth.fetch(url+encodeURIComponent(
				files[i].querySelector('.node-name').textContent),
				{ method: 'GET' }),
			files[i]])
		.then(([response, file]) => {
			return Promise.all([response.blob(), file])
		}).then(([blob, file]) => {
			console.log(file.querySelector('.node-name').textContent)
			let link = document.createElement('a')
			link.href = window.URL.createObjectURL(blob)
			link.target = '_blank'
			link.download = file.querySelector('.node-name').textContent
			document.body.appendChild(link)
			link.click()
			link.remove()
		})
	}
}

auth.trackSession(session => {
	const loggedIn = !!session
	toggle($('#logged-out-content'), !loggedIn)
	toggle($('#logged-in-content'), loggedIn)
	if (session)
		$('#user').textContent = session.webId
})

async function showResponse(response) {
	const data = await response.text()
	$('#response p').textContent = data
	toggle($('#response'), true)
}

// directory listing
$('#view').onclick = () => loadDir($('#url').value)

const LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#')
const NS = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const STAT = $rdf.Namespace('http://www.w3.org/ns/posix/stat#')
const TERMS = $rdf.Namespace('http://purl.org/dc/terms/')

async function loadDir(uri) {
	uri = encodeURI(uri.replace(/\/?$/, '/'))
	const store = $rdf.graph()
	const fetcher = new $rdf.Fetcher(store)

	await fetcher.load(uri)
	// get list of all nodes in dir
	const nodes = store.each($rdf.sym(uri), LDP('contains'))
	// delete the current nodes
	$('#dir').querySelectorAll('.node')
		.forEach((el) => {
			if (el.querySelector('.node-name').textContent !== 'example')
				el.parentNode.removeChild(el)
		})
	for (var i=0; i<nodes.length; i++) {
		const type = getType(store.each(nodes[i], NS('type')))
		// add a new node
		let node = $('#dir .node').cloneNode(true)
		node.querySelector('.node-name').textContent = decodeURIComponent(
			nodes[i].value.replace(uri, ''))
		node.querySelector('.node-name').onclick = (e) => nodeNameClick(e.target)
		node.querySelector('.node-type').textContent = type
		node.querySelector('.node-modified').textContent = new Date(
			store.any(nodes[i], TERMS('modified'))).toLocaleString()
		node.querySelector('.node-size').textContent = store.any(
			nodes[i], STAT('size'))
		toggle(node, true)
		$('#dir tbody').appendChild(node)
	}
}

function getType(types) {
	for (var i=0; i<types.length; i++) {
		if (/^http:\/\/www\.w3\.org\/ns\/iana\/media-types\//
		.test(types[i].value)) {
			return types[i].value
			.replace(/^http:\/\/www\.w3\.org\/ns\/iana\/media-types\//, '')
			.replace(/#.*$/, '')
		}
	}
	return 'directory'
}

async function nodeNameClick(el) {
	el.parentNode.querySelector('.node-check input').checked ^= true;
}
