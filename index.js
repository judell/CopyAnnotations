"use strict";
//import * as hlib from '../../hlib/hlib'
let maxAnnotations = 2;
hlib.createFacetInputForm(hlib.getById('userContainer'), 'user', 'Hypothesis user who will fetch and create annotations');
hlib.getById('userForm').setAttribute('autocomplete', 'off');
const tokenContainer = hlib.getById('tokenContainer');
hlib.createApiTokenInputForm(tokenContainer);
const sourceDomainContainer = hlib.getById('sourceDomainContainer');
hlib.createFacetInputForm(sourceDomainContainer, 'sourceDomain', 'e.g. example.com');
const destinationDomainContainer = hlib.getById('destinationDomainContainer');
hlib.createFacetInputForm(destinationDomainContainer, 'destinationDomain', 'e.g. elsewhere.com, optional, defaults to sourceDomain');
hlib.createFacetInputForm(hlib.getById('limitContainer'), 'maxAnnotations', 'max annotations to copy');
async function createSourceGroupPicker() {
    await hlib.createGroupInputForm(hlib.getById('sourceGroupContainer'), 'sourceGroupsList');
    adjustGroupPicker('#sourceGroupContainer', 'sourceGroup', 'sourceGroupsList', 'group from which to copy annotations');
}
createSourceGroupPicker();
async function createDestinationGroupPicker() {
    await hlib.createGroupInputForm(hlib.getById('destinationGroupContainer'), 'destinationGroupsList');
    adjustGroupPicker('#destinationGroupContainer', 'destinationGroup', 'destinationGroupsList', 'group to which to copy annotations');
}
createDestinationGroupPicker();
let maxAnnotationsForm = hlib.getById('maxAnnotationsForm');
maxAnnotationsForm.value = maxAnnotations.toString();
function checkSettings() {
    if (!validInput()) {
        return;
    }
    const { sourceDomain, sourceGroup, maxAnnotations } = gatherInput();
    const facetLink = `https://jonudell.info/h/facet/?group=${sourceGroup}&wildcard_uri=${wildcardify(sourceDomain)}&max=${maxAnnotations}&expanded=true`;
    const facetSettingsLink = hlib.getById('facetSettingsLink');
    facetSettingsLink.innerHTML = `<a href="${facetLink}" target="_copyAnnotationsReview">click to review selected annotations</a>`;
}
function checkResults() {
    async function delayedClick() {
        await hlib.delaySeconds(3);
        const anchor = hlib.getById("checkSettingsAnchor");
        anchor.href = facetLink;
        anchor.click();
    }
    const { sourceDomain, destinationDomain, destinationGroup } = gatherInput();
    const domain = destinationDomain ? destinationDomain : sourceDomain;
    const facetLink = `https://jonudell.info/h/facet/?group=${destinationGroup}&wildcard_uri=${wildcardify(domain)}&max=${maxAnnotations}&expanded=true`;
    hlib.getById('facetResultsLink').innerHTML = `<a href="${facetLink}" target="_copyAnnotationsReview">click to review copied annotations</a>`;
    const facetSettingsLink = hlib.getById('facetSettingsLink');
    const anchor = facetSettingsLink.querySelector('a');
    anchor.onclick = delayedClick;
}
// main entry point, wired to copy button
async function copy() {
    const { sourceDomain, sourceGroup, maxAnnotations } = gatherInput();
    hlib.getById('fetchProgress').style.display = 'block';
    let params = {
        wildcard_uri: wildcardify(sourceDomain),
        group: sourceGroup,
        max: maxAnnotations,
        _separate_replies: 'true'
    };
    const [annoRows, replyRows] = await hlib.search(params, 'fetchProgress');
    _copy(annoRows);
}
async function _copy(rows) {
    function maybeSwapDomain(uri, sourceDomain, destinationDomain) {
        if (destinationDomain) {
            uri = uri.replace(sourceDomain, destinationDomain);
        }
        return uri;
    }
    const progressElement = document.querySelector('#postProgress');
    progressElement.style.display = 'block';
    const totalElement = progressElement.querySelector('.total');
    totalElement.innerText = rows.length.toString();
    let copyCount = 0;
    let errorCount = 0;
    const { user, sourceDomain, destinationDomain, destinationGroup, } = gatherInput();
    const copyCounterElement = progressElement.querySelector('.copyCounter');
    const errorCounterElement = progressElement.querySelector('.errorCounter');
    for (let i = 0; i < rows.length; i++) {
        const anno = hlib.parseAnnotation(rows[i]);
        //const originalUser = anno.user
        //const originalCreated = anno.updated.slice(0,10)
        const uri = maybeSwapDomain(anno.url, sourceDomain, destinationDomain);
        const payload = {
            user: `${user}@hypothes.is`,
            uri: uri,
            tags: anno.tags,
            text: anno.text,
            target: anno.target,
            group: destinationGroup,
            permissions: hlib.createPermissions(user, destinationGroup),
            document: anno.document
        };
        await hlib.delaySeconds(.2);
        hlib.postAnnotation(JSON.stringify(payload), hlib.getToken())
            .then(_ => {
            copyCount += 1;
            copyCounterElement.innerText = copyCount.toString();
        })
            .catch(e => {
            errorCounterElement.style.display = 'inline';
            errorCount += 1;
            errorCounterElement.innerText = `errors ${errorCount.toString()}`;
            console.log(e);
        });
    }
}
function adjustGroupPicker(groupContainer, label, id, message) {
    const picker = document.querySelector(groupContainer);
    picker.querySelector('.formLabel').innerHTML = label;
    const select = picker.querySelector('select');
    select.id = id;
    select.onchange = null;
    select.selectedIndex = 0;
    picker.querySelector('.formMessage').innerHTML = message;
}
function gatherInput() {
    const sourceDomainElement = hlib.getById('sourceDomainForm');
    const sourceDomain = sourceDomainElement.value;
    const destinationDomainElement = hlib.getById('destinationDomainForm');
    const destinationDomain = destinationDomainElement.value;
    const sourceGroup = hlib.getSelectedGroup('sourceGroupsList');
    const destinationGroup = hlib.getSelectedGroup('destinationGroupsList');
    const maxAnnotationsForm = hlib.getById('maxAnnotationsForm');
    maxAnnotations = parseInt(maxAnnotationsForm.value);
    const userForm = hlib.getById('userForm');
    const user = userForm.value;
    return {
        user: user,
        sourceDomain: sourceDomain,
        destinationDomain: destinationDomain,
        sourceGroup: sourceGroup,
        destinationGroup: destinationGroup,
        maxAnnotations: maxAnnotations
    };
}
function wildcardify(domain) {
    return httpsify(slashstarify(domain));
}
function httpsify(domain) {
    if (domain && !domain.startsWith('https://')) {
        domain = 'https://' + domain;
    }
    return domain;
}
function slashstarify(domain) {
    if (!domain.endsWith('/*')) {
        domain += '/*';
    }
    return domain;
}
function validInput() {
    const { user, sourceDomain, destinationDomain, sourceGroup, destinationGroup, } = gatherInput();
    if (!user) {
        alert('Please provide the Hypothesis username associated with this API token.');
        return false;
    }
    if (!sourceDomain) {
        alert('Please provide a source domain.');
        return false;
    }
    if ((sourceGroup === destinationGroup) && !destinationDomain) {
        alert('Please choose a destination group different from the source group.');
        return false;
    }
    return true;
}
