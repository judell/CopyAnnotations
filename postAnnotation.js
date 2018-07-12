self.importScripts("https://jonudell.info/hlib/hlib.bundle.js");

// listen for requests to import annotations for a zotero item
self.addEventListener('message', function (e) {
  // spread the api calls
  let delay = Math.floor(Math.random() * Math.floor(10000))
  setTimeout(function() {
    postAnnotation(e.data.payload, e.data.token)
  }, delay)
})

function postAnnotation(payload, token) {
  hlib.postAnnotation(payload, token)
    .then( data => {
      self.postMessage({
        'success': data.response
      })
    })
    .catch( e => {
      self.postMessage({
        'exception': e
      })
    })
}

