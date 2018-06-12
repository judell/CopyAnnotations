"use strict";
//import * as hlib from '../../hlib/hlib'
function logWrite(msg) {
    console.log(msg);
    hlib.getById('viewer').innerHTML = "<div>" + msg + "</div>";
}
function logAppend(msg) {
    console.log(msg);
    hlib.getById('viewer').innerHTML += "<div>" + msg + "</div>";
}
// main entry point, wired to copy button
function copy() {
}
var tokenContainer = hlib.getById('tokenContainer');
hlib.createApiTokenInputForm(tokenContainer);
var userContainer = hlib.getById('userContainer');
hlib.createUserInputForm(userContainer);
var argsSourceDomain = {
    element: hlib.getById('sourceDomainContainer'),
    name: 'source domain',
    id: 'sourceDomain',
    value: '',
    onchange: '',
    type: '',
    msg: 'domain from which to copy (e.g. site1.org)'
};
hlib.createNamedInputForm(argsSourceDomain);
var argsDestDomain = {
    element: hlib.getById('destinationDomainContainer'),
    name: 'destination domain',
    id: 'destinationDomain',
    value: '',
    onchange: '',
    type: '',
    msg: 'domain to which to copy (e.g. site2.net)'
};
hlib.createNamedInputForm(argsDestDomain);
/*
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
    select.onchange = null;
    select.id = id;
    picker.querySelector('.formMessage').innerHTML = message;
}
var sourceGroupContainer = hlib.getById('sourceGroupContainer');
hlib.createGroupInputForm(sourceGroupContainer);
setTimeout(function () {
    adjustGroupPicker('#sourceGroupContainer', 'source group', 'sourceGroupsList', 'group from which to copy annotations');
}, 500);
var destinationGroupContainer = hlib.getById('destinationGroupContainer');
hlib.createGroupInputForm(destinationGroupContainer);
setTimeout(function () {
    adjustGroupPicker('#destinationGroupContainer', 'destination group', 'destinationGroupsList', 'group to which to copy annotations');
}, 500);
var argsLimit = {
    element: hlib.getById('limitContainer'),
    name: 'max annotations',
    id: 'maxAnnotations',
    value: '',
    onchange: '',
    type: '',
    msg: 'max annotations to copy (use a small number for a sanity check)'
};
hlib.createNamedInputForm(argsLimit);
