"use strict";
//import * as hlib from '../../hlib/hlib'
var maxAnnotations;
var totalAnnotationsToCopy = 0;
var copiedIds = {};
var worker = new Worker('postAnnotation.js');
var destinationDomainForm = hlib.getById('destinationDomainForm');
var maxAnnotationsForm = hlib.getById('maxAnnotationsForm');
var userFilterForm = hlib.getById('userFilterForm');
worker.addEventListener('message', function (msg) {
    if (msg.data.success) {
        var response = JSON.parse(msg.data.success);
        incrementCountOfCopiedIds(response.id);
        var counterElement = document.querySelector('.counter');
        var counter = parseInt(counterElement.innerHTML);
        counterElement.innerHTML = (counter + 1).toString();
    }
    else if (msg.data.failure) {
        console.error(msg.data.failure);
    }
    else if (msg.data.exception) {
        console.error(msg.data.exception);
    }
    else {
        console.error('unexpected message from worker postAnnotation.js');
    }
});
function countOfCopiedIds() {
    return Object.keys(copiedIds).length;
}
function incrementCountOfCopiedIds(id) {
    if (copiedIds[id]) {
        copiedIds[id] += 1;
    }
    else {
        copiedIds[id] = 1;
    }
}
// main entry point, wired to copy button
function copy() {
    var textArea = hlib.getById('urlListContainer');
    var urlListText = textArea.value;
    var urls = urlListText.split('\n');
    urls = urls.filter(function (url) {
        url = url.trim();
        if (url) {
            return url;
        }
    });
    //console.log(urls)
    var maxAnnotationsForm = hlib.getById('maxAnnotationsForm');
    maxAnnotations = parseInt(maxAnnotationsForm.value);
    var userFilterForm = hlib.getById('userFilterForm');
    var userFilter = userFilterForm.value;
    for (var i = 0; i < urls.length; i++) {
        var url = urls[i];
        var sourceGroup = hlib.getSelectedGroup('sourceGroupsList');
        var params = {
            url: url,
            group: sourceGroup
        };
        if (userFilter) {
            params.user = userFilter;
        }
        hlib.hApiSearch(params, _copy);
    }
}
function _copy(rows) {
    var progressElement = document.querySelector('.progress');
    progressElement.style.display = 'block';
    var destinationDomain = destinationDomainForm.value;
    var sourceGroup = hlib.getSelectedGroup('sourceGroupsList');
    var destinationGroup = hlib.getSelectedGroup('destinationGroupsList');
    destinationGroup = 'GRRvb7qE';
    var username = hlib.getUser();
    rows.forEach(function (row) {
        var anno = hlib.parseAnnotation(row);
        var a = document.createElement('a');
        a.href = row.uri;
        var sourceDomain = a.protocol + "//" + a.hostname;
        var rowText = JSON.stringify(row);
        var regex = new RegExp(sourceDomain, 'g');
        rowText = rowText.replace(regex, destinationDomain);
        row = JSON.parse(rowText);
        var originalUser = row.user;
        var originalCreated = row.created;
        var payload = {
            user: username + "@hypothes.is",
            uri: row.uri,
            tags: row.tags,
            //text: row.text += `<hr>Copied from ${sourceDomain} (${originalUser}, ${originalCreated})`,
            text: row.text,
            target: row.target,
            group: destinationGroup,
            permissions: hlib.createPermissions(username, destinationGroup),
            document: row.document
        };
        totalAnnotationsToCopy += 1;
        if (totalAnnotationsToCopy <= maxAnnotations) {
            var totalElement = document.querySelector('.total');
            totalElement.innerHTML = totalAnnotationsToCopy.toString();
            worker.postMessage({
                payload: JSON.stringify(payload),
                token: hlib.getToken(),
                maxAnnotations: maxAnnotations
            });
        }
    });
}
var tokenContainer = hlib.getById('tokenContainer');
hlib.createApiTokenInputForm(tokenContainer);
var userContainer = hlib.getById('userContainer');
hlib.createUserInputForm(userContainer);
hlib.createFacetInputForm(hlib.getById('destinationDomainContainer'), 'destinationDomain', 'domain to which to copy (e.g. site1.org)');
/*
hlib.createGroupInputForm creates a single picker, here we need two. So we create it twice, then
(after a suitable delay) adjust their labels, ids, and messages.

From TypeScript's point of view, document.querySelector can return HTMLElement or null.
With strict checking turned on, all use of the method produces the 'object is possibly null' message.
I don't want to turn off strict type checking. An alternative is to use the non-null assertion operator, !
(see https://hyp.is/BazwXG5YEeib9fdjuAT_GQ/www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html)
But I'm not sure I like doing that either.
*/
function adjustGroupPicker(groupContainer, label, id, message) {
    var picker = document.querySelector(groupContainer);
    picker.querySelector('.formLabel').innerHTML = label;
    var select = picker.querySelector('select');
    select.removeAttribute('onchange');
    select.id = id;
    picker.querySelector('.formMessage').innerHTML = message;
}
var sourceGroupContainer = hlib.getById('sourceGroupContainer');
hlib.createGroupInputForm(sourceGroupContainer, 'sourceGroupList');
setTimeout(function () {
    adjustGroupPicker('#sourceGroupContainer', 'sourceGroup', 'sourceGroupsList', 'group from which to copy annotations');
}, 1000);
var destinationGroupContainer = hlib.getById('destinationGroupContainer');
hlib.createGroupInputForm(destinationGroupContainer, 'destinationGroupList');
setTimeout(function () {
    adjustGroupPicker('#destinationGroupContainer', 'destinationGroup', 'destinationGroupsList', 'group to which to copy annotations');
}, 1000);
hlib.createFacetInputForm(hlib.getById('limitContainer'), 'maxAnnotations', 'max annotations to copy (use a small number for testing)');
hlib.createFacetInputForm(hlib.getById('userFilterContainer'), 'userFilter', 'only copy annotations created by this user');
/* test scaffold */
destinationDomainForm = hlib.getById('destinationDomainForm');
destinationDomainForm.value = 'https://wisc.pb.unizin.org';
maxAnnotationsForm = hlib.getById('maxAnnotationsForm');
maxAnnotationsForm.value = '1000';
userFilterForm = hlib.getById('userFilterForm');
userFilterForm.value = 'UW_Madison.French';
var textArea = hlib.getById('urlListContainer');
textArea.value = "\nhttps://wisc.pb.unizin.org/frenchcscr/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-alain-mabanckou-black-bazar/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-ambroise-pare/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-baudelaire-a-une-passante/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-baudelaire-le-masque/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-camus-lexil-dhelene-partie-a/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-jean-de-lery/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-la-chanson-de-roland/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-lappel-durbain-ii-1095/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-le-concile-de-trente/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-le-philosophe/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-ledit-de-nantes/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-les-memoires-du-cardinal-de-retz/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-maupassant-le-bonheur/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-maupassant-le-lit-29/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-maupassant-premiere-neige/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-maupassant-rose/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-moliere-i1/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-moliere-i4/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-moliere-lecole-des-femmes-ii5/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-moliere-lecole-des-femmes-iv8/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-moliere-lecole-des-femmes-v4/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-nancy-huston-prodige-polyphonie-pages-99-108/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-ronsard-quand-vous-serez-bien-vieille/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-saint-thomas-daquin/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/assignment-verlaine-art-poetique/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/baudelaire-au-lecteur-p-1/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/baudelaire-au-lecteur-p-2/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/chapter-1/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/creative-title/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/hugo-a-lobeissance-p-3/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/maupassant-le-bonheur-page-2/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/maupassant-le-lit-29-page-2/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/maupassant-premiere-neige-page-2/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/maupassant-premiere-neige-page-3/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/maupassant-rose-page-2/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/moliere-i1-page-2/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/moliere-lecole-des-femmes-i4-page-2/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/moliere-lecole-des-femmes-i4-page-3/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/moliere-lecole-des-femmes-ii5-page-2/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/moliere-lecole-des-femmes-iv8-page-2/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/moliere-lecole-des-femmes-v4-page-2/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/sample-page-nms/\nhttps://wisc.pb.unizin.org/frenchcscr/chapter/sandbox-ng/\nhttps://wisc.pb.unizin.org/frenchcscr/part/verlaine-art-poetique/";
