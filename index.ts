import * as hlib from '../../hlib/hlib'

var maxAnnotations:number

var totalAnnotationsToCopy:number = 0

var copiedIds:any = {}

var worker = new Worker('postAnnotation.js');

worker.addEventListener('message', function (msg) {
  if (msg.data.success) {
    let response = JSON.parse(msg.data.success)
    incrementCountOfCopiedIds(response.id)
    let counterElement = document.querySelector('.counter')!
    let counter:number = parseInt(counterElement.innerHTML)
    counterElement.innerHTML = (counter + 1).toString()
  } else if (msg.data.failure) {
    console.error(msg.data.failure)
  } else if (msg.data.exception) {
    console.error(msg.data.exception)
  } else {
    console.error('unexpected message from worker postAnnotation.js')
  }
})

function countOfCopiedIds() : number {
  return Object.keys(copiedIds).length
}

function incrementCountOfCopiedIds(id:string) {
  if (copiedIds[id]) {  copiedIds[id] += 1  } else {  copiedIds[id] = 1  }
}

// main entry point, wired to copy button
function copy() {
let textArea = hlib.getById('urlListContainer') as HTMLTextAreaElement
let urlListText = textArea.value
  let urls = urlListText.split('\n')
  urls = urls.filter(url => { 
    url = url.trim()
    if (url) { return url } 
  })
  //console.log(urls)
  let maxAnnotationsForm = hlib.getById('maxAnnotationsForm') as HTMLInputElement
  maxAnnotations = parseInt(maxAnnotationsForm.value)
  let userFilterForm = hlib.getById('userFilterForm') as HTMLInputElement
  let userFilter = userFilterForm.value 
  for (let i = 0; i < urls.length; i++ ) {
    let url = urls[i]
    let sourceGroup = hlib.getSelectedGroup('sourceGroupsList')
    let params:any =  {
      url: url,
      group: sourceGroup,
    }
    if (userFilter) {
      params.user = userFilter
    }
    hlib.hApiSearch(params,  _copy)
  }
}

function _copy(rows:any[]) {
  let progressElement = document.querySelector('.progress')! as HTMLElement
  progressElement.style.display = 'block'
  let destinationDomainForm = hlib.getById('destinationDomainForm') as HTMLInputElement
  let destinationDomain = destinationDomainForm.value
  let sourceGroup = hlib.getSelectedGroup('sourceGroupsList')
  let destinationGroup = hlib.getSelectedGroup('destinationGroupsList')
  destinationGroup = 'GRRvb7qE'
  let username = hlib.getUser()
  rows.forEach(row => {
    let anno = hlib.parseAnnotation(row)
    let a = document.createElement('a')
    a.href = row.uri
    let sourceDomain = `${a.protocol}//${a.hostname}`
    let rowText = JSON.stringify(row)
    let regex = new RegExp(sourceDomain, 'g')
    rowText = rowText.replace(regex, destinationDomain)
    row = JSON.parse(rowText)
    let originalUser = row.user
    let originalCreated = row.created
    let payload = {
      user: `${username}@hypothes.is`,
      uri: row.uri,
      tags: row.tags,
      //text: row.text += `<hr>Copied from ${sourceDomain} (${originalUser}, ${originalCreated})`,
      text: row.text,
      target: row.target,
      group: destinationGroup,
      permissions: hlib.createPermissions(username, destinationGroup),
      document: row.document,
    }
    totalAnnotationsToCopy += 1
    if (totalAnnotationsToCopy <= maxAnnotations) {
      let totalElement = document.querySelector('.total')! as HTMLElement
      totalElement.innerHTML = totalAnnotationsToCopy.toString()
      worker.postMessage({
        payload: JSON.stringify(payload),
        token: hlib.getToken(),
        maxAnnotations: maxAnnotations,
      })
    }
  })
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
(after a suitable delay) adjust their labels, ids, and messages.

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

hlib.createFacetInputForm(
  hlib.getById('userFilterContainer'), 
  'userFilter', 
  'only copy annotations created by this user'
)

let maxAnnotationsForm = hlib.getById('maxAnnotationsForm') as HTMLInputElement
maxAnnotationsForm.value = '1000'

/* test scaffold 
destinationDomainForm = hlib.getById('destinationDomainForm') as HTMLInputElement
destinationDomainForm.value = 'https://wisc.pb.unizin.org'


userFilterForm = hlib.getById('userFilterForm') as HTMLInputElement
userFilterForm.value = 'UW_Madison.French'

let textArea = hlib.getById('urlListContainer') as HTMLTextAreaElement
textArea.value = `
https://wisc.pb.unizin.org/frenchcscr/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-alain-mabanckou-black-bazar/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-ambroise-pare/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-baudelaire-a-une-passante/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-baudelaire-le-masque/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-camus-lexil-dhelene-partie-a/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-jean-de-lery/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-la-chanson-de-roland/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-lappel-durbain-ii-1095/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-le-concile-de-trente/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-le-philosophe/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-ledit-de-nantes/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-les-memoires-du-cardinal-de-retz/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-maupassant-le-bonheur/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-maupassant-le-lit-29/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-maupassant-premiere-neige/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-maupassant-rose/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-moliere-i1/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-moliere-i4/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-moliere-lecole-des-femmes-ii5/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-moliere-lecole-des-femmes-iv8/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-moliere-lecole-des-femmes-v4/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-nancy-huston-prodige-polyphonie-pages-99-108/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-ronsard-quand-vous-serez-bien-vieille/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-saint-thomas-daquin/
https://wisc.pb.unizin.org/frenchcscr/chapter/assignment-verlaine-art-poetique/
https://wisc.pb.unizin.org/frenchcscr/chapter/baudelaire-au-lecteur-p-1/
https://wisc.pb.unizin.org/frenchcscr/chapter/baudelaire-au-lecteur-p-2/
https://wisc.pb.unizin.org/frenchcscr/chapter/chapter-1/
https://wisc.pb.unizin.org/frenchcscr/chapter/creative-title/
https://wisc.pb.unizin.org/frenchcscr/chapter/hugo-a-lobeissance-p-3/
https://wisc.pb.unizin.org/frenchcscr/chapter/maupassant-le-bonheur-page-2/
https://wisc.pb.unizin.org/frenchcscr/chapter/maupassant-le-lit-29-page-2/
https://wisc.pb.unizin.org/frenchcscr/chapter/maupassant-premiere-neige-page-2/
https://wisc.pb.unizin.org/frenchcscr/chapter/maupassant-premiere-neige-page-3/
https://wisc.pb.unizin.org/frenchcscr/chapter/maupassant-rose-page-2/
https://wisc.pb.unizin.org/frenchcscr/chapter/moliere-i1-page-2/
https://wisc.pb.unizin.org/frenchcscr/chapter/moliere-lecole-des-femmes-i4-page-2/
https://wisc.pb.unizin.org/frenchcscr/chapter/moliere-lecole-des-femmes-i4-page-3/
https://wisc.pb.unizin.org/frenchcscr/chapter/moliere-lecole-des-femmes-ii5-page-2/
https://wisc.pb.unizin.org/frenchcscr/chapter/moliere-lecole-des-femmes-iv8-page-2/
https://wisc.pb.unizin.org/frenchcscr/chapter/moliere-lecole-des-femmes-v4-page-2/
https://wisc.pb.unizin.org/frenchcscr/chapter/sample-page-nms/
https://wisc.pb.unizin.org/frenchcscr/chapter/sandbox-ng/
https://wisc.pb.unizin.org/frenchcscr/part/verlaine-art-poetique/`
*/