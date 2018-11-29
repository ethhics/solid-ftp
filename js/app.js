const $ = (el) => document.querySelector(el)
function toggle(el, show) {
	if (!el) return
	if (show)
		el.style.display = ''
	else
		el.style.display = 'none'
}

$('.logged-in').style.display = 'none'
$('#response').style.display = 'none'
$('#login').onclick = popupLogin
$('#logout').onclick = solid.auth.logout

async function popupLogin() {
	let session = await solid.auth.currentSession()
	let popupUri = '/popup.html'
	if (!session)
		session = await solid.auth.popupLogin({ popupUri })
}

solid.auth.trackSession(session => {
	const loggedIn = !!session
	toggle($('.logged-out'), !loggedIn)
	toggle($('.logged-in'), loggedIn)
	if (session)
		$('#user').textContent = session.webId
})

$('#upload').onclick = upload
$('#delete').onclick = del

async function upload() {
	let session = await solid.auth.currentSession()
	let files = $('#files').files
	let uri = $('#uri').value

	solid.auth.fetch(uri, {
		method: 'PUT',
		body: files[0]
	}).then(showResponse)
}

async function del() {
	let session = await solid.auth.currentSession()
	let uri = $('#uri').value

	solid.auth.fetch(uri, {
		method: 'DELETE'
	}).then(showResponse)
}

async function showResponse(response) {
	let data = await response.text()
	$('#response p').textContent = data
	$('#response').style.display = ''
}
