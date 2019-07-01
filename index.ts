import * as hlib from '../../hlib/hlib'

type userInput = {
  sourceDomain: string
  destinationDomain: string
  sourceGroup: string
  destinationGroup: string
  user: string
  maxAnnotations: number
}

let maxAnnotations:number = 2

hlib.createFacetInputForm(
  hlib.getById('userContainer'),
  'user', 
  'Hypothesis user who will fetch and create annotations'
)
hlib.getById('userForm').setAttribute('autocomplete', 'off')

const tokenContainer = hlib.getById('tokenContainer')
hlib.createApiTokenInputForm(tokenContainer)

const sourceDomainContainer = hlib.getById('sourceDomainContainer')
hlib.createFacetInputForm(
  sourceDomainContainer,
  'sourceDomain',
  'e.g. example.com',
)

const destinationDomainContainer = hlib.getById('destinationDomainContainer')
hlib.createFacetInputForm(
  destinationDomainContainer,
  'destinationDomain',
  'e.g. elsewhere.com, optional, defaults to sourceDomain'
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
  const { 
    sourceDomain,
    sourceGroup, 
    maxAnnotations } = gatherInput()
  const facetLink = `https://jonudell.info/h/facet/?group=${sourceGroup}&wildcard_uri=${wildcardify(sourceDomain)}&max=${maxAnnotations}&expanded=true`
  const facetSettingsLink = hlib.getById('facetSettingsLink') as HTMLElement
  facetSettingsLink.innerHTML = `<a href="${facetLink}" target="_copyAnnotationsReview">click to review selected annotations</a>`
}

function checkResults() {
  async function delayedClick() {
    await hlib.delaySeconds(3)
    const anchor = hlib.getById("checkSettingsAnchor") as HTMLAnchorElement
    anchor.href = facetLink
    anchor.click()
  }
  const { 
    sourceDomain, 
    destinationDomain,
    destinationGroup } = gatherInput()
    const domain = destinationDomain ? destinationDomain : sourceDomain
  const facetLink = `https://jonudell.info/h/facet/?group=${destinationGroup}&wildcard_uri=${wildcardify(domain)}&max=${maxAnnotations}&expanded=true`
  hlib.getById('facetResultsLink').innerHTML = `<a href="${facetLink}" target="_copyAnnotationsReview">click to review copied annotations</a>`
  const facetSettingsLink = hlib.getById('facetSettingsLink') as HTMLElement
  const anchor = facetSettingsLink.querySelector('a') as HTMLAnchorElement
  anchor.onclick = delayedClick
}

// main entry point, wired to copy button
async function copy() {

  const {
    sourceDomain,
    sourceGroup,
    maxAnnotations
    } = gatherInput()

  hlib.getById('fetchProgress').style.display = 'block'
    let params:any =  {
    wildcard_uri: wildcardify(sourceDomain),
    group: sourceGroup,
    max: maxAnnotations
  }
  const [annoRows, replyRows] = await hlib.search(params, 'fetchProgress')
  _copy(annoRows)
}

function _copy(rows:any[]) {
  function maybeSwapDomain(uri: string, sourceDomain: string, destinationDomain: string) {
    if (destinationDomain) {
      uri = uri.replace(sourceDomain, destinationDomain)
    }
  return uri
  }
  const progressElement = document.querySelector('#postProgress') as HTMLElement
  progressElement.style.display = 'block'
  const counterElement = progressElement.querySelector('.total') as HTMLElement
  counterElement.innerText = rows.length.toString()
  const {
    user,
    sourceDomain,
    destinationDomain,
    sourceGroup,
    destinationGroup,
    maxAnnotations
    } = gatherInput()
  for (let i = 0; i < rows.length; i++) {
    const anno = hlib.parseAnnotation(rows[i])
    const originalUser = anno.user
    const originalCreated = anno.updated.slice(0,10)
    const uri = maybeSwapDomain(anno.url, sourceDomain, destinationDomain)
    const payload = {
      user: `${user}@hypothes.is`,
      uri: uri,
      tags: anno.tags,
      text: anno.text, // += `<hr>Copied from ${sourceDomain} (author ${originalUser} on ${originalCreated})`,
      target: anno.target,
      group: destinationGroup,
      permissions: hlib.createPermissions(user, destinationGroup),
      document: anno.document
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

function gatherInput() : userInput {
  const sourceDomainElement = hlib.getById('sourceDomainForm') as HTMLInputElement
  const sourceDomain = sourceDomainElement.value
  const destinationDomainElement = hlib.getById('destinationDomainForm') as HTMLInputElement
  const destinationDomain = destinationDomainElement.value
  const sourceGroup = hlib.getSelectedGroup('sourceGroupsList')
  const destinationGroup = hlib.getSelectedGroup('destinationGroupsList')
  const maxAnnotationsForm = hlib.getById('maxAnnotationsForm') as HTMLInputElement
  maxAnnotations = parseInt(maxAnnotationsForm.value)
  const userForm = hlib.getById('userForm') as HTMLInputElement
  const user = userForm.value
  return { 
    user: user,
    sourceDomain: sourceDomain,
    destinationDomain: destinationDomain,
    sourceGroup, 
    destinationGroup, 
    maxAnnotations 
  }
}

function wildcardify(domain: string) {
  return httpsify(slashstarify(domain))
}

function httpsify(domain: string) {
  if (domain && !domain.startsWith('https://')) {
      domain = 'https://' + domain;
  }
  return domain
}
function slashstarify(domain: string) {
  if (!domain.endsWith('/*')) {
      domain += '/*';
  }
  return domain
}

function validInput() {
  const {
    user,
    sourceDomain,
    destinationDomain,
    sourceGroup,
    destinationGroup,
    } = gatherInput()
  if (!user) {
    alert('Please provide the Hypothesis username associated with this API token.')
    return false
  }
  if (! sourceDomain) {
    alert('Please provide a source domain.')
    return false
  }
  if ( (sourceGroup === destinationGroup) && ! destinationDomain ) {
    alert('Please choose a destination group different from the source group.')
    return false
  }
return true
}