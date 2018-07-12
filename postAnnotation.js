self.importScripts("https://jonudell.info/hlib/hlib.bundle.js");

// listen for requests to import annotations for a zotero item
self.addEventListener('message', function (e) {
  // spread the api calls
  let delay = Math.floor(Math.random() * Math.floor(10000))
  let group = JSON.parse(e.data.payload).group
  setTimeout(function() {
    hlib.postAnnotation(e.data.payload, e.data.token)
      .then(data => {
        response = JSON.parse(data.response)
        if (group === response.group) { // the response is an object with a group property that matches the destination group
          self.postMessage({
            'success': data.response
          })
        } else {
          self.postMessage({
            'failure': data.response
          })
        }
      })
      .catch( e => { // the httpRequest promise was rejected
        self.postMessage({
          'exception': JSON.parse(JSON.stringify(e)) // https://stackoverflow.com/questions/42376464/uncaught-domexception-failed-to-execute-postmessage-on-window-an-object-co
        })
      })
  }, delay)
})

