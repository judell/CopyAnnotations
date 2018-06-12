import * as hlib from '../../hlib/hlib'

function logWrite(msg) {
  console.log(msg)
  hlib.getById('viewer').innerHTML = `<div>${msg}</div>`
}

function logAppend(msg) {
  console.log(msg);
  hlib.getById('viewer').innerHTML += `<div>${msg}</div>`
}

// main entry point, wired to copy button
function copy() {
}

let tokenContainer = hlib.getById('tokenContainer')
hlib.createApiTokenInputForm(tokenContainer)

let userContainer = hlib.getById('userContainer')
hlib.createUserInputForm(userContainer)

let argsSourceDomain:hlib.inputFormArgs = {
  element: hlib.getById('sourceDomainContainer'),
  name: 'source domain',
  id: 'sourceDomain',
  value: '',
  onchange: '',
  type: '',
  msg: 'domain from which to copy (e.g. site1.org)'
}
hlib.createNamedInputForm(argsSourceDomain)

let argsDestDomain:hlib.inputFormArgs = {
  element: hlib.getById('destinationDomainContainer'),
  name: 'destination domain',
  id: 'destinationDomain',
  value: '',
  onchange: '',
  type: '',
  msg: 'domain to which to copy (e.g. site2.net)'
}
hlib.createNamedInputForm(argsDestDomain)

let argsSourceGroup:hlib.inputFormArgs = {
  element: hlib.getById('sourceGroupContainer'),
  name: 'source group',
  id: 'sourceGroup',
  value: '',
  onchange: '',
  type: '',
  msg: 'group from which to copy annotations'
}
hlib.createNamedInputForm(argsSourceGroup)

let argsDestGroup:hlib.inputFormArgs = {
  element: hlib.getById('destinationGroupContainer'),
  name: 'destination group',
  id: 'destinationGroup',
  value: '',
  onchange: '',
  type: '',
  msg: 'group to which to copy annotations'
}
hlib.createNamedInputForm(argsDestGroup)

let argsLimit:hlib.inputFormArgs = {
  element: hlib.getById('limitContainer'),
  name: 'max annotations',
  id: 'maxAnnotations',
  value: '',
  onchange: '',
  type: '',
  msg: 'max annotations to copy (use a small number for a sanity check)'
}
hlib.createNamedInputForm(argsLimit)

let destinationDomainContainer = hlib.getById('destinationDomainContainer')

let sourceGroupContainer = hlib.getById('sourceGroupContainer')

let destinationGroupContainer = hlib.getById('destinationGroupContainer')

