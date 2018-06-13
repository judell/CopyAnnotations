//import * as hlib from '../../hlib/hlib'

function logWrite(msg:string) {
  console.log(msg)
  hlib.getById('viewer').innerHTML = `<div>${msg}</div>`
}

function logAppend(msg:string) {
  console.log(msg);
  hlib.getById('viewer').innerHTML += `<div>${msg}</div>`
}

// main entry point, wired to copy button
function copy() {
  let textArea = hlib.getById('urlListContainer') as HTMLTextAreaElement
  let urlListText = textArea.value
  let urls = urlListText.split('\n')
  urls = urls.filter(url => { if (url) { return url } })
  console.log(urls)
  urls.forEach(url => {
    let sourceGroup = hlib.getSelectedGroup('sourceGroupsList')
    let params:any =  {
      uri: url,
      group: sourceGroup,
    }
    hlib.hApiSearch(params,  _copy)
  })
}

function _copy(rows:any[]) {
  let destinationDomainForm = hlib.getById('destinationDomainForm') as HTMLInputElement
  let destinationDomain = destinationDomainForm.value
  let destinationGroup = hlib.getSelectedGroup('destinationGroupsList')
  let username = hlib.getUser()
  rows.forEach(row => {
    console.log(destinationDomain, 'row before', row)
    let a = document.createElement('a')
    a.href = row.uri
    let sourceDomain = `${a.protocol}//${a.hostname}`
    let rowText = JSON.stringify(row)
    let regex = new RegExp(sourceDomain, 'g')
    rowText = rowText.replace(regex, destinationDomain)
    row = JSON.parse(rowText)
    row.user = `${username}@hypothes.is`
    row.group = destinationGroup
    // these are probably ignored, but..    
    delete row.user_info  
    delete row.flagged
    delete row.hidden
    delete row.moderation
    row.permissions = hlib.createPermissions(username, destinationGroup)
    console.log('row after', row)
    hlib.postAnnotation(JSON.stringify(row), hlib.getToken())
      .then(data => {
        console.log(data)
      })
  }
}

let tokenContainer = hlib.getById('tokenContainer')
hlib.createApiTokenInputForm(tokenContainer)

let userContainer = hlib.getById('userContainer')
hlib.createUserInputForm(userContainer)

hlib.createFacetInputForm(
  hlib.getById('destinationDomainContainer'),
  'destinationDomain',
  'domain to which to copy (e.g. site1.org)'
)

/*
hlib.createGroupInputForm creates a single picker, here we need two. So we create it twice, then
(after a suitable delay) to adjust their labels, ids, and messages.

From TypeScript's point of view, document.querySelector can return HTMLElement or null.
With strict checking turned on, all use of the method produces the 'object is possibly null' message.
I don't want to turn off strict type checking. An alternative is to use the non-null assertion operator, !
(see https://hyp.is/BazwXG5YEeib9fdjuAT_GQ/www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html)
But I'm not sure I like doing that either.
*/
function adjustGroupPicker(groupContainer:string, label:string, id:string, message:string) {
  let picker = document.querySelector(groupContainer)!
  picker.querySelector('.formLabel')!.innerHTML = label
  let select:HTMLSelectElement = picker.querySelector('select')!
  select.removeAttribute('onchange')
  select.id = id
  picker.querySelector('.formMessage')!.innerHTML = message
}

let sourceGroupContainer = hlib.getById('sourceGroupContainer')
hlib.createGroupInputForm(sourceGroupContainer, 'sourceGroupList')

setTimeout( function() {
  adjustGroupPicker(
    '#sourceGroupContainer', 
    'sourceGroup', 
    'sourceGroupsList', 
    'group from which to copy annotations')
}, 1000)

let destinationGroupContainer = hlib.getById('destinationGroupContainer')
hlib.createGroupInputForm(destinationGroupContainer, 'destinationGroupList')

setTimeout( function() {
  adjustGroupPicker(
    '#destinationGroupContainer', 
    'destinationGroup', 
    'destinationGroupsList', 
    'group to which to copy annotations')
}, 1000)

hlib.createFacetInputForm(
  hlib.getById('limitContainer'), 
  'maxAnnotations', 
  'max annotations to copy (use a small number for testing)'
)

hlib.getById('destinationDomainForm').value = 'http://bouncer.jonudell.info'

