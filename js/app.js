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

$('.logged-in').style.display = 'none'
$('#response').style.display = 'none'
$('#login').onclick = popupLogin
$('#logout').onclick = auth.logout

async function popupLogin() {
	let session = await auth.currentSession()
	const popupUri = '/popup.html'
	if (!session)
		session = await auth.popupLogin({ popupUri })
}

solid.auth.trackSession(session => {
	const loggedIn = !!session
	toggle($('.logged-out'), !loggedIn)
	toggle($('.logged-in'), loggedIn)
	if (session)
		$('#user').textContent = session.webId
})

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
	console.log(uri)

	solid.auth.fetch(uri, {
		method: 'DELETE'
	}).then(showResponse)
}

async function showResponse(response) {
	const data = await response.text()
	$('#response p').textContent = data
	$('#response').style.display = ''
}
