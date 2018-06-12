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
var destinationDomainContainer = hlib.getById('destinationDomainContainer');
var sourceGroupContainer = hlib.getById('sourceGroupContainer');
var destinationGroupContainer = hlib.getById('destinationGroupContainer');
