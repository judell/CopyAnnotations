import * as hlib from '../../hlib/hlib'

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
    _copy(['a'],[])
  })
}

function _copy(replies:any, annotations:any) {
  let sourceDomainForm = hlib.getById('sourceDomainForm') as HTMLInputElement
  let sourceDomain = sourceDomainForm.value
  let destinationDomainForm = hlib.getById('destinationDomainForm') as HTMLInputElement
  let destinationDomain = destinationDomainForm.value
  console.log(sourceDomain, destinationDomain, replies)
}

let tokenContainer = hlib.getById('tokenContainer')
hlib.createApiTokenInputForm(tokenContainer)

let userContainer = hlib.getById('userContainer')
hlib.createUserInputForm(userContainer)

hlib.createFacetInputForm(
  hlib.getById('sourceDomainContainer'),
  'sourceDomain',
  'domain from which to copy (e.g. site1.org)'
)

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
hlib.createGroupInputForm(sourceGroupContainer)
setTimeout( function() {
  adjustGroupPicker(
    '#sourceGroupContainer', 
    'sourceGroup', 
    'sourceGroupsList', 
    'group from which to copy annotations')
}, 500)

let destinationGroupContainer = hlib.getById('destinationGroupContainer')
hlib.createGroupInputForm(destinationGroupContainer)
setTimeout( function() {
  adjustGroupPicker(
    '#destinationGroupContainer', 
    'destinationGroup', 
    'destinationGroupsList', 
    'group to which to copy annotations')
}, 500)

hlib.createFacetInputForm(
  hlib.getById('limitContainer'), 
  'maxAnnotations', 
  'max annotations to copy (use a small number for testing)'
)



