import * as hlib from '../../hlib/hlib'

let maxAnnotations:number = 2

hlib.createFacetInputForm(
  hlib.getById('userContainer'),
  'user', 
  'User who will fetch and create annotations'
)

const tokenContainer = hlib.getById('tokenContainer')
hlib.createApiTokenInputForm(tokenContainer)
const clearInputButton = document.querySelector('#tokenContainer .clearInput') as HTMLElement
clearInputButton.remove()

const sourceDomainContainer = hlib.getById('sourceDomainContainer')
hlib.createFacetInputForm(
  sourceDomainContainer,
  'sourceDomain',
  `a <a href="https://web.hypothes.is/blog/using-the-new-wildcard-url-search-api-to-monitor-sitewide-annotation-activity/">wildcarded</a> 
    domain, like https://example.com/*`
)

hlib.createFacetInputForm(
  hlib.getById('limitContainer'), 
  'maxAnnotations', 
  'max annotations to copy'
)

async function createSourceGroupPicker() {
  await hlib.createGroupInputForm(hlib.getById('sourceGroupContainer'), 'sourceGroupsList')
  adjustGroupPicker(
    '#sourceGroupContainer', 
    'sourceGroup', 
    'sourceGroupsList', 
    'group from which to copy annotations'
    )
}

createSourceGroupPicker()

async function createDestinationGroupPicker() {
  await hlib.createGroupInputForm(hlib.getById('destinationGroupContainer'), 'destinationGroupsList')
  adjustGroupPicker(
    '#destinationGroupContainer', 
    'destinationGroup', 
    'destinationGroupsList', 
    'group to which to copy annotations'
    )
}
createDestinationGroupPicker()

let maxAnnotationsForm = hlib.getById('maxAnnotationsForm') as HTMLInputElement
maxAnnotationsForm.value = maxAnnotations.toString()

function checkSettings() {
  if (! validInput() ) {
    return
  }
  const { sourceDomainElement, sourceGroup, maxAnnotations } = validationHelper()
  const facetLink = `https://jonudell.info/h/facet/?group=${sourceGroup}&wildcard_uri=${sourceDomainElement.value}&max=${maxAnnotations}&expanded=true`
  hlib.getById('facetSettingsLink').innerHTML = `<a target="_settings" href=${facetLink}>click to review selected annotations</a>`
}

function checkResults() {
  const { sourceDomainElement, destinationGroup } = validationHelper()
  const facetLink = `https://jonudell.info/h/facet/?group=${destinationGroup}&wildcard_uri=${sourceDomainElement.value}&max=${maxAnnotations}&expanded=true`
  hlib.getById('facetResultsLink').innerHTML = `<a target="_results" href=${facetLink}>click to review copied annotations</a>`
}

// main entry point, wired to copy button
async function copy() {

  const { sourceDomainElement, sourceGroup, destinationGroup } = validationHelper()
  if (! validInput() ) {
    return
  }

  hlib.getById('fetchProgress').style.display = 'block'
    let params:any =  {
    wildcard_uri: sourceDomainElement.value, //https://wisc.pb.unizin.org/*
    group: sourceGroup,
    max: maxAnnotations
  }
  const [annoRows, replyRows] = await hlib.search(params, 'fetchProgress')
  _copy(annoRows)
}

function _copy(rows:any[]) {
  const progressElement = document.querySelector('#postProgress') as HTMLElement
  progressElement.style.display = 'block'
  const counterElement = progressElement.querySelector('.total') as HTMLElement
  counterElement.innerText = rows.length.toString()
  const sourceDomainElement = hlib.getById('sourceDomainForm') as HTMLInputElement
  const destinationGroup = hlib.getSelectedGroup('destinationGroupsList')
  const userForm = hlib.getById('userForm') as HTMLInputElement
  const username = userForm.value
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const originalUser = row.user
    const originalCreated = row.created.slice(0,10)
    const payload = {
      user: `${username}@hypothes.is`,
      uri: row.uri,
      tags: row.tags,
      text: row.text += `<hr>Copied from ${sourceDomainElement.value} (${originalUser}, ${originalCreated})`,
      target: row.target,
      group: destinationGroup,
      permissions: hlib.createPermissions(username, destinationGroup),
      document: row.document,
    }
    console.log(`copying to ${payload.uri}`)
    postAnnotation(payload, hlib.getToken())
  }
}

function postAnnotation(payload:any, token:string) {
  let multiplier = 50
  let millisecondsToDelay = maxAnnotations * multiplier
  let delay = Math.floor(Math.random() * Math.floor(millisecondsToDelay))
  let group = payload.group
  setTimeout(function() {
    hlib.postAnnotation(JSON.stringify(payload), token)
      .then(data => {
        const response = JSON.parse(data.response)
        if (group === response.group) { // the response is an object with a group property that matches the destination group
          const counter = document.querySelector('#postProgress .counter') as HTMLElement
          let count:number = parseInt(counter.innerText)
          count++
          counter.innerText = count.toString()
        } else { // response was 200-299 but not the object we expected
          console.log(`failure ${response}`)
        }
      })
      .catch( e => { 
        console.log(`exception ${e}`)
        })
      }, delay)
}

function adjustGroupPicker(groupContainer:string, label:string, id:string, message:string) {
  const picker = document.querySelector(groupContainer) as HTMLElement
  picker.querySelector('.formLabel')!.innerHTML = label
  const select = picker.querySelector('select') as HTMLSelectElement
  select.id = id
  select.onchange = null
  select.selectedIndex = 0  
  picker.querySelector('.formMessage')!.innerHTML = message
}

function validationHelper() : any {
  const sourceDomainElement = hlib.getById('sourceDomainForm') as HTMLInputElement
  const sourceGroup = hlib.getSelectedGroup('sourceGroupsList')
  const destinationGroup = hlib.getSelectedGroup('destinationGroupsList')
  const maxAnnotationsForm = hlib.getById('maxAnnotationsForm') as HTMLInputElement
  maxAnnotations = parseInt(maxAnnotationsForm.value)
  return { sourceDomainElement, sourceGroup, destinationGroup, maxAnnotations }
}

function validInput() {
  const { sourceDomainElement, sourceGroup, destinationGroup } = validationHelper()
  const userForm = hlib.getById('userForm') as HTMLInputElement
  const username = userForm.value
  if (!username) {
    alert('Please provide the Hypothesis username associated with this API token.')
    return false
  }
  if (! sourceDomainElement.value.endsWith('/*')) {
    alert('sourceDomain must be a wildcard_uri like http://example.com/*')
    return false
  }
  if ( sourceGroup === destinationGroup ) {
    alert('Please choose a destination group different from the source group.')
    return false
  }
return true
}