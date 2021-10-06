'use strict';
!function ($){
"use strict";
var FOUNDATION_VERSION='6.3.1';
var Foundation={
version: FOUNDATION_VERSION,
_plugins: {},
_uuids: [],
rtl: function (){
return $('html').attr('dir')==='rtl';
},
plugin: function (plugin, name){
var className=name||functionName(plugin);
var attrName=hyphenate(className);
this._plugins[attrName]=this[className]=plugin;
},
registerPlugin: function (plugin, name){
var pluginName=name ? hyphenate(name):functionName(plugin.constructor).toLowerCase();
plugin.uuid=this.GetYoDigits(6, pluginName);
if(!plugin.$element.attr('data-' + pluginName)){
plugin.$element.attr('data-' + pluginName, plugin.uuid);
}
if(!plugin.$element.data('zfPlugin')){
plugin.$element.data('zfPlugin', plugin);
}
plugin.$element.trigger('init.zf.' + pluginName);
this._uuids.push(plugin.uuid);
return;
},
unregisterPlugin: function (plugin){
var pluginName=hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));
this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
.trigger('destroyed.zf.' + pluginName);
for (var prop in plugin){
plugin[prop]=null;
}
return;
},
reInit: function (plugins){
var isJQ=plugins instanceof $;
try {
if(isJQ){
plugins.each(function (){
$(this).data('zfPlugin')._init();
});
}else{
var type=typeof plugins,
_this=this,
fns={
'object': function (plgs){
plgs.forEach(function (p){
p=hyphenate(p);
$('[data-' + p + ']').foundation('_init');
});
},
'string': function (){
plugins=hyphenate(plugins);
$('[data-' + plugins + ']').foundation('_init');
},
'undefined': function (){
this['object'](Object.keys(_this._plugins));
}};
fns[type](plugins);
}} catch (err){
console.error(err);
} finally {
return plugins;
}},
GetYoDigits: function (length, namespace){
length=length||6;
return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace:'');
},
reflow: function (elem, plugins){
if(typeof plugins==='undefined'){
plugins=Object.keys(this._plugins);
}
else if(typeof plugins==='string'){
plugins=[plugins];
}
var _this=this;
$.each(plugins, function (i, name){
var plugin=_this._plugins[name];
var $elem=$(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');
$elem.each(function (){
var $el=$(this),
opts={};
if($el.data('zfPlugin')){
console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
return;
}
if($el.attr('data-options')){
var thing=$el.attr('data-options').split(';').forEach(function (e, i){
var opt=e.split(':').map(function (el){
return el.trim();
});
if(opt[0]) opts[opt[0]]=parseValue(opt[1]);
});
}
try {
$el.data('zfPlugin', new plugin($(this), opts));
} catch (er){
console.error(er);
} finally {
return;
}});
});
},
getFnName: functionName,
transitionend: function ($elem){
var transitions={
'transition': 'transitionend',
'WebkitTransition': 'webkitTransitionEnd',
'MozTransition': 'transitionend',
'OTransition': 'otransitionend'
};
var elem=document.createElement('div'),
end;
for (var t in transitions){
if(typeof elem.style[t]!=='undefined'){
end=transitions[t];
}}
if(end){
return end;
}else{
end=setTimeout(function (){
$elem.triggerHandler('transitionend', [$elem]);
}, 1);
return 'transitionend';
}}
};
Foundation.util={
throttle: function (func, delay){
var timer=null;
return function (){
var context=this,
args=arguments;
if(timer===null){
timer=setTimeout(function (){
func.apply(context, args);
timer=null;
}, delay);
}};}};
var foundation=function (method){
var type=typeof method,
$meta=$('meta.foundation-mq'),
$noJS=$('.no-js');
if(!$meta.length){
$('<meta class="foundation-mq">').appendTo(document.head);
}
if($noJS.length){
$noJS.removeClass('no-js');
}
if(type==='undefined'){
Foundation.MediaQuery._init();
Foundation.reflow(this);
}else if(type==='string'){
var args=Array.prototype.slice.call(arguments, 1);
var plugClass=this.data('zfPlugin');
if(plugClass!==undefined&&plugClass[method]!==undefined){
if(this.length===1){
plugClass[method].apply(plugClass, args);
}else{
this.each(function (i, el){
plugClass[method].apply($(el).data('zfPlugin'), args);
});
}}else{
throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass):'this element') + '.');
}}else{
throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
}
return this;
};
window.Foundation=Foundation;
$.fn.foundation=foundation;
(function (){
if(!Date.now||!window.Date.now) window.Date.now=Date.now=function (){
return new Date().getTime();
};
var vendors=['webkit', 'moz'];
for (var i=0; i < vendors.length&&!window.requestAnimationFrame; ++i){
var vp=vendors[i];
window.requestAnimationFrame=window[vp + 'RequestAnimationFrame'];
window.cancelAnimationFrame=window[vp + 'CancelAnimationFrame']||window[vp + 'CancelRequestAnimationFrame'];
}
if(/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent)||!window.requestAnimationFrame||!window.cancelAnimationFrame){
var lastTime=0;
window.requestAnimationFrame=function (callback){
var now=Date.now();
var nextTime=Math.max(lastTime + 16, now);
return setTimeout(function (){
callback(lastTime=nextTime);
}, nextTime - now);
};
window.cancelAnimationFrame=clearTimeout;
}
if(!window.performance||!window.performance.now){
window.performance={
start: Date.now(),
now: function (){
return Date.now() - this.start;
}};}})();
if(!Function.prototype.bind){
Function.prototype.bind=function (oThis){
if(typeof this!=='function'){
throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
}
var aArgs=Array.prototype.slice.call(arguments, 1),
fToBind=this,
fNOP=function (){},
fBound=function (){
return fToBind.apply(this instanceof fNOP ? this:oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
};
if(this.prototype){
fNOP.prototype=this.prototype;
}
fBound.prototype=new fNOP();
return fBound;
};}
function functionName(fn){
if(Function.prototype.name===undefined){
var funcNameRegex=/function\s([^(]{1,})\(/;
var results=funcNameRegex.exec(fn.toString());
return results&&results.length > 1 ? results[1].trim():"";
}else if(fn.prototype===undefined){
return fn.constructor.name;
}else{
return fn.prototype.constructor.name;
}}
function parseValue(str){
if('true'===str) return true;else if('false'===str) return false;else if(!isNaN(str * 1)) return parseFloat(str);
return str;
}
function hyphenate(str){
return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}}(jQuery);
;'use strict';
!function ($){
Foundation.Box={
ImNotTouchingYou: ImNotTouchingYou,
GetDimensions: GetDimensions,
GetOffsets: GetOffsets
};function ImNotTouchingYou(element, parent, lrOnly, tbOnly){
var eleDims=GetDimensions(element),
top,
bottom,
left,
right;
if(parent){
var parDims=GetDimensions(parent);
bottom=eleDims.offset.top + eleDims.height <=parDims.height + parDims.offset.top;
top=eleDims.offset.top >=parDims.offset.top;
left=eleDims.offset.left >=parDims.offset.left;
right=eleDims.offset.left + eleDims.width <=parDims.width + parDims.offset.left;
}else{
bottom=eleDims.offset.top + eleDims.height <=eleDims.windowDims.height + eleDims.windowDims.offset.top;
top=eleDims.offset.top >=eleDims.windowDims.offset.top;
left=eleDims.offset.left >=eleDims.windowDims.offset.left;
right=eleDims.offset.left + eleDims.width <=eleDims.windowDims.width;
}
var allDirs=[bottom, top, left, right];
if(lrOnly){
return left===right===true;
}
if(tbOnly){
return top===bottom===true;
}
return allDirs.indexOf(false)===-1;
};
function GetDimensions(elem, test){
elem=elem.length ? elem[0]:elem;
if(elem===window||elem===document){
throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
}
var rect=elem.getBoundingClientRect(),
parRect=elem.parentNode.getBoundingClientRect(),
winRect=document.body.getBoundingClientRect(),
winY=window.pageYOffset,
winX=window.pageXOffset;
return {
width: rect.width,
height: rect.height,
offset: {
top: rect.top + winY,
left: rect.left + winX
},
parentDims: {
width: parRect.width,
height: parRect.height,
offset: {
top: parRect.top + winY,
left: parRect.left + winX
}},
windowDims: {
width: winRect.width,
height: winRect.height,
offset: {
top: winY,
left: winX
}}
};}
function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow){
var $eleDims=GetDimensions(element),
$anchorDims=anchor ? GetDimensions(anchor):null;
switch (position){
case 'top':
return {
left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width:$anchorDims.offset.left,
top: $anchorDims.offset.top - ($eleDims.height + vOffset)
};
break;
case 'left':
return {
left: $anchorDims.offset.left - ($eleDims.width + hOffset),
top: $anchorDims.offset.top
};
break;
case 'right':
return {
left: $anchorDims.offset.left + $anchorDims.width + hOffset,
top: $anchorDims.offset.top
};
break;
case 'center top':
return {
left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
top: $anchorDims.offset.top - ($eleDims.height + vOffset)
};
break;
case 'center bottom':
return {
left: isOverflow ? hOffset:$anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
top: $anchorDims.offset.top + $anchorDims.height + vOffset
};
break;
case 'center left':
return {
left: $anchorDims.offset.left - ($eleDims.width + hOffset),
top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
};
break;
case 'center right':
return {
left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
};
break;
case 'center':
return {
left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2
};
break;
case 'reveal':
return {
left: ($eleDims.windowDims.width - $eleDims.width) / 2,
top: $eleDims.windowDims.offset.top + vOffset
};
case 'reveal full':
return {
left: $eleDims.windowDims.offset.left,
top: $eleDims.windowDims.offset.top
};
break;
case 'left bottom':
return {
left: $anchorDims.offset.left,
top: $anchorDims.offset.top + $anchorDims.height + vOffset
};
break;
case 'right bottom':
return {
left: $anchorDims.offset.left + $anchorDims.width + hOffset - $eleDims.width,
top: $anchorDims.offset.top + $anchorDims.height + vOffset
};
break;
default:
return {
left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width:$anchorDims.offset.left + hOffset,
top: $anchorDims.offset.top + $anchorDims.height + vOffset
};}}
}(jQuery);
;
'use strict';
!function ($){
var keyCodes={
9: 'TAB',
13: 'ENTER',
27: 'ESCAPE',
32: 'SPACE',
37: 'ARROW_LEFT',
38: 'ARROW_UP',
39: 'ARROW_RIGHT',
40: 'ARROW_DOWN'
};
var commands={};
var Keyboard={
keys: getKeyCodes(keyCodes),
parseKey: function (event){
var key=keyCodes[event.which||event.keyCode]||String.fromCharCode(event.which).toUpperCase();
key=key.replace(/\W+/, '');
if(event.shiftKey) key='SHIFT_' + key;
if(event.ctrlKey) key='CTRL_' + key;
if(event.altKey) key='ALT_' + key;
key=key.replace(/_$/, '');
return key;
},
handleKey: function (event, component, functions){
var commandList=commands[component],
keyCode=this.parseKey(event),
cmds,
command,
fn;
if(!commandList) return console.warn('Component not defined!');
if(typeof commandList.ltr==='undefined'){
cmds=commandList;
}else{
if(Foundation.rtl()) cmds=$.extend({}, commandList.ltr, commandList.rtl);else cmds=$.extend({}, commandList.rtl, commandList.ltr);
}
command=cmds[keyCode];
fn=functions[command];
if(fn&&typeof fn==='function'){
var returnValue=fn.apply();
if(functions.handled||typeof functions.handled==='function'){
functions.handled(returnValue);
}}else{
if(functions.unhandled||typeof functions.unhandled==='function'){
functions.unhandled();
}}
},
findFocusable: function ($element){
if(!$element){
return false;
}
return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function (){
if(!$(this).is(':visible')||$(this).attr('tabindex') < 0){
return false;
}
return true;
});
},
register: function (componentName, cmds){
commands[componentName]=cmds;
},
trapFocus: function ($element){
var $focusable=Foundation.Keyboard.findFocusable($element),
$firstFocusable=$focusable.eq(0),
$lastFocusable=$focusable.eq(-1);
$element.on('keydown.zf.trapfocus', function (event){
if(event.target===$lastFocusable[0]&&Foundation.Keyboard.parseKey(event)==='TAB'){
event.preventDefault();
$firstFocusable.focus();
}else if(event.target===$firstFocusable[0]&&Foundation.Keyboard.parseKey(event)==='SHIFT_TAB'){
event.preventDefault();
$lastFocusable.focus();
}});
},
releaseFocus: function ($element){
$element.off('keydown.zf.trapfocus');
}};
function getKeyCodes(kcs){
var k={};
for (var kc in kcs){
k[kcs[kc]]=kcs[kc];
}return k;
}
Foundation.Keyboard=Keyboard;
}(jQuery);
;'use strict';
!function ($){
var defaultQueries={
'default': 'only screen',
landscape: 'only screen and (orientation: landscape)',
portrait: 'only screen and (orientation: portrait)',
retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
};
var MediaQuery={
queries: [],
current: '',
_init: function (){
var self=this;
var extractedStyles=$('.foundation-mq').css('font-family');
var namedQueries;
namedQueries=parseStyleToObject(extractedStyles);
for (var key in namedQueries){
if(namedQueries.hasOwnProperty(key)){
self.queries.push({
name: key,
value: 'only screen and (min-width: ' + namedQueries[key] + ')'
});
}}
this.current=this._getCurrentSize();
this._watcher();
},
atLeast: function (size){
var query=this.get(size);
if(query){
return window.matchMedia(query).matches;
}
return false;
},
is: function (size){
size=size.trim().split(' ');
if(size.length > 1&&size[1]==='only'){
if(size[0]===this._getCurrentSize()) return true;
}else{
return this.atLeast(size[0]);
}
return false;
},
get: function (size){
for (var i in this.queries){
if(this.queries.hasOwnProperty(i)){
var query=this.queries[i];
if(size===query.name) return query.value;
}}
return null;
},
_getCurrentSize: function (){
var matched;
for (var i=0; i < this.queries.length; i++){
var query=this.queries[i];
if(window.matchMedia(query.value).matches){
matched=query;
}}
if(typeof matched==='object'){
return matched.name;
}else{
return matched;
}},
_watcher: function (){
var _this=this;
$(window).on('resize.zf.mediaquery', function (){
var newSize=_this._getCurrentSize(),
currentSize=_this.current;
if(newSize!==currentSize){
_this.current=newSize;
$(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
}});
}};
Foundation.MediaQuery=MediaQuery;
window.matchMedia||(window.matchMedia=function (){
'use strict';
var styleMedia=window.styleMedia||window.media;
if(!styleMedia){
var style=document.createElement('style'),
script=document.getElementsByTagName('script')[0],
info=null;
style.type='text/css';
style.id='matchmediajs-test';
script&&script.parentNode&&script.parentNode.insertBefore(style, script);
info='getComputedStyle' in window&&window.getComputedStyle(style, null)||style.currentStyle;
styleMedia={
matchMedium: function (media){
var text='@media ' + media + '{ #matchmediajs-test { width: 1px; }}';
if(style.styleSheet){
style.styleSheet.cssText=text;
}else{
style.textContent=text;
}
return info.width==='1px';
}};}
return function (media){
return {
matches: styleMedia.matchMedium(media||'all'),
media: media||'all'
};};
}());
function parseStyleToObject(str){
var styleObject={};
if(typeof str!=='string'){
return styleObject;
}
str=str.trim().slice(1, -1);
if(!str){
return styleObject;
}
styleObject=str.split('&').reduce(function (ret, param){
var parts=param.replace(/\+/g, ' ').split('=');
var key=parts[0];
var val=parts[1];
key=decodeURIComponent(key);
val=val===undefined ? null:decodeURIComponent(val);
if(!ret.hasOwnProperty(key)){
ret[key]=val;
}else if(Array.isArray(ret[key])){
ret[key].push(val);
}else{
ret[key]=[ret[key], val];
}
return ret;
}, {});
return styleObject;
}
Foundation.MediaQuery=MediaQuery;
}(jQuery);
;'use strict';
!function ($){
var initClasses=['mui-enter', 'mui-leave'];
var activeClasses=['mui-enter-active', 'mui-leave-active'];
var Motion={
animateIn: function (element, animation, cb){
animate(true, element, animation, cb);
},
animateOut: function (element, animation, cb){
animate(false, element, animation, cb);
}};
function Move(duration, elem, fn){
var anim,
prog,
start=null;
if(duration===0){
fn.apply(elem);
elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
return;
}
function move(ts){
if(!start) start=ts;
prog=ts - start;
fn.apply(elem);
if(prog < duration){
anim=window.requestAnimationFrame(move, elem);
}else{
window.cancelAnimationFrame(anim);
elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
}}
anim=window.requestAnimationFrame(move);
}
function animate(isIn, element, animation, cb){
element=$(element).eq(0);
if(!element.length) return;
var initClass=isIn ? initClasses[0]:initClasses[1];
var activeClass=isIn ? activeClasses[0]:activeClasses[1];
reset();
element.addClass(animation).css('transition', 'none');
requestAnimationFrame(function (){
element.addClass(initClass);
if(isIn) element.show();
});
requestAnimationFrame(function (){
element[0].offsetWidth;
element.css('transition', '').addClass(activeClass);
});
element.one(Foundation.transitionend(element), finish);
function finish(){
if(!isIn) element.hide();
reset();
if(cb) cb.apply(element);
}
function reset(){
element[0].style.transitionDuration=0;
element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
}}
Foundation.Move=Move;
Foundation.Motion=Motion;
}(jQuery);
;'use strict';
!function ($){
var Nest={
Feather: function (menu){
var type=arguments.length > 1&&arguments[1]!==undefined ? arguments[1]:'zf';
menu.attr('role', 'menubar');
var items=menu.find('li').attr({ 'role': 'menuitem' }),
subMenuClass='is-' + type + '-submenu',
subItemClass=subMenuClass + '-item',
hasSubClass='is-' + type + '-submenu-parent';
items.each(function (){
var $item=$(this),
$sub=$item.children('ul');
if($sub.length){
$item.addClass(hasSubClass).attr({
'aria-haspopup': true,
'aria-label': $item.children('a:first').text()
});
if(type==='drilldown'){
$item.attr({ 'aria-expanded': false });
}
$sub.addClass('submenu ' + subMenuClass).attr({
'data-submenu': '',
'role': 'menu'
});
if(type==='drilldown'){
$sub.attr({ 'aria-hidden': true });
}}
if($item.parent('[data-submenu]').length){
$item.addClass('is-submenu-item ' + subItemClass);
}});
return;
},
Burn: function (menu, type){
var
subMenuClass='is-' + type + '-submenu',
subItemClass=subMenuClass + '-item',
hasSubClass='is-' + type + '-submenu-parent';
menu.find('>li, .menu, .menu > li').removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').removeAttr('data-submenu').css('display', '');
}};
Foundation.Nest=Nest;
}(jQuery);
;'use strict';
!function ($){
function Timer(elem, options, cb){
var _this=this,
duration=options.duration,
nameSpace=Object.keys(elem.data())[0]||'timer',
remain=-1,
start,
timer;
this.isPaused=false;
this.restart=function (){
remain=-1;
clearTimeout(timer);
this.start();
};
this.start=function (){
this.isPaused=false;
clearTimeout(timer);
remain=remain <=0 ? duration:remain;
elem.data('paused', false);
start=Date.now();
timer=setTimeout(function (){
if(options.infinite){
_this.restart();
}
if(cb&&typeof cb==='function'){
cb();
}}, remain);
elem.trigger('timerstart.zf.' + nameSpace);
};
this.pause=function (){
this.isPaused=true;
clearTimeout(timer);
elem.data('paused', true);
var end=Date.now();
remain=remain - (end - start);
elem.trigger('timerpaused.zf.' + nameSpace);
};}
function onImagesLoaded(images, callback){
var self=this,
unloaded=images.length;
if(unloaded===0){
callback();
}
images.each(function (){
if(this.complete||this.readyState===4||this.readyState==='complete'){
singleImageLoaded();
}else{
var src=$(this).attr('src');
$(this).attr('src', src + (src.indexOf('?') >=0 ? '&':'?') + new Date().getTime());
$(this).one('load', function (){
singleImageLoaded();
});
}});
function singleImageLoaded(){
unloaded--;
if(unloaded===0){
callback();
}}
}
Foundation.Timer=Timer;
Foundation.onImagesLoaded=onImagesLoaded;
}(jQuery);
;'use strict';
(function ($){
$.spotSwipe={
version: '1.0.0',
enabled: 'ontouchstart' in document.documentElement,
preventDefault: false,
moveThreshold: 75,
timeThreshold: 200
};
var startPosX,
startPosY,
startTime,
elapsedTime,
isMoving=false;
function onTouchEnd(){
this.removeEventListener('touchmove', onTouchMove);
this.removeEventListener('touchend', onTouchEnd);
isMoving=false;
}
function onTouchMove(e){
if($.spotSwipe.preventDefault){
e.preventDefault();
}
if(isMoving){
var x=e.touches[0].pageX;
var y=e.touches[0].pageY;
var dx=startPosX - x;
var dy=startPosY - y;
var dir;
elapsedTime=new Date().getTime() - startTime;
if(Math.abs(dx) >=$.spotSwipe.moveThreshold&&elapsedTime <=$.spotSwipe.timeThreshold){
dir=dx > 0 ? 'left':'right';
}
if(dir){
e.preventDefault();
onTouchEnd.call(this);
$(this).trigger('swipe', dir).trigger('swipe' + dir);
}}
}
function onTouchStart(e){
if(e.touches.length==1){
startPosX=e.touches[0].pageX;
startPosY=e.touches[0].pageY;
isMoving=true;
startTime=new Date().getTime();
this.addEventListener('touchmove', onTouchMove, false);
this.addEventListener('touchend', onTouchEnd, false);
}}
function init(){
this.addEventListener&&this.addEventListener('touchstart', onTouchStart, false);
}
function teardown(){
this.removeEventListener('touchstart', onTouchStart);
}
$.event.special.swipe={ setup: init };
$.each(['left', 'up', 'down', 'right'], function (){
$.event.special['swipe' + this]={ setup: function (){
$(this).on('swipe', $.noop);
}};});
})(jQuery);
!function ($){
$.fn.addTouch=function (){
this.each(function (i, el){
$(el).bind('touchstart touchmove touchend touchcancel', function (){
handleTouch(event);
});
});
var handleTouch=function (event){
var touches=event.changedTouches,
first=touches[0],
eventTypes={
touchstart: 'mousedown',
touchmove: 'mousemove',
touchend: 'mouseup'
},
type=eventTypes[event.type],
simulatedEvent;
if('MouseEvent' in window&&typeof window.MouseEvent==='function'){
simulatedEvent=new window.MouseEvent(type, {
'bubbles': true,
'cancelable': true,
'screenX': first.screenX,
'screenY': first.screenY,
'clientX': first.clientX,
'clientY': first.clientY
});
}else{
simulatedEvent=document.createEvent('MouseEvent');
simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 , null);
}
first.target.dispatchEvent(simulatedEvent);
};};
}(jQuery);
/* Removing the jQuery function ****
************************************
(function($, window, undefined){
var $document=$(document),
touchStartEvent='touchstart'
touchStopEvent='touchend'
touchMoveEvent='touchmove'
$.each(( "touchstart touchmove touchend " +
"swipe swipeleft swiperight").split(" "), function(i, name){
$.fn[ name ]=function(fn){
return fn ? this.bind(name, fn):this.trigger(name);
};
if($.attrFn){
$.attrFn[ name ]=true;
}});
function triggerCustomEvent(obj, eventType, event, bubble){
var originalType=event.type;
event.type=eventType;
if(bubble){
$.event.trigger(event, undefined, obj);
}else{
$.event.dispatch.call(obj, event);
}
event.type=originalType;
}
$.event.special.swipe={
scrollSupressionThreshold: 30,
durationThreshold: 1000,
horizontalDistanceThreshold: window.devicePixelRatio >=2 ? 15:30,
verticalDistanceThreshold: window.devicePixelRatio >=2 ? 15:30,
getLocation: function(event){
var winPageX=window.pageXOffset,
winPageY=window.pageYOffset,
x=event.clientX,
y=event.clientY;
if(event.pageY===0&&Math.floor(y) > Math.floor(event.pageY) ||
event.pageX===0&&Math.floor(x) > Math.floor(event.pageX)){
x=x - winPageX;
y=y - winPageY;
}else if(y <(event.pageY - winPageY)||x <(event.pageX - winPageX)){
x=event.pageX - winPageX;
y=event.pageY - winPageY;
}
return {
x: x,
y: y
};},
start: function(event){
var data=event.originalEvent.touches ?
event.originalEvent.touches[ 0 ]:event,
location=$.event.special.swipe.getLocation(data);
return {
time:(new Date()).getTime(),
coords: [ location.x, location.y ],
origin: $(event.target)
};},
stop: function(event){
var data=event.originalEvent.touches ?
event.originalEvent.touches[ 0 ]:event,
location=$.event.special.swipe.getLocation(data);
return {
time:(new Date()).getTime(),
coords: [ location.x, location.y ]
};},
handleSwipe: function(start, stop, thisObject, origTarget){
if(stop.time - start.time < $.event.special.swipe.durationThreshold &&
Math.abs(start.coords[ 0 ] - stop.coords[ 0 ]) > $.event.special.swipe.horizontalDistanceThreshold &&
Math.abs(start.coords[ 1 ] - stop.coords[ 1 ]) < $.event.special.swipe.verticalDistanceThreshold){
var direction=start.coords[0] > stop.coords[ 0 ] ? "swipeleft":"swiperight";
triggerCustomEvent(thisObject, "swipe", $.Event("swipe", { target: origTarget, swipestart: start, swipestop: stop }), true);
triggerCustomEvent(thisObject, direction,$.Event(direction, { target: origTarget, swipestart: start, swipestop: stop }), true);
return true;
}
return false;
},
eventInProgress: false,
setup: function(){
var events,
thisObject=this,
$this=$(thisObject),
context={};
events=$.data(this, "mobile-events");
if(!events){
events={ length: 0 };
$.data(this, "mobile-events", events);
}
events.length++;
events.swipe=context;
context.start=function(event){
if($.event.special.swipe.eventInProgress){
return;
}
$.event.special.swipe.eventInProgress=true;
var stop,
start=$.event.special.swipe.start(event),
origTarget=event.target,
emitted=false;
context.move=function(event){
if(!start||event.isDefaultPrevented()){
return;
}
stop=$.event.special.swipe.stop(event);
if(!emitted){
emitted=$.event.special.swipe.handleSwipe(start, stop, thisObject, origTarget);
if(emitted){
$.event.special.swipe.eventInProgress=false;
}}
if(Math.abs(start.coords[ 0 ] - stop.coords[ 0 ]) > $.event.special.swipe.scrollSupressionThreshold){
event.preventDefault();
}};
context.stop=function(){
emitted=true;
$.event.special.swipe.eventInProgress=false;
$document.off(touchMoveEvent, context.move);
context.move=null;
};
$document.on(touchMoveEvent, context.move)
.one(touchStopEvent, context.stop);
};
$this.on(touchStartEvent, context.start);
},
teardown: function(){
var events, context;
events=$.data(this, "mobile-events");
if(events){
context=events.swipe;
delete events.swipe;
events.length--;
if(events.length===0){
$.removeData(this, "mobile-events");
}}
if(context){
if(context.start){
$(this).off(touchStartEvent, context.start);
}
if(context.move){
$document.off(touchMoveEvent, context.move);
}
if(context.stop){
$document.off(touchStopEvent, context.stop);
}}
}};
$.each({
swipeleft: "swipe.left",
swiperight: "swipe.right"
}, function(event, sourceEvent){
$.event.special[ event ]={
setup: function(){
$(this).bind(sourceEvent, $.noop);
},
teardown: function(){
$(this).unbind(sourceEvent);
}};});
})(jQuery, this);
*/
;'use strict';
!function ($){
var MutationObserver=function (){
var prefixes=['WebKit', 'Moz', 'O', 'Ms', ''];
for (var i=0; i < prefixes.length; i++){
if(prefixes[i] + 'MutationObserver' in window){
return window[prefixes[i] + 'MutationObserver'];
}}
return false;
}();
var triggers=function (el, type){
el.data(type).split(' ').forEach(function (id){
$('#' + id)[type==='close' ? 'trigger':'triggerHandler'](type + '.zf.trigger', [el]);
});
};
$(document).on('click.zf.trigger', '[data-open]', function (){
triggers($(this), 'open');
});
$(document).on('click.zf.trigger', '[data-close]', function (){
var id=$(this).data('close');
if(id){
triggers($(this), 'close');
}else{
$(this).trigger('close.zf.trigger');
}});
$(document).on('click.zf.trigger', '[data-toggle]', function (){
var id=$(this).data('toggle');
if(id){
triggers($(this), 'toggle');
}else{
$(this).trigger('toggle.zf.trigger');
}});
$(document).on('close.zf.trigger', '[data-closable]', function (e){
e.stopPropagation();
var animation=$(this).data('closable');
if(animation!==''){
Foundation.Motion.animateOut($(this), animation, function (){
$(this).trigger('closed.zf');
});
}else{
$(this).fadeOut().trigger('closed.zf');
}});
$(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function (){
var id=$(this).data('toggle-focus');
$('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
});
$(window).on('load', function (){
checkListeners();
});
function checkListeners(){
eventsListener();
resizeListener();
scrollListener();
closemeListener();
}
function closemeListener(pluginName){
var yetiBoxes=$('[data-yeti-box]'),
plugNames=['dropdown', 'tooltip', 'reveal'];
if(pluginName){
if(typeof pluginName==='string'){
plugNames.push(pluginName);
}else if(typeof pluginName==='object'&&typeof pluginName[0]==='string'){
plugNames.concat(pluginName);
}else{
console.error('Plugin names must be strings');
}}
if(yetiBoxes.length){
var listeners=plugNames.map(function (name){
return 'closeme.zf.' + name;
}).join(' ');
$(window).off(listeners).on(listeners, function (e, pluginId){
var plugin=e.namespace.split('.')[0];
var plugins=$('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');
plugins.each(function (){
var _this=$(this);
_this.triggerHandler('close.zf.trigger', [_this]);
});
});
}}
function resizeListener(debounce){
var timer=void 0,
$nodes=$('[data-resize]');
if($nodes.length){
$(window).off('resize.zf.trigger').on('resize.zf.trigger', function (e){
if(timer){
clearTimeout(timer);
}
timer=setTimeout(function (){
if(!MutationObserver){
$nodes.each(function (){
$(this).triggerHandler('resizeme.zf.trigger');
});
}
$nodes.attr('data-events', "resize");
}, debounce||10);
});
}}
function scrollListener(debounce){
var timer=void 0,
$nodes=$('[data-scroll]');
if($nodes.length){
$(window).off('scroll.zf.trigger').on('scroll.zf.trigger', function (e){
if(timer){
clearTimeout(timer);
}
timer=setTimeout(function (){
if(!MutationObserver){
$nodes.each(function (){
$(this).triggerHandler('scrollme.zf.trigger');
});
}
$nodes.attr('data-events', "scroll");
}, debounce||10);
});
}}
function eventsListener(){
if(!MutationObserver){
return false;
}
var nodes=document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');
var listeningElementsMutation=function (mutationRecordsList){
var $target=$(mutationRecordsList[0].target);
switch (mutationRecordsList[0].type){
case "attributes":
if($target.attr("data-events")==="scroll"&&mutationRecordsList[0].attributeName==="data-events"){
$target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
}
if($target.attr("data-events")==="resize"&&mutationRecordsList[0].attributeName==="data-events"){
$target.triggerHandler('resizeme.zf.trigger', [$target]);
}
if(mutationRecordsList[0].attributeName==="style"){
$target.closest("[data-mutate]").attr("data-events", "mutate");
$target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
}
break;
case "childList":
$target.closest("[data-mutate]").attr("data-events", "mutate");
$target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
break;
default:
return false;
}};
if(nodes.length){
for (var i=0; i <=nodes.length - 1; i++){
var elementObserver=new MutationObserver(listeningElementsMutation);
elementObserver.observe(nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] });
}}
}
Foundation.IHearYou=checkListeners;
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var Abide=function (){
function Abide(element){
var options=arguments.length > 1&&arguments[1]!==undefined ? arguments[1]:{};
_classCallCheck(this, Abide);
this.$element=element;
this.options=$.extend({}, Abide.defaults, this.$element.data(), options);
this._init();
Foundation.registerPlugin(this, 'Abide');
}
_createClass(Abide, [{
key: '_init',
value: function _init(){
this.$inputs=this.$element.find('input, textarea, select');
this._events();
}
}, {
key: '_events',
value: function _events(){
var _this2=this;
this.$element.off('.abide').on('reset.zf.abide', function (){
_this2.resetForm();
}).on('submit.zf.abide', function (){
return _this2.validateForm();
});
if(this.options.validateOn==='fieldChange'){
this.$inputs.off('change.zf.abide').on('change.zf.abide', function (e){
_this2.validateInput($(e.target));
});
}
if(this.options.liveValidate){
this.$inputs.off('input.zf.abide').on('input.zf.abide', function (e){
_this2.validateInput($(e.target));
});
}
if(this.options.validateOnBlur){
this.$inputs.off('blur.zf.abide').on('blur.zf.abide', function (e){
_this2.validateInput($(e.target));
});
}}
}, {
key: '_reflow',
value: function _reflow(){
this._init();
}
}, {
key: 'requiredCheck',
value: function requiredCheck($el){
if(!$el.attr('required')) return true;
var isGood=true;
switch ($el[0].type){
case 'checkbox':
isGood=$el[0].checked;
break;
case 'select':
case 'select-one':
case 'select-multiple':
var opt=$el.find('option:selected');
if(!opt.length||!opt.val()) isGood=false;
break;
default:
if(!$el.val()||!$el.val().length) isGood=false;
}
return isGood;
}
}, {
key: 'findFormError',
value: function findFormError($el){
var id=$el[0].id;
var $error=$el.siblings(this.options.formErrorSelector);
if(!$error.length){
$error=$el.parent().find(this.options.formErrorSelector);
}
$error=$error.add(this.$element.find('[data-form-error-for="' + id + '"]'));
return $error;
}
}, {
key: 'findLabel',
value: function findLabel($el){
var id=$el[0].id;
var $label=this.$element.find('label[for="' + id + '"]');
if(!$label.length){
return $el.closest('label');
}
return $label;
}
}, {
key: 'findRadioLabels',
value: function findRadioLabels($els){
var _this3=this;
var labels=$els.map(function (i, el){
var id=el.id;
var $label=_this3.$element.find('label[for="' + id + '"]');
if(!$label.length){
$label=$(el).closest('label');
}
return $label[0];
});
return $(labels);
}
}, {
key: 'addErrorClasses',
value: function addErrorClasses($el){
var $label=this.findLabel($el);
var $formError=this.findFormError($el);
if($label.length){
$label.addClass(this.options.labelErrorClass);
}
if($formError.length){
$formError.addClass(this.options.formErrorClass);
}
$el.addClass(this.options.inputErrorClass).attr('data-invalid', '');
}
}, {
key: 'removeRadioErrorClasses',
value: function removeRadioErrorClasses(groupName){
var $els=this.$element.find(':radio[name="' + groupName + '"]');
var $labels=this.findRadioLabels($els);
var $formErrors=this.findFormError($els);
if($labels.length){
$labels.removeClass(this.options.labelErrorClass);
}
if($formErrors.length){
$formErrors.removeClass(this.options.formErrorClass);
}
$els.removeClass(this.options.inputErrorClass).removeAttr('data-invalid');
}
}, {
key: 'removeErrorClasses',
value: function removeErrorClasses($el){
if($el[0].type=='radio'){
return this.removeRadioErrorClasses($el.attr('name'));
}
var $label=this.findLabel($el);
var $formError=this.findFormError($el);
if($label.length){
$label.removeClass(this.options.labelErrorClass);
}
if($formError.length){
$formError.removeClass(this.options.formErrorClass);
}
$el.removeClass(this.options.inputErrorClass).removeAttr('data-invalid');
}
}, {
key: 'validateInput',
value: function validateInput($el){
var clearRequire=this.requiredCheck($el),
validated=false,
customValidator=true,
validator=$el.attr('data-validator'),
equalTo=true;
if($el.is('[data-abide-ignore]')||$el.is('[type="hidden"]')||$el.is('[disabled]')){
return true;
}
switch ($el[0].type){
case 'radio':
validated=this.validateRadio($el.attr('name'));
break;
case 'checkbox':
validated=clearRequire;
break;
case 'select':
case 'select-one':
case 'select-multiple':
validated=clearRequire;
break;
default:
validated=this.validateText($el);
}
if(validator){
customValidator=this.matchValidation($el, validator, $el.attr('required'));
}
if($el.attr('data-equalto')){
equalTo=this.options.validators.equalTo($el);
}
var goodToGo=[clearRequire, validated, customValidator, equalTo].indexOf(false)===-1;
var message=(goodToGo ? 'valid':'invalid') + '.zf.abide';
if(goodToGo){
var dependentElements=this.$element.find('[data-equalto="' + $el.attr('id') + '"]');
if(dependentElements.length){
var _this=this;
dependentElements.each(function (){
if($(this).val()){
_this.validateInput($(this));
}});
}}
this[goodToGo ? 'removeErrorClasses':'addErrorClasses']($el);
$el.trigger(message, [$el]);
return goodToGo;
}
}, {
key: 'validateForm',
value: function validateForm(){
var acc=[];
var _this=this;
this.$inputs.each(function (){
acc.push(_this.validateInput($(this)));
});
var noError=acc.indexOf(false)===-1;
this.$element.find('[data-abide-error]').css('display', noError ? 'none':'block');
this.$element.trigger((noError ? 'formvalid':'forminvalid') + '.zf.abide', [this.$element]);
return noError;
}
}, {
key: 'validateText',
value: function validateText($el, pattern){
pattern=pattern||$el.attr('pattern')||$el.attr('type');
var inputText=$el.val();
var valid=false;
if(inputText.length){
if(this.options.patterns.hasOwnProperty(pattern)){
valid=this.options.patterns[pattern].test(inputText);
}
else if(pattern!==$el.attr('type')){
valid=new RegExp(pattern).test(inputText);
}else{
valid=true;
}}
else if(!$el.prop('required')){
valid=true;
}
return valid;
}
}, {
key: 'validateRadio',
value: function validateRadio(groupName){
var $group=this.$element.find(':radio[name="' + groupName + '"]');
var valid=false,
required=false;
$group.each(function (i, e){
if($(e).attr('required')){
required=true;
}});
if(!required) valid=true;
if(!valid){
$group.each(function (i, e){
if($(e).prop('checked')){
valid=true;
}});
};
return valid;
}
}, {
key: 'matchValidation',
value: function matchValidation($el, validators, required){
var _this4=this;
required=required ? true:false;
var clear=validators.split(' ').map(function (v){
return _this4.options.validators[v]($el, required, $el.parent());
});
return clear.indexOf(false)===-1;
}
}, {
key: 'resetForm',
value: function resetForm(){
var $form=this.$element,
opts=this.options;
$('.' + opts.labelErrorClass, $form).not('small').removeClass(opts.labelErrorClass);
$('.' + opts.inputErrorClass, $form).not('small').removeClass(opts.inputErrorClass);
$(opts.formErrorSelector + '.' + opts.formErrorClass).removeClass(opts.formErrorClass);
$form.find('[data-abide-error]').css('display', 'none');
$(':input', $form).not(':button, :submit, :reset, :hidden, :radio, :checkbox, [data-abide-ignore]').val('').removeAttr('data-invalid');
$(':input:radio', $form).not('[data-abide-ignore]').prop('checked', false).removeAttr('data-invalid');
$(':input:checkbox', $form).not('[data-abide-ignore]').prop('checked', false).removeAttr('data-invalid');
$form.trigger('formreset.zf.abide', [$form]);
}
}, {
key: 'destroy',
value: function destroy(){
var _this=this;
this.$element.off('.abide').find('[data-abide-error]').css('display', 'none');
this.$inputs.off('.abide').each(function (){
_this.removeErrorClasses($(this));
});
Foundation.unregisterPlugin(this);
}}]);
return Abide;
}();
Abide.defaults={
validateOn: 'fieldChange',
labelErrorClass: 'is-invalid-label',
inputErrorClass: 'is-invalid-input',
formErrorSelector: '.form-error',
formErrorClass: 'is-visible',
liveValidate: false,
validateOnBlur: false,
patterns: {
alpha: /^[a-zA-Z]+$/,
alpha_numeric: /^[a-zA-Z0-9]+$/,
integer: /^[-+]?\d+$/,
number: /^[-+]?\d*(?:[\.\,]\d+)?$/,
card: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
cvv: /^([0-9]){3,4}$/,
email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
url: /^(https?|ftp|file|ssh):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/,
domain: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,8}$/,
datetime: /^([0-2][0-9]{3})\-([0-1][0-9])\-([0-3][0-9])T([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])(Z|([\-\+]([0-1][0-9])\:00))$/,
date: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/,
time: /^(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}$/,
dateISO: /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,
month_day_year: /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d{4}$/,
day_month_year: /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]\d{4}$/,
color: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
},
validators: {
equalTo: function (el, required, parent){
return $('#' + el.attr('data-equalto')).val()===el.val();
}}
};Foundation.plugin(Abide, 'Abide');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var Accordion=function (){
function Accordion(element, options){
_classCallCheck(this, Accordion);
this.$element=element;
this.options=$.extend({}, Accordion.defaults, this.$element.data(), options);
this._init();
Foundation.registerPlugin(this, 'Accordion');
Foundation.Keyboard.register('Accordion', {
'ENTER': 'toggle',
'SPACE': 'toggle',
'ARROW_DOWN': 'next',
'ARROW_UP': 'previous'
});
}
_createClass(Accordion, [{
key: '_init',
value: function _init(){
var _this2=this;
this.$element.attr('role', 'tablist');
this.$tabs=this.$element.children('[data-accordion-item]');
this.$tabs.each(function (idx, el){
var $el=$(el),
$content=$el.children('[data-tab-content]'),
id=$content[0].id||Foundation.GetYoDigits(6, 'accordion'),
linkId=el.id||id + '-label';
$el.find('a:first').attr({
'aria-controls': id,
'role': 'tab',
'id': linkId,
'aria-expanded': false,
'aria-selected': false
});
$content.attr({ 'role': 'tabpanel', 'aria-labelledby': linkId, 'aria-hidden': true, 'id': id });
});
var $initActive=this.$element.find('.is-active').children('[data-tab-content]');
this.firstTimeInit=true;
if($initActive.length){
this.down($initActive, this.firstTimeInit);
this.firstTimeInit=false;
}
this._checkDeepLink=function (){
var anchor=window.location.hash;
if(anchor.length){
var $link=_this2.$element.find('[href$="' + anchor + '"]'),
$anchor=$(anchor);
if($link.length&&$anchor){
if(!$link.parent('[data-accordion-item]').hasClass('is-active')){
_this2.down($anchor, _this2.firstTimeInit);
_this2.firstTimeInit=false;
};
if(_this2.options.deepLinkSmudge){
var _this=_this2;
$(window).load(function (){
var offset=_this.$element.offset();
$('html, body').animate({ scrollTop: offset.top }, _this.options.deepLinkSmudgeDelay);
});
}
_this2.$element.trigger('deeplink.zf.accordion', [$link, $anchor]);
}}
};
if(this.options.deepLink){
this._checkDeepLink();
}
this._events();
}
}, {
key: '_events',
value: function _events(){
var _this=this;
this.$tabs.each(function (){
var $elem=$(this);
var $tabContent=$elem.children('[data-tab-content]');
if($tabContent.length){
$elem.children('a').off('click.zf.accordion keydown.zf.accordion').on('click.zf.accordion', function (e){
e.preventDefault();
_this.toggle($tabContent);
}).on('keydown.zf.accordion', function (e){
Foundation.Keyboard.handleKey(e, 'Accordion', {
toggle: function (){
_this.toggle($tabContent);
},
next: function (){
var $a=$elem.next().find('a').focus();
if(!_this.options.multiExpand){
$a.trigger('click.zf.accordion');
}},
previous: function (){
var $a=$elem.prev().find('a').focus();
if(!_this.options.multiExpand){
$a.trigger('click.zf.accordion');
}},
handled: function (){
e.preventDefault();
e.stopPropagation();
}});
});
}});
if(this.options.deepLink){
$(window).on('popstate', this._checkDeepLink);
}}
}, {
key: 'toggle',
value: function toggle($target){
if($target.parent().hasClass('is-active')){
this.up($target);
}else{
this.down($target);
}
if(this.options.deepLink){
var anchor=$target.prev('a').attr('href');
if(this.options.updateHistory){
history.pushState({}, '', anchor);
}else{
history.replaceState({}, '', anchor);
}}
}
}, {
key: 'down',
value: function down($target, firstTime){
var _this3=this;
$target.attr('aria-hidden', false).parent('[data-tab-content]').addBack().parent().addClass('is-active');
if(!this.options.multiExpand&&!firstTime){
var $currentActive=this.$element.children('.is-active').children('[data-tab-content]');
if($currentActive.length){
this.up($currentActive.not($target));
}}
$target.slideDown(this.options.slideSpeed, function (){
_this3.$element.trigger('down.zf.accordion', [$target]);
});
$('#' + $target.attr('aria-labelledby')).attr({
'aria-expanded': true,
'aria-selected': true
});
}
}, {
key: 'up',
value: function up($target){
var $aunts=$target.parent().siblings(),
_this=this;
if(!this.options.allowAllClosed&&!$aunts.hasClass('is-active')||!$target.parent().hasClass('is-active')){
return;
}
$target.slideUp(_this.options.slideSpeed, function (){
_this.$element.trigger('up.zf.accordion', [$target]);
});
$target.attr('aria-hidden', true).parent().removeClass('is-active');
$('#' + $target.attr('aria-labelledby')).attr({
'aria-expanded': false,
'aria-selected': false
});
}
}, {
key: 'destroy',
value: function destroy(){
this.$element.find('[data-tab-content]').stop(true).slideUp(0).css('display', '');
this.$element.find('a').off('.zf.accordion');
if(this.options.deepLink){
$(window).off('popstate', this._checkDeepLink);
}
Foundation.unregisterPlugin(this);
}}]);
return Accordion;
}();
Accordion.defaults={
slideSpeed: 250,
multiExpand: false,
allowAllClosed: false,
deepLink: false,
deepLinkSmudge: false,
deepLinkSmudgeDelay: 300,
updateHistory: false
};
Foundation.plugin(Accordion, 'Accordion');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var AccordionMenu=function (){
function AccordionMenu(element, options){
_classCallCheck(this, AccordionMenu);
this.$element=element;
this.options=$.extend({}, AccordionMenu.defaults, this.$element.data(), options);
Foundation.Nest.Feather(this.$element, 'accordion');
this._init();
Foundation.registerPlugin(this, 'AccordionMenu');
Foundation.Keyboard.register('AccordionMenu', {
'ENTER': 'toggle',
'SPACE': 'toggle',
'ARROW_RIGHT': 'open',
'ARROW_UP': 'up',
'ARROW_DOWN': 'down',
'ARROW_LEFT': 'close',
'ESCAPE': 'closeAll'
});
}
_createClass(AccordionMenu, [{
key: '_init',
value: function _init(){
this.$element.find('[data-submenu]').not('.is-active').slideUp(0);
this.$element.attr({
'role': 'menu',
'aria-multiselectable': this.options.multiOpen
});
this.$menuLinks=this.$element.find('.is-accordion-submenu-parent');
this.$menuLinks.each(function (){
var linkId=this.id||Foundation.GetYoDigits(6, 'acc-menu-link'),
$elem=$(this),
$sub=$elem.children('[data-submenu]'),
subId=$sub[0].id||Foundation.GetYoDigits(6, 'acc-menu'),
isActive=$sub.hasClass('is-active');
$elem.attr({
'aria-controls': subId,
'aria-expanded': isActive,
'role': 'menuitem',
'id': linkId
});
$sub.attr({
'aria-labelledby': linkId,
'aria-hidden': !isActive,
'role': 'menu',
'id': subId
});
});
var initPanes=this.$element.find('.is-active');
if(initPanes.length){
var _this=this;
initPanes.each(function (){
_this.down($(this));
});
}
this._events();
}
}, {
key: '_events',
value: function _events(){
var _this=this;
this.$element.find('li').each(function (){
var $submenu=$(this).children('[data-submenu]');
if($submenu.length){
$(this).children('a').off('click.zf.accordionMenu').on('click.zf.accordionMenu', function (e){
e.preventDefault();
_this.toggle($submenu);
});
}}).on('keydown.zf.accordionmenu', function (e){
var $element=$(this),
$elements=$element.parent('ul').children('li'),
$prevElement,
$nextElement,
$target=$element.children('[data-submenu]');
$elements.each(function (i){
if($(this).is($element)){
$prevElement=$elements.eq(Math.max(0, i - 1)).find('a').first();
$nextElement=$elements.eq(Math.min(i + 1, $elements.length - 1)).find('a').first();
if($(this).children('[data-submenu]:visible').length){
$nextElement=$element.find('li:first-child').find('a').first();
}
if($(this).is(':first-child')){
$prevElement=$element.parents('li').first().find('a').first();
}else if($prevElement.parents('li').first().children('[data-submenu]:visible').length){
$prevElement=$prevElement.parents('li').find('li:last-child').find('a').first();
}
if($(this).is(':last-child')){
$nextElement=$element.parents('li').first().next('li').find('a').first();
}
return;
}});
Foundation.Keyboard.handleKey(e, 'AccordionMenu', {
open: function (){
if($target.is(':hidden')){
_this.down($target);
$target.find('li').first().find('a').first().focus();
}},
close: function (){
if($target.length&&!$target.is(':hidden')){
_this.up($target);
}else if($element.parent('[data-submenu]').length){
_this.up($element.parent('[data-submenu]'));
$element.parents('li').first().find('a').first().focus();
}},
up: function (){
$prevElement.focus();
return true;
},
down: function (){
$nextElement.focus();
return true;
},
toggle: function (){
if($element.children('[data-submenu]').length){
_this.toggle($element.children('[data-submenu]'));
}},
closeAll: function (){
_this.hideAll();
},
handled: function (preventDefault){
if(preventDefault){
e.preventDefault();
}
e.stopImmediatePropagation();
}});
});
}
}, {
key: 'hideAll',
value: function hideAll(){
this.up(this.$element.find('[data-submenu]'));
}
}, {
key: 'showAll',
value: function showAll(){
this.down(this.$element.find('[data-submenu]'));
}
}, {
key: 'toggle',
value: function toggle($target){
if(!$target.is(':animated')){
if(!$target.is(':hidden')){
this.up($target);
}else{
this.down($target);
}}
}
}, {
key: 'down',
value: function down($target){
var _this=this;
if(!this.options.multiOpen){
this.up(this.$element.find('.is-active').not($target.parentsUntil(this.$element).add($target)));
}
$target.addClass('is-active').attr({ 'aria-hidden': false }).parent('.is-accordion-submenu-parent').attr({ 'aria-expanded': true });
$target.slideDown(_this.options.slideSpeed, function (){
_this.$element.trigger('down.zf.accordionMenu', [$target]);
});
}
}, {
key: 'up',
value: function up($target){
var _this=this;
$target.slideUp(_this.options.slideSpeed, function (){
_this.$element.trigger('up.zf.accordionMenu', [$target]);
});
var $menus=$target.find('[data-submenu]').slideUp(0).addBack().attr('aria-hidden', true);
$menus.parent('.is-accordion-submenu-parent').attr('aria-expanded', false);
}
}, {
key: 'destroy',
value: function destroy(){
this.$element.find('[data-submenu]').slideDown(0).css('display', '');
this.$element.find('a').off('click.zf.accordionMenu');
Foundation.Nest.Burn(this.$element, 'accordion');
Foundation.unregisterPlugin(this);
}}]);
return AccordionMenu;
}();
AccordionMenu.defaults={
slideSpeed: 250,
multiOpen: true
};
Foundation.plugin(AccordionMenu, 'AccordionMenu');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var Drilldown=function (){
function Drilldown(element, options){
_classCallCheck(this, Drilldown);
this.$element=element;
this.options=$.extend({}, Drilldown.defaults, this.$element.data(), options);
Foundation.Nest.Feather(this.$element, 'drilldown');
this._init();
Foundation.registerPlugin(this, 'Drilldown');
Foundation.Keyboard.register('Drilldown', {
'ENTER': 'open',
'SPACE': 'open',
'ARROW_RIGHT': 'next',
'ARROW_UP': 'up',
'ARROW_DOWN': 'down',
'ARROW_LEFT': 'previous',
'ESCAPE': 'close',
'TAB': 'down',
'SHIFT_TAB': 'up'
});
}
_createClass(Drilldown, [{
key: '_init',
value: function _init(){
this.$submenuAnchors=this.$element.find('li.is-drilldown-submenu-parent').children('a');
this.$submenus=this.$submenuAnchors.parent('li').children('[data-submenu]');
this.$menuItems=this.$element.find('li').not('.js-drilldown-back').attr('role', 'menuitem').find('a');
this.$element.attr('data-mutate', this.$element.attr('data-drilldown')||Foundation.GetYoDigits(6, 'drilldown'));
this._prepareMenu();
this._registerEvents();
this._keyboardEvents();
}
}, {
key: '_prepareMenu',
value: function _prepareMenu(){
var _this=this;
this.$submenuAnchors.each(function (){
var $link=$(this);
var $sub=$link.parent();
if(_this.options.parentLink){
$link.clone().prependTo($sub.children('[data-submenu]')).wrap('<li class="is-submenu-parent-item is-submenu-item is-drilldown-submenu-item" role="menu-item"></li>');
}
$link.data('savedHref', $link.attr('href')).removeAttr('href').attr('tabindex', 0);
$link.children('[data-submenu]').attr({
'aria-hidden': true,
'tabindex': 0,
'role': 'menu'
});
_this._events($link);
});
this.$submenus.each(function (){
var $menu=$(this),
$back=$menu.find('.js-drilldown-back');
if(!$back.length){
switch (_this.options.backButtonPosition){
case "bottom":
$menu.append(_this.options.backButton);
break;
case "top":
$menu.prepend(_this.options.backButton);
break;
default:
console.error("Unsupported backButtonPosition value '" + _this.options.backButtonPosition + "'");
}}
_this._back($menu);
});
this.$submenus.addClass('invisible');
if(!this.options.autoHeight){
this.$submenus.addClass('drilldown-submenu-cover-previous');
}
if(!this.$element.parent().hasClass('is-drilldown')){
this.$wrapper=$(this.options.wrapper).addClass('is-drilldown');
if(this.options.animateHeight) this.$wrapper.addClass('animate-height');
this.$element.wrap(this.$wrapper);
}
this.$wrapper=this.$element.parent();
this.$wrapper.css(this._getMaxDims());
}}, {
key: '_resize',
value: function _resize(){
this.$wrapper.css({ 'max-width': 'none', 'min-height': 'none' });
this.$wrapper.css(this._getMaxDims());
}
}, {
key: '_events',
value: function _events($elem){
var _this=this;
$elem.off('click.zf.drilldown').on('click.zf.drilldown', function (e){
if($(e.target).parentsUntil('ul', 'li').hasClass('is-drilldown-submenu-parent')){
e.stopImmediatePropagation();
e.preventDefault();
}
_this._show($elem.parent('li'));
if(_this.options.closeOnClick){
var $body=$('body');
$body.off('.zf.drilldown').on('click.zf.drilldown', function (e){
if(e.target===_this.$element[0]||$.contains(_this.$element[0], e.target)){
return;
}
e.preventDefault();
_this._hideAll();
$body.off('.zf.drilldown');
});
}});
this.$element.on('mutateme.zf.trigger', this._resize.bind(this));
}
}, {
key: '_registerEvents',
value: function _registerEvents(){
if(this.options.scrollTop){
this._bindHandler=this._scrollTop.bind(this);
this.$element.on('open.zf.drilldown hide.zf.drilldown closed.zf.drilldown', this._bindHandler);
}}
}, {
key: '_scrollTop',
value: function _scrollTop(){
var _this=this;
var $scrollTopElement=_this.options.scrollTopElement!='' ? $(_this.options.scrollTopElement):_this.$element,
scrollPos=parseInt($scrollTopElement.offset().top + _this.options.scrollTopOffset);
$('html, body').stop(true).animate({ scrollTop: scrollPos }, _this.options.animationDuration, _this.options.animationEasing, function (){
if(this===$('html')[0]) _this.$element.trigger('scrollme.zf.drilldown');
});
}
}, {
key: '_keyboardEvents',
value: function _keyboardEvents(){
var _this=this;
this.$menuItems.add(this.$element.find('.js-drilldown-back > a, .is-submenu-parent-item > a')).on('keydown.zf.drilldown', function (e){
var $element=$(this),
$elements=$element.parent('li').parent('ul').children('li').children('a'),
$prevElement,
$nextElement;
$elements.each(function (i){
if($(this).is($element)){
$prevElement=$elements.eq(Math.max(0, i - 1));
$nextElement=$elements.eq(Math.min(i + 1, $elements.length - 1));
return;
}});
Foundation.Keyboard.handleKey(e, 'Drilldown', {
next: function (){
if($element.is(_this.$submenuAnchors)){
_this._show($element.parent('li'));
$element.parent('li').one(Foundation.transitionend($element), function (){
$element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
});
return true;
}},
previous: function (){
_this._hide($element.parent('li').parent('ul'));
$element.parent('li').parent('ul').one(Foundation.transitionend($element), function (){
setTimeout(function (){
$element.parent('li').parent('ul').parent('li').children('a').first().focus();
}, 1);
});
return true;
},
up: function (){
$prevElement.focus();
return !$element.is(_this.$element.find('> li:first-child > a'));
},
down: function (){
$nextElement.focus();
return !$element.is(_this.$element.find('> li:last-child > a'));
},
close: function (){
if(!$element.is(_this.$element.find('> li > a'))){
_this._hide($element.parent().parent());
$element.parent().parent().siblings('a').focus();
}},
open: function (){
if(!$element.is(_this.$menuItems)){
_this._hide($element.parent('li').parent('ul'));
$element.parent('li').parent('ul').one(Foundation.transitionend($element), function (){
setTimeout(function (){
$element.parent('li').parent('ul').parent('li').children('a').first().focus();
}, 1);
});
return true;
}else if($element.is(_this.$submenuAnchors)){
_this._show($element.parent('li'));
$element.parent('li').one(Foundation.transitionend($element), function (){
$element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
});
return true;
}},
handled: function (preventDefault){
if(preventDefault){
e.preventDefault();
}
e.stopImmediatePropagation();
}});
});
}
}, {
key: '_hideAll',
value: function _hideAll(){
var $elem=this.$element.find('.is-drilldown-submenu.is-active').addClass('is-closing');
if(this.options.autoHeight) this.$wrapper.css({ height: $elem.parent().closest('ul').data('calcHeight') });
$elem.one(Foundation.transitionend($elem), function (e){
$elem.removeClass('is-active is-closing');
});
this.$element.trigger('closed.zf.drilldown');
}
}, {
key: '_back',
value: function _back($elem){
var _this=this;
$elem.off('click.zf.drilldown');
$elem.children('.js-drilldown-back').on('click.zf.drilldown', function (e){
e.stopImmediatePropagation();
_this._hide($elem);
var parentSubMenu=$elem.parent('li').parent('ul').parent('li');
if(parentSubMenu.length){
_this._show(parentSubMenu);
}});
}
}, {
key: '_menuLinkEvents',
value: function _menuLinkEvents(){
var _this=this;
this.$menuItems.not('.is-drilldown-submenu-parent').off('click.zf.drilldown').on('click.zf.drilldown', function (e){
setTimeout(function (){
_this._hideAll();
}, 0);
});
}
}, {
key: '_show',
value: function _show($elem){
if(this.options.autoHeight) this.$wrapper.css({ height: $elem.children('[data-submenu]').data('calcHeight') });
$elem.attr('aria-expanded', true);
$elem.children('[data-submenu]').addClass('is-active').removeClass('invisible').attr('aria-hidden', false);
this.$element.trigger('open.zf.drilldown', [$elem]);
}}, {
key: '_hide',
value: function _hide($elem){
if(this.options.autoHeight) this.$wrapper.css({ height: $elem.parent().closest('ul').data('calcHeight') });
var _this=this;
$elem.parent('li').attr('aria-expanded', false);
$elem.attr('aria-hidden', true).addClass('is-closing');
$elem.addClass('is-closing').one(Foundation.transitionend($elem), function (){
$elem.removeClass('is-active is-closing');
$elem.blur().addClass('invisible');
});
$elem.trigger('hide.zf.drilldown', [$elem]);
}
}, {
key: '_getMaxDims',
value: function _getMaxDims(){
var maxHeight=0,
result={},
_this=this;
this.$submenus.add(this.$element).each(function (){
var numOfElems=$(this).children('li').length;
var height=Foundation.Box.GetDimensions(this).height;
maxHeight=height > maxHeight ? height:maxHeight;
if(_this.options.autoHeight){
$(this).data('calcHeight', height);
if(!$(this).hasClass('is-drilldown-submenu')) result['height']=height;
}});
if(!this.options.autoHeight) result['min-height']=maxHeight + 'px';
result['max-width']=this.$element[0].getBoundingClientRect().width + 'px';
return result;
}
}, {
key: 'destroy',
value: function destroy(){
if(this.options.scrollTop) this.$element.off('.zf.drilldown', this._bindHandler);
this._hideAll();
this.$element.off('mutateme.zf.trigger');
Foundation.Nest.Burn(this.$element, 'drilldown');
this.$element.unwrap().find('.js-drilldown-back, .is-submenu-parent-item').remove().end().find('.is-active, .is-closing, .is-drilldown-submenu').removeClass('is-active is-closing is-drilldown-submenu').end().find('[data-submenu]').removeAttr('aria-hidden tabindex role');
this.$submenuAnchors.each(function (){
$(this).off('.zf.drilldown');
});
this.$submenus.removeClass('drilldown-submenu-cover-previous');
this.$element.find('a').each(function (){
var $link=$(this);
$link.removeAttr('tabindex');
if($link.data('savedHref')){
$link.attr('href', $link.data('savedHref')).removeData('savedHref');
}else{
return;
}});
Foundation.unregisterPlugin(this);
}}]);
return Drilldown;
}();
Drilldown.defaults={
backButton: '<li class="js-drilldown-back"><a tabindex="0">Back</a></li>',
backButtonPosition: 'top',
wrapper: '<div></div>',
parentLink: false,
closeOnClick: false,
autoHeight: false,
animateHeight: false,
scrollTop: false,
scrollTopElement: '',
scrollTopOffset: 0,
animationDuration: 500,
animationEasing: 'swing'
};
Foundation.plugin(Drilldown, 'Drilldown');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var Dropdown=function (){
function Dropdown(element, options){
_classCallCheck(this, Dropdown);
this.$element=element;
this.options=$.extend({}, Dropdown.defaults, this.$element.data(), options);
this._init();
Foundation.registerPlugin(this, 'Dropdown');
Foundation.Keyboard.register('Dropdown', {
'ENTER': 'open',
'SPACE': 'open',
'ESCAPE': 'close'
});
}
_createClass(Dropdown, [{
key: '_init',
value: function _init(){
var $id=this.$element.attr('id');
this.$anchor=$('[data-toggle="' + $id + '"]').length ? $('[data-toggle="' + $id + '"]'):$('[data-open="' + $id + '"]');
this.$anchor.attr({
'aria-controls': $id,
'data-is-focus': false,
'data-yeti-box': $id,
'aria-haspopup': true,
'aria-expanded': false
});
if(this.options.parentClass){
this.$parent=this.$element.parents('.' + this.options.parentClass);
}else{
this.$parent=null;
}
this.options.positionClass=this.getPositionClass();
this.counter=4;
this.usedPositions=[];
this.$element.attr({
'aria-hidden': 'true',
'data-yeti-box': $id,
'data-resize': $id,
'aria-labelledby': this.$anchor[0].id||Foundation.GetYoDigits(6, 'dd-anchor')
});
this._events();
}
}, {
key: 'getPositionClass',
value: function getPositionClass(){
var verticalPosition=this.$element[0].className.match(/(top|left|right|bottom)/g);
verticalPosition=verticalPosition ? verticalPosition[0]:'';
var horizontalPosition=/float-(\S+)/.exec(this.$anchor[0].className);
horizontalPosition=horizontalPosition ? horizontalPosition[1]:'';
var position=horizontalPosition ? horizontalPosition + ' ' + verticalPosition:verticalPosition;
return position;
}
}, {
key: '_reposition',
value: function _reposition(position){
this.usedPositions.push(position ? position:'bottom');
if(!position&&this.usedPositions.indexOf('top') < 0){
this.$element.addClass('top');
}else if(position==='top'&&this.usedPositions.indexOf('bottom') < 0){
this.$element.removeClass(position);
}else if(position==='left'&&this.usedPositions.indexOf('right') < 0){
this.$element.removeClass(position).addClass('right');
}else if(position==='right'&&this.usedPositions.indexOf('left') < 0){
this.$element.removeClass(position).addClass('left');
}
else if(!position&&this.usedPositions.indexOf('top') > -1&&this.usedPositions.indexOf('left') < 0){
this.$element.addClass('left');
}else if(position==='top'&&this.usedPositions.indexOf('bottom') > -1&&this.usedPositions.indexOf('left') < 0){
this.$element.removeClass(position).addClass('left');
}else if(position==='left'&&this.usedPositions.indexOf('right') > -1&&this.usedPositions.indexOf('bottom') < 0){
this.$element.removeClass(position);
}else if(position==='right'&&this.usedPositions.indexOf('left') > -1&&this.usedPositions.indexOf('bottom') < 0){
this.$element.removeClass(position);
}else{
this.$element.removeClass(position);
}
this.classChanged=true;
this.counter--;
}
}, {
key: '_setPosition',
value: function _setPosition(){
if(this.$anchor.attr('aria-expanded')==='false'){
return false;
}
var position=this.getPositionClass(),
$eleDims=Foundation.Box.GetDimensions(this.$element),
$anchorDims=Foundation.Box.GetDimensions(this.$anchor),
_this=this,
direction=position==='left' ? 'left':position==='right' ? 'left':'top',
param=direction==='top' ? 'height':'width',
offset=param==='height' ? this.options.vOffset:this.options.hOffset;
if($eleDims.width >=$eleDims.windowDims.width||!this.counter&&!Foundation.Box.ImNotTouchingYou(this.$element, this.$parent)){
var newWidth=$eleDims.windowDims.width,
parentHOffset=0;
if(this.$parent){
var $parentDims=Foundation.Box.GetDimensions(this.$parent),
parentHOffset=$parentDims.offset.left;
if($parentDims.width < newWidth){
newWidth=$parentDims.width;
}}
this.$element.offset(Foundation.Box.GetOffsets(this.$element, this.$anchor, 'center bottom', this.options.vOffset, this.options.hOffset + parentHOffset, true)).css({
'width': newWidth - this.options.hOffset * 2,
'height': 'auto'
});
this.classChanged=true;
return false;
}
this.$element.offset(Foundation.Box.GetOffsets(this.$element, this.$anchor, position, this.options.vOffset, this.options.hOffset));
while (!Foundation.Box.ImNotTouchingYou(this.$element, this.$parent, true)&&this.counter){
this._reposition(position);
this._setPosition();
}}
}, {
key: '_events',
value: function _events(){
var _this=this;
this.$element.on({
'open.zf.trigger': this.open.bind(this),
'close.zf.trigger': this.close.bind(this),
'toggle.zf.trigger': this.toggle.bind(this),
'resizeme.zf.trigger': this._setPosition.bind(this)
});
if(this.options.hover){
this.$anchor.off('mouseenter.zf.dropdown mouseleave.zf.dropdown').on('mouseenter.zf.dropdown', function (){
var bodyData=$('body').data();
if(typeof bodyData.whatinput==='undefined'||bodyData.whatinput==='mouse'){
clearTimeout(_this.timeout);
_this.timeout=setTimeout(function (){
_this.open();
_this.$anchor.data('hover', true);
}, _this.options.hoverDelay);
}}).on('mouseleave.zf.dropdown', function (){
clearTimeout(_this.timeout);
_this.timeout=setTimeout(function (){
_this.close();
_this.$anchor.data('hover', false);
}, _this.options.hoverDelay);
});
if(this.options.hoverPane){
this.$element.off('mouseenter.zf.dropdown mouseleave.zf.dropdown').on('mouseenter.zf.dropdown', function (){
clearTimeout(_this.timeout);
}).on('mouseleave.zf.dropdown', function (){
clearTimeout(_this.timeout);
_this.timeout=setTimeout(function (){
_this.close();
_this.$anchor.data('hover', false);
}, _this.options.hoverDelay);
});
}}
this.$anchor.add(this.$element).on('keydown.zf.dropdown', function (e){
var $target=$(this),
visibleFocusableElements=Foundation.Keyboard.findFocusable(_this.$element);
Foundation.Keyboard.handleKey(e, 'Dropdown', {
open: function (){
if($target.is(_this.$anchor)){
_this.open();
_this.$element.attr('tabindex', -1).focus();
e.preventDefault();
}},
close: function (){
_this.close();
_this.$anchor.focus();
}});
});
}
}, {
key: '_addBodyHandler',
value: function _addBodyHandler(){
var $body=$(document.body).not(this.$element),
_this=this;
$body.off('click.zf.dropdown').on('click.zf.dropdown', function (e){
if(_this.$anchor.is(e.target)||_this.$anchor.find(e.target).length){
return;
}
if(_this.$element.find(e.target).length){
return;
}
_this.close();
$body.off('click.zf.dropdown');
});
}
}, {
key: 'open',
value: function open(){
this.$element.trigger('closeme.zf.dropdown', this.$element.attr('id'));
this.$anchor.addClass('hover').attr({ 'aria-expanded': true });
this._setPosition();
this.$element.addClass('is-open').attr({ 'aria-hidden': false });
if(this.options.autoFocus){
var $focusable=Foundation.Keyboard.findFocusable(this.$element);
if($focusable.length){
$focusable.eq(0).focus();
}}
if(this.options.closeOnClick){
this._addBodyHandler();
}
if(this.options.trapFocus){
Foundation.Keyboard.trapFocus(this.$element);
}
this.$element.trigger('show.zf.dropdown', [this.$element]);
}
}, {
key: 'close',
value: function close(){
if(!this.$element.hasClass('is-open')){
return false;
}
this.$element.removeClass('is-open').attr({ 'aria-hidden': true });
this.$anchor.removeClass('hover').attr('aria-expanded', false);
if(this.classChanged){
var curPositionClass=this.getPositionClass();
if(curPositionClass){
this.$element.removeClass(curPositionClass);
}
this.$element.addClass(this.options.positionClass)
.css({ height: '', width: '' });
this.classChanged=false;
this.counter=4;
this.usedPositions.length=0;
}
this.$element.trigger('hide.zf.dropdown', [this.$element]);
if(this.options.trapFocus){
Foundation.Keyboard.releaseFocus(this.$element);
}}
}, {
key: 'toggle',
value: function toggle(){
if(this.$element.hasClass('is-open')){
if(this.$anchor.data('hover')) return;
this.close();
}else{
this.open();
}}
}, {
key: 'destroy',
value: function destroy(){
this.$element.off('.zf.trigger').hide();
this.$anchor.off('.zf.dropdown');
Foundation.unregisterPlugin(this);
}}]);
return Dropdown;
}();
Dropdown.defaults={
parentClass: null,
hoverDelay: 250,
hover: false,
hoverPane: false,
vOffset: 1,
hOffset: 1,
positionClass: '',
trapFocus: false,
autoFocus: false,
closeOnClick: false
};Foundation.plugin(Dropdown, 'Dropdown');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var DropdownMenu=function (){
function DropdownMenu(element, options){
_classCallCheck(this, DropdownMenu);
this.$element=element;
this.options=$.extend({}, DropdownMenu.defaults, this.$element.data(), options);
Foundation.Nest.Feather(this.$element, 'dropdown');
this._init();
Foundation.registerPlugin(this, 'DropdownMenu');
Foundation.Keyboard.register('DropdownMenu', {
'ENTER': 'open',
'SPACE': 'open',
'ARROW_RIGHT': 'next',
'ARROW_UP': 'up',
'ARROW_DOWN': 'down',
'ARROW_LEFT': 'previous',
'ESCAPE': 'close'
});
}
_createClass(DropdownMenu, [{
key: '_init',
value: function _init(){
var subs=this.$element.find('li.is-dropdown-submenu-parent');
this.$element.children('.is-dropdown-submenu-parent').children('.is-dropdown-submenu').addClass('first-sub');
this.$menuItems=this.$element.find('[role="menuitem"]');
this.$tabs=this.$element.children('[role="menuitem"]');
this.$tabs.find('ul.is-dropdown-submenu').addClass(this.options.verticalClass);
if(this.$element.hasClass(this.options.rightClass)||this.options.alignment==='right'||Foundation.rtl()||this.$element.parents('.top-bar-right').is('*')){
this.options.alignment='right';
subs.addClass('opens-left');
}else{
subs.addClass('opens-right');
}
this.changed=false;
this._events();
}}, {
key: '_isVertical',
value: function _isVertical(){
return this.$tabs.css('display')==='block';
}
}, {
key: '_events',
value: function _events(){
var _this=this,
hasTouch='ontouchstart' in window||typeof window.ontouchstart!=='undefined',
parClass='is-dropdown-submenu-parent';
var handleClickFn=function (e){
var $elem=$(e.target).parentsUntil('ul', '.' + parClass),
hasSub=$elem.hasClass(parClass),
hasClicked=$elem.attr('data-is-click')==='true',
$sub=$elem.children('.is-dropdown-submenu');
if(hasSub){
if(hasClicked){
if(!_this.options.closeOnClick||!_this.options.clickOpen&&!hasTouch||_this.options.forceFollow&&hasTouch){
return;
}else{
e.stopImmediatePropagation();
e.preventDefault();
_this._hide($elem);
}}else{
e.preventDefault();
e.stopImmediatePropagation();
_this._show($sub);
$elem.add($elem.parentsUntil(_this.$element, '.' + parClass)).attr('data-is-click', true);
}}
};
if(this.options.clickOpen||hasTouch){
this.$menuItems.on('click.zf.dropdownmenu touchstart.zf.dropdownmenu', handleClickFn);
}
if(_this.options.closeOnClickInside){
this.$menuItems.on('click.zf.dropdownmenu', function (e){
var $elem=$(this),
hasSub=$elem.hasClass(parClass);
if(!hasSub){
_this._hide();
}});
}
if(!this.options.disableHover){
this.$menuItems.on('mouseenter.zf.dropdownmenu', function (e){
var $elem=$(this),
hasSub=$elem.hasClass(parClass);
if(hasSub){
clearTimeout($elem.data('_delay'));
$elem.data('_delay', setTimeout(function (){
_this._show($elem.children('.is-dropdown-submenu'));
}, _this.options.hoverDelay));
}}).on('mouseleave.zf.dropdownmenu', function (e){
var $elem=$(this),
hasSub=$elem.hasClass(parClass);
if(hasSub&&_this.options.autoclose){
if($elem.attr('data-is-click')==='true'&&_this.options.clickOpen){
return false;
}
clearTimeout($elem.data('_delay'));
$elem.data('_delay', setTimeout(function (){
_this._hide($elem);
}, _this.options.closingTime));
}});
}
this.$menuItems.on('keydown.zf.dropdownmenu', function (e){
var $element=$(e.target).parentsUntil('ul', '[role="menuitem"]'),
isTab=_this.$tabs.index($element) > -1,
$elements=isTab ? _this.$tabs:$element.siblings('li').add($element),
$prevElement,
$nextElement;
$elements.each(function (i){
if($(this).is($element)){
$prevElement=$elements.eq(i - 1);
$nextElement=$elements.eq(i + 1);
return;
}});
var nextSibling=function (){
if(!$element.is(':last-child')){
$nextElement.children('a:first').focus();
e.preventDefault();
}},
prevSibling=function (){
$prevElement.children('a:first').focus();
e.preventDefault();
},
openSub=function (){
var $sub=$element.children('ul.is-dropdown-submenu');
if($sub.length){
_this._show($sub);
$element.find('li > a:first').focus();
e.preventDefault();
}else{
return;
}},
closeSub=function (){
var close=$element.parent('ul').parent('li');
close.children('a:first').focus();
_this._hide(close);
e.preventDefault();
};
var functions={
open: openSub,
close: function (){
_this._hide(_this.$element);
_this.$menuItems.find('a:first').focus();
e.preventDefault();
},
handled: function (){
e.stopImmediatePropagation();
}};
if(isTab){
if(_this._isVertical()){
if(Foundation.rtl()){
$.extend(functions, {
down: nextSibling,
up: prevSibling,
next: closeSub,
previous: openSub
});
}else{
$.extend(functions, {
down: nextSibling,
up: prevSibling,
next: openSub,
previous: closeSub
});
}}else{
if(Foundation.rtl()){
$.extend(functions, {
next: prevSibling,
previous: nextSibling,
down: openSub,
up: closeSub
});
}else{
$.extend(functions, {
next: nextSibling,
previous: prevSibling,
down: openSub,
up: closeSub
});
}}
}else{
if(Foundation.rtl()){
$.extend(functions, {
next: closeSub,
previous: openSub,
down: nextSibling,
up: prevSibling
});
}else{
$.extend(functions, {
next: openSub,
previous: closeSub,
down: nextSibling,
up: prevSibling
});
}}
Foundation.Keyboard.handleKey(e, 'DropdownMenu', functions);
});
}
}, {
key: '_addBodyHandler',
value: function _addBodyHandler(){
var $body=$(document.body),
_this=this;
$body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu').on('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu', function (e){
var $link=_this.$element.find(e.target);
if($link.length){
return;
}
_this._hide();
$body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu');
});
}
}, {
key: '_show',
value: function _show($sub){
var idx=this.$tabs.index(this.$tabs.filter(function (i, el){
return $(el).find($sub).length > 0;
}));
var $sibs=$sub.parent('li.is-dropdown-submenu-parent').siblings('li.is-dropdown-submenu-parent');
this._hide($sibs, idx);
$sub.css('visibility', 'hidden').addClass('js-dropdown-active').parent('li.is-dropdown-submenu-parent').addClass('is-active');
var clear=Foundation.Box.ImNotTouchingYou($sub, null, true);
if(!clear){
var oldClass=this.options.alignment==='left' ? '-right':'-left',
$parentLi=$sub.parent('.is-dropdown-submenu-parent');
$parentLi.removeClass('opens' + oldClass).addClass('opens-' + this.options.alignment);
clear=Foundation.Box.ImNotTouchingYou($sub, null, true);
if(!clear){
$parentLi.removeClass('opens-' + this.options.alignment).addClass('opens-inner');
}
this.changed=true;
}
$sub.css('visibility', '');
if(this.options.closeOnClick){
this._addBodyHandler();
}
this.$element.trigger('show.zf.dropdownmenu', [$sub]);
}
}, {
key: '_hide',
value: function _hide($elem, idx){
var $toClose;
if($elem&&$elem.length){
$toClose=$elem;
}else if(idx!==undefined){
$toClose=this.$tabs.not(function (i, el){
return i===idx;
});
}else{
$toClose=this.$element;
}
var somethingToClose=$toClose.hasClass('is-active')||$toClose.find('.is-active').length > 0;
if(somethingToClose){
$toClose.find('li.is-active').add($toClose).attr({
'data-is-click': false
}).removeClass('is-active');
$toClose.find('ul.js-dropdown-active').removeClass('js-dropdown-active');
if(this.changed||$toClose.find('opens-inner').length){
var oldClass=this.options.alignment==='left' ? 'right':'left';
$toClose.find('li.is-dropdown-submenu-parent').add($toClose).removeClass('opens-inner opens-' + this.options.alignment).addClass('opens-' + oldClass);
this.changed=false;
}
this.$element.trigger('hide.zf.dropdownmenu', [$toClose]);
}}
}, {
key: 'destroy',
value: function destroy(){
this.$menuItems.off('.zf.dropdownmenu').removeAttr('data-is-click').removeClass('is-right-arrow is-left-arrow is-down-arrow opens-right opens-left opens-inner');
$(document.body).off('.zf.dropdownmenu');
Foundation.Nest.Burn(this.$element, 'dropdown');
Foundation.unregisterPlugin(this);
}}]);
return DropdownMenu;
}();
DropdownMenu.defaults={
disableHover: false,
autoclose: true,
hoverDelay: 50,
clickOpen: false,
closingTime: 500,
alignment: 'left',
closeOnClick: true,
closeOnClickInside: true,
verticalClass: 'vertical',
rightClass: 'align-right',
forceFollow: true
};
Foundation.plugin(DropdownMenu, 'DropdownMenu');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var Equalizer=function (){
function Equalizer(element, options){
_classCallCheck(this, Equalizer);
this.$element=element;
this.options=$.extend({}, Equalizer.defaults, this.$element.data(), options);
this._init();
Foundation.registerPlugin(this, 'Equalizer');
}
_createClass(Equalizer, [{
key: '_init',
value: function _init(){
var eqId=this.$element.attr('data-equalizer')||'';
var $watched=this.$element.find('[data-equalizer-watch="' + eqId + '"]');
this.$watched=$watched.length ? $watched:this.$element.find('[data-equalizer-watch]');
this.$element.attr('data-resize', eqId||Foundation.GetYoDigits(6, 'eq'));
this.$element.attr('data-mutate', eqId||Foundation.GetYoDigits(6, 'eq'));
this.hasNested=this.$element.find('[data-equalizer]').length > 0;
this.isNested=this.$element.parentsUntil(document.body, '[data-equalizer]').length > 0;
this.isOn=false;
this._bindHandler={
onResizeMeBound: this._onResizeMe.bind(this),
onPostEqualizedBound: this._onPostEqualized.bind(this)
};
var imgs=this.$element.find('img');
var tooSmall;
if(this.options.equalizeOn){
tooSmall=this._checkMQ();
$(window).on('changed.zf.mediaquery', this._checkMQ.bind(this));
}else{
this._events();
}
if(tooSmall!==undefined&&tooSmall===false||tooSmall===undefined){
if(imgs.length){
Foundation.onImagesLoaded(imgs, this._reflow.bind(this));
}else{
this._reflow();
}}
}
}, {
key: '_pauseEvents',
value: function _pauseEvents(){
this.isOn=false;
this.$element.off({
'.zf.equalizer': this._bindHandler.onPostEqualizedBound,
'resizeme.zf.trigger': this._bindHandler.onResizeMeBound,
'mutateme.zf.trigger': this._bindHandler.onResizeMeBound
});
}
}, {
key: '_onResizeMe',
value: function _onResizeMe(e){
this._reflow();
}
}, {
key: '_onPostEqualized',
value: function _onPostEqualized(e){
if(e.target!==this.$element[0]){
this._reflow();
}}
}, {
key: '_events',
value: function _events(){
var _this=this;
this._pauseEvents();
if(this.hasNested){
this.$element.on('postequalized.zf.equalizer', this._bindHandler.onPostEqualizedBound);
}else{
this.$element.on('resizeme.zf.trigger', this._bindHandler.onResizeMeBound);
this.$element.on('mutateme.zf.trigger', this._bindHandler.onResizeMeBound);
}
this.isOn=true;
}
}, {
key: '_checkMQ',
value: function _checkMQ(){
var tooSmall = !Foundation.MediaQuery.is(this.options.equalizeOn);
if(tooSmall){
if(this.isOn){
this._pauseEvents();
this.$watched.css('height', 'auto');
}}else{
if(!this.isOn){
this._events();
}}
return tooSmall;
}
}, {
key: '_killswitch',
value: function _killswitch(){
return;
}
}, {
key: '_reflow',
value: function _reflow(){
if(!this.options.equalizeOnStack){
if(this._isStacked()){
this.$watched.css('height', 'auto');
return false;
}}
if(this.options.equalizeByRow){
this.getHeightsByRow(this.applyHeightByRow.bind(this));
}else{
this.getHeights(this.applyHeight.bind(this));
}}
}, {
key: '_isStacked',
value: function _isStacked(){
if(!this.$watched[0]||!this.$watched[1]){
return true;
}
return this.$watched[0].getBoundingClientRect().top!==this.$watched[1].getBoundingClientRect().top;
}
}, {
key: 'getHeights',
value: function getHeights(cb){
var heights=[];
for (var i=0, len=this.$watched.length; i < len; i++){
this.$watched[i].style.height='auto';
heights.push(this.$watched[i].offsetHeight);
}
cb(heights);
}
}, {
key: 'getHeightsByRow',
value: function getHeightsByRow(cb){
var lastElTopOffset=this.$watched.length ? this.$watched.first().offset().top:0,
groups=[],
group=0;
groups[group]=[];
for (var i=0, len=this.$watched.length; i < len; i++){
this.$watched[i].style.height='auto';
var elOffsetTop=$(this.$watched[i]).offset().top;
if(elOffsetTop!=lastElTopOffset){
group++;
groups[group]=[];
lastElTopOffset=elOffsetTop;
}
groups[group].push([this.$watched[i], this.$watched[i].offsetHeight]);
}
for (var j=0, ln=groups.length; j < ln; j++){
var heights=$(groups[j]).map(function (){
return this[1];
}).get();
var max=Math.max.apply(null, heights);
groups[j].push(max);
}
cb(groups);
}
}, {
key: 'applyHeight',
value: function applyHeight(heights){
var max=Math.max.apply(null, heights);
this.$element.trigger('preequalized.zf.equalizer');
this.$watched.css('height', max);
this.$element.trigger('postequalized.zf.equalizer');
}
}, {
key: 'applyHeightByRow',
value: function applyHeightByRow(groups){
this.$element.trigger('preequalized.zf.equalizer');
for (var i=0, len=groups.length; i < len; i++){
var groupsILength=groups[i].length,
max=groups[i][groupsILength - 1];
if(groupsILength <=2){
$(groups[i][0][0]).css({ 'height': 'auto' });
continue;
}
this.$element.trigger('preequalizedrow.zf.equalizer');
for (var j=0, lenJ=groupsILength - 1; j < lenJ; j++){
$(groups[i][j][0]).css({ 'height': max });
}
this.$element.trigger('postequalizedrow.zf.equalizer');
}
this.$element.trigger('postequalized.zf.equalizer');
}
}, {
key: 'destroy',
value: function destroy(){
this._pauseEvents();
this.$watched.css('height', 'auto');
Foundation.unregisterPlugin(this);
}}]);
return Equalizer;
}();
Equalizer.defaults={
equalizeOnStack: false,
equalizeByRow: false,
equalizeOn: ''
};
Foundation.plugin(Equalizer, 'Equalizer');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var Interchange=function (){
function Interchange(element, options){
_classCallCheck(this, Interchange);
this.$element=element;
this.options=$.extend({}, Interchange.defaults, options);
this.rules=[];
this.currentPath='';
this._init();
this._events();
Foundation.registerPlugin(this, 'Interchange');
}
_createClass(Interchange, [{
key: '_init',
value: function _init(){
this._addBreakpoints();
this._generateRules();
this._reflow();
}
}, {
key: '_events',
value: function _events(){
var _this2=this;
$(window).on('resize.zf.interchange', Foundation.util.throttle(function (){
_this2._reflow();
}, 50));
}
}, {
key: '_reflow',
value: function _reflow(){
var match;
for (var i in this.rules){
if(this.rules.hasOwnProperty(i)){
var rule=this.rules[i];
if(window.matchMedia(rule.query).matches){
match=rule;
}}
}
if(match){
this.replace(match.path);
}}
}, {
key: '_addBreakpoints',
value: function _addBreakpoints(){
for (var i in Foundation.MediaQuery.queries){
if(Foundation.MediaQuery.queries.hasOwnProperty(i)){
var query=Foundation.MediaQuery.queries[i];
Interchange.SPECIAL_QUERIES[query.name]=query.value;
}}
}
}, {
key: '_generateRules',
value: function _generateRules(element){
var rulesList=[];
var rules;
if(this.options.rules){
rules=this.options.rules;
}else{
rules=this.$element.data('interchange');
}
rules=typeof rules==='string' ? rules.match(/\[.*?\]/g):rules;
for (var i in rules){
if(rules.hasOwnProperty(i)){
var rule=rules[i].slice(1, -1).split(', ');
var path=rule.slice(0, -1).join('');
var query=rule[rule.length - 1];
if(Interchange.SPECIAL_QUERIES[query]){
query=Interchange.SPECIAL_QUERIES[query];
}
rulesList.push({
path: path,
query: query
});
}}
this.rules=rulesList;
}
}, {
key: 'replace',
value: function replace(path){
if(this.currentPath===path) return;
var _this=this,
trigger='replaced.zf.interchange';
if(this.$element[0].nodeName==='IMG'){
this.$element.attr('src', path).on('load', function (){
_this.currentPath=path;
}).trigger(trigger);
}
else if(path.match(/\.(gif|jpg|jpeg|png|svg|tiff)([?#].*)?/i)){
this.$element.css({ 'background-image': 'url(' + path + ')' }).trigger(trigger);
}else{
$.get(path, function (response){
_this.$element.html(response).trigger(trigger);
$(response).foundation();
_this.currentPath=path;
});
}
}
}, {
key: 'destroy',
value: function destroy(){
}}]);
return Interchange;
}();
Interchange.defaults={
rules: null
};
Interchange.SPECIAL_QUERIES={
'landscape': 'screen and (orientation: landscape)',
'portrait': 'screen and (orientation: portrait)',
'retina': 'only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx)'
};
Foundation.plugin(Interchange, 'Interchange');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var Magellan=function (){
function Magellan(element, options){
_classCallCheck(this, Magellan);
this.$element=element;
this.options=$.extend({}, Magellan.defaults, this.$element.data(), options);
this._init();
this.calcPoints();
Foundation.registerPlugin(this, 'Magellan');
}
_createClass(Magellan, [{
key: '_init',
value: function _init(){
var id=this.$element[0].id||Foundation.GetYoDigits(6, 'magellan');
var _this=this;
this.$targets=$('[data-magellan-target]');
this.$links=this.$element.find('a');
this.$element.attr({
'data-resize': id,
'data-scroll': id,
'id': id
});
this.$active=$();
this.scrollPos=parseInt(window.pageYOffset, 10);
this._events();
}
}, {
key: 'calcPoints',
value: function calcPoints(){
var _this=this,
body=document.body,
html=document.documentElement;
this.points=[];
this.winHeight=Math.round(Math.max(window.innerHeight, html.clientHeight));
this.docHeight=Math.round(Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight));
this.$targets.each(function (){
var $tar=$(this),
pt=Math.round($tar.offset().top - _this.options.threshold);
$tar.targetPoint=pt;
_this.points.push(pt);
});
}
}, {
key: '_events',
value: function _events(){
var _this=this,
$body=$('html, body'),
opts={
duration: _this.options.animationDuration,
easing: _this.options.animationEasing
};
$(window).one('load', function (){
if(_this.options.deepLinking){
if(location.hash){
_this.scrollToLoc(location.hash);
}}
_this.calcPoints();
_this._updateActive();
});
this.$element.on({
'resizeme.zf.trigger': this.reflow.bind(this),
'scrollme.zf.trigger': this._updateActive.bind(this)
}).on('click.zf.magellan', 'a[href^="#"]', function (e){
e.preventDefault();
var arrival=this.getAttribute('href');
_this.scrollToLoc(arrival);
});
$(window).on('popstate', function (e){
if(_this.options.deepLinking){
_this.scrollToLoc(window.location.hash);
}});
}
}, {
key: 'scrollToLoc',
value: function scrollToLoc(loc){
if(!$(loc).length){
return false;
}
this._inTransition=true;
var _this=this,
scrollPos=Math.round($(loc).offset().top - this.options.threshold / 2 - this.options.barOffset);
$('html, body').stop(true).animate({ scrollTop: scrollPos }, this.options.animationDuration, this.options.animationEasing, function (){
_this._inTransition=false;_this._updateActive();
});
}
}, {
key: 'reflow',
value: function reflow(){
this.calcPoints();
this._updateActive();
}
}, {
key: '_updateActive',
value: function _updateActive() {
if(this._inTransition){
return;
}
var winPos=parseInt(window.pageYOffset, 10),
curIdx;
if(winPos + this.winHeight===this.docHeight){
curIdx=this.points.length - 1;
}else if(winPos < this.points[0]){
curIdx=undefined;
}else{
var isDown=this.scrollPos < winPos,
_this=this,
curVisible=this.points.filter(function (p, i){
return isDown ? p - _this.options.barOffset <=winPos:p - _this.options.barOffset - _this.options.threshold <=winPos;
});
curIdx=curVisible.length ? curVisible.length - 1:0;
}
this.$active.removeClass(this.options.activeClass);
this.$active=this.$links.filter('[href="#' + this.$targets.eq(curIdx).data('magellan-target') + '"]').addClass(this.options.activeClass);
if(this.options.deepLinking){
var hash="";
if(curIdx!=undefined){
hash=this.$active[0].getAttribute('href');
}
if(hash!==window.location.hash){
if(window.history.pushState){
window.history.pushState(null, null, hash);
}else{
window.location.hash=hash;
}}
}
this.scrollPos=winPos;
this.$element.trigger('update.zf.magellan', [this.$active]);
}
}, {
key: 'destroy',
value: function destroy(){
this.$element.off('.zf.trigger .zf.magellan').find('.' + this.options.activeClass).removeClass(this.options.activeClass);
if(this.options.deepLinking){
var hash=this.$active[0].getAttribute('href');
window.location.hash.replace(hash, '');
}
Foundation.unregisterPlugin(this);
}}]);
return Magellan;
}();
Magellan.defaults={
animationDuration: 500,
animationEasing: 'linear',
threshold: 50,
activeClass: 'active',
deepLinking: false,
barOffset: 0
};Foundation.plugin(Magellan, 'Magellan');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var OffCanvas=function (){
function OffCanvas(element, options){
_classCallCheck(this, OffCanvas);
this.$element=element;
this.options=$.extend({}, OffCanvas.defaults, this.$element.data(), options);
this.$lastTrigger=$();
this.$triggers=$();
this._init();
this._events();
Foundation.registerPlugin(this, 'OffCanvas');
Foundation.Keyboard.register('OffCanvas', {
'ESCAPE': 'close'
});
}
_createClass(OffCanvas, [{
key: '_init',
value: function _init(){
var id=this.$element.attr('id');
this.$element.attr('aria-hidden', 'true');
this.$element.addClass('is-transition-' + this.options.transition);
this.$triggers=$(document).find('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').attr('aria-expanded', 'false').attr('aria-controls', id);
if(this.options.contentOverlay===true){
var overlay=document.createElement('div');
var overlayPosition=$(this.$element).css("position")==='fixed' ? 'is-overlay-fixed':'is-overlay-absolute';
overlay.setAttribute('class', 'js-off-canvas-overlay ' + overlayPosition);
this.$overlay=$(overlay);
if(overlayPosition==='is-overlay-fixed'){
$('body').append(this.$overlay);
}else{
this.$element.siblings('[data-off-canvas-content]').append(this.$overlay);
}}
this.options.isRevealed=this.options.isRevealed||new RegExp(this.options.revealClass, 'g').test(this.$element[0].className);
if(this.options.isRevealed===true){
this.options.revealOn=this.options.revealOn||this.$element[0].className.match(/(reveal-for-medium|reveal-for-large)/g)[0].split('-')[2];
this._setMQChecker();
}
if(!this.options.transitionTime===true){
this.options.transitionTime=parseFloat(window.getComputedStyle($('[data-off-canvas]')[0]).transitionDuration) * 1000;
}}
}, {
key: '_events',
value: function _events(){
this.$element.off('.zf.trigger .zf.offcanvas').on({
'open.zf.trigger': this.open.bind(this),
'close.zf.trigger': this.close.bind(this),
'toggle.zf.trigger': this.toggle.bind(this),
'keydown.zf.offcanvas': this._handleKeyboard.bind(this)
});
if(this.options.closeOnClick===true){
var $target=this.options.contentOverlay ? this.$overlay:$('[data-off-canvas-content]');
$target.on({ 'click.zf.offcanvas': this.close.bind(this) });
}}
}, {
key: '_setMQChecker',
value: function _setMQChecker(){
var _this=this;
$(window).on('changed.zf.mediaquery', function (){
if(Foundation.MediaQuery.atLeast(_this.options.revealOn)){
_this.reveal(true);
}else{
_this.reveal(false);
}}).one('load.zf.offcanvas', function (){
if(Foundation.MediaQuery.atLeast(_this.options.revealOn)){
_this.reveal(true);
}});
}
}, {
key: 'reveal',
value: function reveal(isRevealed){
var $closer=this.$element.find('[data-close]');
if(isRevealed){
this.close();
this.isRevealed=true;
this.$element.attr('aria-hidden', 'false');
this.$element.off('open.zf.trigger toggle.zf.trigger');
if($closer.length){
$closer.hide();
}}else{
this.isRevealed=false;
this.$element.attr('aria-hidden', 'true');
this.$element.off('open.zf.trigger toggle.zf.trigger').on({
'open.zf.trigger': this.open.bind(this),
'toggle.zf.trigger': this.toggle.bind(this)
});
if($closer.length){
$closer.show();
}}
}
}, {
key: '_stopScrolling',
value: function _stopScrolling(event){
return false;
}}, {
key: '_recordScrollable',
value: function _recordScrollable(event){
var elem=this;
if(elem.scrollHeight!==elem.clientHeight){
if(elem.scrollTop===0){
elem.scrollTop=1;
}
if(elem.scrollTop===elem.scrollHeight - elem.clientHeight){
elem.scrollTop=elem.scrollHeight - elem.clientHeight - 1;
}}
elem.allowUp=elem.scrollTop > 0;
elem.allowDown=elem.scrollTop < elem.scrollHeight - elem.clientHeight;
elem.lastY=event.originalEvent.pageY;
}}, {
key: '_stopScrollPropagation',
value: function _stopScrollPropagation(event){
var elem=this;
var up=event.pageY < elem.lastY;
var down = !up;
elem.lastY=event.pageY;
if(up&&elem.allowUp||down&&elem.allowDown){
event.stopPropagation();
}else{
event.preventDefault();
}}
}, {
key: 'open',
value: function open(event, trigger){
if(this.$element.hasClass('is-open')||this.isRevealed){
return;
}
var _this=this;
if(trigger){
this.$lastTrigger=trigger;
}
if(this.options.forceTo==='top'){
window.scrollTo(0, 0);
}else if(this.options.forceTo==='bottom'){
window.scrollTo(0, document.body.scrollHeight);
}
_this.$element.addClass('is-open');
this.$triggers.attr('aria-expanded', 'true');
this.$element.attr('aria-hidden', 'false').trigger('opened.zf.offcanvas');
if(this.options.contentScroll===false){
$('body').addClass('is-off-canvas-open').on('touchmove', this._stopScrolling);
this.$element.on('touchstart', this._recordScrollable);
this.$element.on('touchmove', this._stopScrollPropagation);
}
if(this.options.contentOverlay===true){
this.$overlay.addClass('is-visible');
}
if(this.options.closeOnClick===true&&this.options.contentOverlay===true){
this.$overlay.addClass('is-closable');
}
if(this.options.autoFocus===true){
this.$element.one(Foundation.transitionend(this.$element), function (){
var canvasFocus=_this.$element.find('[data-autofocus]');
if(canvasFocus.length){
canvasFocus.eq(0).focus();
}else{
_this.$element.find('a, button').eq(0).focus();
}});
}
if(this.options.trapFocus===true){
this.$element.siblings('[data-off-canvas-content]').attr('tabindex', '-1');
Foundation.Keyboard.trapFocus(this.$element);
}}
}, {
key: 'close',
value: function close(cb){
if(!this.$element.hasClass('is-open')||this.isRevealed){
return;
}
var _this=this;
_this.$element.removeClass('is-open');
this.$element.attr('aria-hidden', 'true')
.trigger('closed.zf.offcanvas');
if(this.options.contentScroll===false){
$('body').removeClass('is-off-canvas-open').off('touchmove', this._stopScrolling);
this.$element.off('touchstart', this._recordScrollable);
this.$element.off('touchmove', this._stopScrollPropagation);
}
if(this.options.contentOverlay===true){
this.$overlay.removeClass('is-visible');
}
if(this.options.closeOnClick===true&&this.options.contentOverlay===true){
this.$overlay.removeClass('is-closable');
}
this.$triggers.attr('aria-expanded', 'false');
if(this.options.trapFocus===true){
this.$element.siblings('[data-off-canvas-content]').removeAttr('tabindex');
Foundation.Keyboard.releaseFocus(this.$element);
}}
}, {
key: 'toggle',
value: function toggle(event, trigger){
if(this.$element.hasClass('is-open')){
this.close(event, trigger);
}else{
this.open(event, trigger);
}}
}, {
key: '_handleKeyboard',
value: function _handleKeyboard(e){
var _this2=this;
Foundation.Keyboard.handleKey(e, 'OffCanvas', {
close: function (){
_this2.close();
_this2.$lastTrigger.focus();
return true;
},
handled: function (){
e.stopPropagation();
e.preventDefault();
}});
}
}, {
key: 'destroy',
value: function destroy(){
this.close();
this.$element.off('.zf.trigger .zf.offcanvas');
this.$overlay.off('.zf.offcanvas');
Foundation.unregisterPlugin(this);
}}]);
return OffCanvas;
}();
OffCanvas.defaults={
closeOnClick: true,
contentOverlay: true,
contentScroll: true,
transitionTime: 0,
transition: 'push',
forceTo: null,
isRevealed: false,
revealOn: null,
autoFocus: true,
revealClass: 'reveal-for-',
trapFocus: false
};Foundation.plugin(OffCanvas, 'OffCanvas');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var Orbit=function (){
function Orbit(element, options){
_classCallCheck(this, Orbit);
this.$element=element;
this.options=$.extend({}, Orbit.defaults, this.$element.data(), options);
this._init();
Foundation.registerPlugin(this, 'Orbit');
Foundation.Keyboard.register('Orbit', {
'ltr': {
'ARROW_RIGHT': 'next',
'ARROW_LEFT': 'previous'
},
'rtl': {
'ARROW_LEFT': 'next',
'ARROW_RIGHT': 'previous'
}});
}
_createClass(Orbit, [{
key: '_init',
value: function _init(){
this._reset();
this.$wrapper=this.$element.find('.' + this.options.containerClass);
this.$slides=this.$element.find('.' + this.options.slideClass);
var $images=this.$element.find('img'),
initActive=this.$slides.filter('.is-active'),
id=this.$element[0].id||Foundation.GetYoDigits(6, 'orbit');
this.$element.attr({
'data-resize': id,
'id': id
});
if(!initActive.length){
this.$slides.eq(0).addClass('is-active');
}
if(!this.options.useMUI){
this.$slides.addClass('no-motionui');
}
if($images.length){
Foundation.onImagesLoaded($images, this._prepareForOrbit.bind(this));
}else{
this._prepareForOrbit();
}
if(this.options.bullets){
this._loadBullets();
}
this._events();
if(this.options.autoPlay&&this.$slides.length > 1){
this.geoSync();
}
if(this.options.accessible){
this.$wrapper.attr('tabindex', 0);
}}
}, {
key: '_loadBullets',
value: function _loadBullets(){
this.$bullets=this.$element.find('.' + this.options.boxOfBullets).find('button');
}
}, {
key: 'geoSync',
value: function geoSync(){
var _this=this;
this.timer=new Foundation.Timer(this.$element, {
duration: this.options.timerDelay,
infinite: false
}, function (){
_this.changeSlide(true);
});
this.timer.start();
}
}, {
key: '_prepareForOrbit',
value: function _prepareForOrbit(){
var _this=this;
this._setWrapperHeight();
}
}, {
key: '_setWrapperHeight',
value: function _setWrapperHeight(cb){
var max=0,
temp,
counter=0,
_this=this;
this.$slides.each(function (){
temp=this.getBoundingClientRect().height;
$(this).attr('data-slide', counter);
if(_this.$slides.filter('.is-active')[0]!==_this.$slides.eq(counter)[0]){
$(this).css({ 'position': 'relative', 'display': 'none' });
}
max=temp > max ? temp:max;
counter++;
});
if(counter===this.$slides.length){
this.$wrapper.css({ 'height': max });
if(cb){
cb(max);
}}
}
}, {
key: '_setSlideHeight',
value: function _setSlideHeight(height){
this.$slides.each(function (){
$(this).css('max-height', height);
});
}
}, {
key: '_events',
value: function _events(){
var _this=this;
this.$element.off('.resizeme.zf.trigger').on({
'resizeme.zf.trigger': this._prepareForOrbit.bind(this)
});
if(this.$slides.length > 1){
if(this.options.swipe){
this.$slides.off('swipeleft.zf.orbit swiperight.zf.orbit').on('swipeleft.zf.orbit', function (e){
e.preventDefault();
_this.changeSlide(true);
}).on('swiperight.zf.orbit', function (e){
e.preventDefault();
_this.changeSlide(false);
});
}
if(this.options.autoPlay){
this.$slides.on('click.zf.orbit', function (){
_this.$element.data('clickedOn', _this.$element.data('clickedOn') ? false:true);
_this.timer[_this.$element.data('clickedOn') ? 'pause':'start']();
});
if(this.options.pauseOnHover){
this.$element.on('mouseenter.zf.orbit', function (){
_this.timer.pause();
}).on('mouseleave.zf.orbit', function (){
if(!_this.$element.data('clickedOn')){
_this.timer.start();
}});
}}
if(this.options.navButtons){
var $controls=this.$element.find('.' + this.options.nextClass + ', .' + this.options.prevClass);
$controls.attr('tabindex', 0)
.on('click.zf.orbit touchend.zf.orbit', function (e){
e.preventDefault();
_this.changeSlide($(this).hasClass(_this.options.nextClass));
});
}
if(this.options.bullets){
this.$bullets.on('click.zf.orbit touchend.zf.orbit', function (){
if(/is-active/g.test(this.className)){
return false;
}
var idx=$(this).data('slide'),
ltr=idx > _this.$slides.filter('.is-active').data('slide'),
$slide=_this.$slides.eq(idx);
_this.changeSlide(ltr, $slide, idx);
});
}
if(this.options.accessible){
this.$wrapper.add(this.$bullets).on('keydown.zf.orbit', function (e){
Foundation.Keyboard.handleKey(e, 'Orbit', {
next: function (){
_this.changeSlide(true);
},
previous: function (){
_this.changeSlide(false);
},
handled: function (){
if($(e.target).is(_this.$bullets)){
_this.$bullets.filter('.is-active').focus();
}}
});
});
}}
}
}, {
key: '_reset',
value: function _reset(){
if(typeof this.$slides=='undefined'){
return;
}
if(this.$slides.length > 1){
this.$element.off('.zf.orbit').find('*').off('.zf.orbit');
if(this.options.autoPlay){
this.timer.restart();
}
this.$slides.each(function (el){
$(el).removeClass('is-active is-active is-in').removeAttr('aria-live').hide();
});
this.$slides.first().addClass('is-active').show();
this.$element.trigger('slidechange.zf.orbit', [this.$slides.first()]);
if(this.options.bullets){
this._updateBullets(0);
}}
}
}, {
key: 'changeSlide',
value: function changeSlide(isLTR, chosenSlide, idx){
if(!this.$slides){
return;
}
var $curSlide=this.$slides.filter('.is-active').eq(0);
if(/mui/g.test($curSlide[0].className)){
return false;
}
var $firstSlide=this.$slides.first(),
$lastSlide=this.$slides.last(),
dirIn=isLTR ? 'Right':'Left',
dirOut=isLTR ? 'Left':'Right',
_this=this,
$newSlide;
if(!chosenSlide){
$newSlide=isLTR ?
this.options.infiniteWrap ? $curSlide.next('.' + this.options.slideClass).length ? $curSlide.next('.' + this.options.slideClass):$firstSlide:$curSlide.next('.' + this.options.slideClass) :
this.options.infiniteWrap ? $curSlide.prev('.' + this.options.slideClass).length ? $curSlide.prev('.' + this.options.slideClass):$lastSlide:$curSlide.prev('.' + this.options.slideClass);
}else{
$newSlide=chosenSlide;
}
if($newSlide.length){
this.$element.trigger('beforeslidechange.zf.orbit', [$curSlide, $newSlide]);
if(this.options.bullets){
idx=idx||this.$slides.index($newSlide);
this._updateBullets(idx);
}
if(this.options.useMUI&&!this.$element.is(':hidden')){
Foundation.Motion.animateIn($newSlide.addClass('is-active').css({ 'position': 'absolute', 'top': 0 }), this.options['animInFrom' + dirIn], function (){
$newSlide.css({ 'position': 'relative', 'display': 'block' }).attr('aria-live', 'polite');
});
Foundation.Motion.animateOut($curSlide.removeClass('is-active'), this.options['animOutTo' + dirOut], function (){
$curSlide.removeAttr('aria-live');
if(_this.options.autoPlay&&!_this.timer.isPaused){
_this.timer.restart();
}});
}else{
$curSlide.removeClass('is-active is-in').removeAttr('aria-live').hide();
$newSlide.addClass('is-active is-in').attr('aria-live', 'polite').show();
if(this.options.autoPlay&&!this.timer.isPaused){
this.timer.restart();
}}
this.$element.trigger('slidechange.zf.orbit', [$newSlide]);
}}
}, {
key: '_updateBullets',
value: function _updateBullets(idx){
var $oldBullet=this.$element.find('.' + this.options.boxOfBullets).find('.is-active').removeClass('is-active').blur(),
span=$oldBullet.find('span:last').detach(),
$newBullet=this.$bullets.eq(idx).addClass('is-active').append(span);
}
}, {
key: 'destroy',
value: function destroy(){
this.$element.off('.zf.orbit').find('*').off('.zf.orbit').end().hide();
Foundation.unregisterPlugin(this);
}}]);
return Orbit;
}();
Orbit.defaults={
bullets: true,
navButtons: true,
animInFromRight: 'slide-in-right',
animOutToRight: 'slide-out-right',
animInFromLeft: 'slide-in-left',
animOutToLeft: 'slide-out-left',
autoPlay: true,
timerDelay: 5000,
infiniteWrap: true,
swipe: true,
pauseOnHover: true,
accessible: true,
containerClass: 'orbit-container',
slideClass: 'orbit-slide',
boxOfBullets: 'orbit-bullets',
nextClass: 'orbit-next',
prevClass: 'orbit-previous',
useMUI: true
};
Foundation.plugin(Orbit, 'Orbit');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var ResponsiveMenu=function (){
function ResponsiveMenu(element, options){
_classCallCheck(this, ResponsiveMenu);
this.$element=$(element);
this.rules=this.$element.data('responsive-menu');
this.currentMq=null;
this.currentPlugin=null;
this._init();
this._events();
Foundation.registerPlugin(this, 'ResponsiveMenu');
}
_createClass(ResponsiveMenu, [{
key: '_init',
value: function _init(){
if(typeof this.rules==='string'){
var rulesTree={};
var rules=this.rules.split(' ');
for (var i=0; i < rules.length; i++){
var rule=rules[i].split('-');
var ruleSize=rule.length > 1 ? rule[0]:'small';
var rulePlugin=rule.length > 1 ? rule[1]:rule[0];
if(MenuPlugins[rulePlugin]!==null){
rulesTree[ruleSize]=MenuPlugins[rulePlugin];
}}
this.rules=rulesTree;
}
if(!$.isEmptyObject(this.rules)){
this._checkMediaQueries();
}
this.$element.attr('data-mutate', this.$element.attr('data-mutate')||Foundation.GetYoDigits(6, 'responsive-menu'));
}
}, {
key: '_events',
value: function _events(){
var _this=this;
$(window).on('changed.zf.mediaquery', function (){
_this._checkMediaQueries();
});
}
}, {
key: '_checkMediaQueries',
value: function _checkMediaQueries(){
var matchedMq,
_this=this;
$.each(this.rules, function (key){
if(Foundation.MediaQuery.atLeast(key)){
matchedMq=key;
}});
if(!matchedMq) return;
if(this.currentPlugin instanceof this.rules[matchedMq].plugin) return;
$.each(MenuPlugins, function (key, value){
_this.$element.removeClass(value.cssClass);
});
this.$element.addClass(this.rules[matchedMq].cssClass);
if(this.currentPlugin) this.currentPlugin.destroy();
this.currentPlugin=new this.rules[matchedMq].plugin(this.$element, {});
}
}, {
key: 'destroy',
value: function destroy(){
this.currentPlugin.destroy();
$(window).off('.zf.ResponsiveMenu');
Foundation.unregisterPlugin(this);
}}]);
return ResponsiveMenu;
}();
ResponsiveMenu.defaults={};
var MenuPlugins={
dropdown: {
cssClass: 'dropdown',
plugin: Foundation._plugins['dropdown-menu']||null
},
drilldown: {
cssClass: 'drilldown',
plugin: Foundation._plugins['drilldown']||null
},
accordion: {
cssClass: 'accordion-menu',
plugin: Foundation._plugins['accordion-menu']||null
}};
Foundation.plugin(ResponsiveMenu, 'ResponsiveMenu');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var ResponsiveToggle=function (){
function ResponsiveToggle(element, options){
_classCallCheck(this, ResponsiveToggle);
this.$element=$(element);
this.options=$.extend({}, ResponsiveToggle.defaults, this.$element.data(), options);
this._init();
this._events();
Foundation.registerPlugin(this, 'ResponsiveToggle');
}
_createClass(ResponsiveToggle, [{
key: '_init',
value: function _init(){
var targetID=this.$element.data('responsive-toggle');
if(!targetID){
console.error('Your tab bar needs an ID of a Menu as the value of data-tab-bar.');
}
this.$targetMenu=$('#' + targetID);
this.$toggler=this.$element.find('[data-toggle]').filter(function (){
var target=$(this).data('toggle');
return target===targetID||target==="";
});
this.options=$.extend({}, this.options, this.$targetMenu.data());
if(this.options.animate){
var input=this.options.animate.split(' ');
this.animationIn=input[0];
this.animationOut=input[1]||null;
}
this._update();
}
}, {
key: '_events',
value: function _events(){
var _this=this;
this._updateMqHandler=this._update.bind(this);
$(window).on('changed.zf.mediaquery', this._updateMqHandler);
this.$toggler.on('click.zf.responsiveToggle', this.toggleMenu.bind(this));
}
}, {
key: '_update',
value: function _update(){
if(!Foundation.MediaQuery.atLeast(this.options.hideFor)){
this.$element.show();
this.$targetMenu.hide();
}else{
this.$element.hide();
this.$targetMenu.show();
}}
}, {
key: 'toggleMenu',
value: function toggleMenu(){
var _this2=this;
if(!Foundation.MediaQuery.atLeast(this.options.hideFor)){
if(this.options.animate){
if(this.$targetMenu.is(':hidden')){
Foundation.Motion.animateIn(this.$targetMenu, this.animationIn, function (){
_this2.$element.trigger('toggled.zf.responsiveToggle');
_this2.$targetMenu.find('[data-mutate]').triggerHandler('mutateme.zf.trigger');
});
}else{
Foundation.Motion.animateOut(this.$targetMenu, this.animationOut, function (){
_this2.$element.trigger('toggled.zf.responsiveToggle');
});
}}else{
this.$targetMenu.toggle(0);
this.$targetMenu.find('[data-mutate]').trigger('mutateme.zf.trigger');
this.$element.trigger('toggled.zf.responsiveToggle');
}}
}}, {
key: 'destroy',
value: function destroy(){
this.$element.off('.zf.responsiveToggle');
this.$toggler.off('.zf.responsiveToggle');
$(window).off('changed.zf.mediaquery', this._updateMqHandler);
Foundation.unregisterPlugin(this);
}}]);
return ResponsiveToggle;
}();
ResponsiveToggle.defaults={
hideFor: 'medium',
animate: false
};
Foundation.plugin(ResponsiveToggle, 'ResponsiveToggle');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var Reveal=function (){
function Reveal(element, options){
_classCallCheck(this, Reveal);
this.$element=element;
this.options=$.extend({}, Reveal.defaults, this.$element.data(), options);
this._init();
Foundation.registerPlugin(this, 'Reveal');
Foundation.Keyboard.register('Reveal', {
'ENTER': 'open',
'SPACE': 'open',
'ESCAPE': 'close'
});
}
_createClass(Reveal, [{
key: '_init',
value: function _init(){
this.id=this.$element.attr('id');
this.isActive=false;
this.cached={ mq: Foundation.MediaQuery.current };
this.isMobile=mobileSniff();
this.$anchor=$('[data-open="' + this.id + '"]').length ? $('[data-open="' + this.id + '"]'):$('[data-toggle="' + this.id + '"]');
this.$anchor.attr({
'aria-controls': this.id,
'aria-haspopup': true,
'tabindex': 0
});
if(this.options.fullScreen||this.$element.hasClass('full')){
this.options.fullScreen=true;
this.options.overlay=false;
}
if(this.options.overlay&&!this.$overlay){
this.$overlay=this._makeOverlay(this.id);
}
this.$element.attr({
'role': 'dialog',
'aria-hidden': true,
'data-yeti-box': this.id,
'data-resize': this.id
});
if(this.$overlay){
this.$element.detach().appendTo(this.$overlay);
}else{
this.$element.detach().appendTo($(this.options.appendTo));
this.$element.addClass('without-overlay');
}
this._events();
if(this.options.deepLink&&window.location.hash==='#' + this.id){
$(window).one('load.zf.reveal', this.open.bind(this));
}}
}, {
key: '_makeOverlay',
value: function _makeOverlay(){
return $('<div></div>').addClass('reveal-overlay').appendTo(this.options.appendTo);
}
}, {
key: '_updatePosition',
value: function _updatePosition(){
var width=this.$element.outerWidth();
var outerWidth=$(window).width();
var height=this.$element.outerHeight();
var outerHeight=$(window).height();
var left, top;
if(this.options.hOffset==='auto'){
left=parseInt((outerWidth - width) / 2, 10);
}else{
left=parseInt(this.options.hOffset, 10);
}
if(this.options.vOffset==='auto'){
if(height > outerHeight){
top=parseInt(Math.min(100, outerHeight / 10), 10);
}else{
top=parseInt((outerHeight - height) / 4, 10);
}}else{
top=parseInt(this.options.vOffset, 10);
}
this.$element.css({ top: top + 'px' });
if(!this.$overlay||this.options.hOffset!=='auto'){
this.$element.css({ left: left + 'px' });
this.$element.css({ margin: '0px' });
}}
}, {
key: '_events',
value: function _events(){
var _this2=this;
var _this=this;
this.$element.on({
'open.zf.trigger': this.open.bind(this),
'close.zf.trigger': function (event, $element){
if(event.target===_this.$element[0]||$(event.target).parents('[data-closable]')[0]===$element){
return _this2.close.apply(_this2);
}},
'toggle.zf.trigger': this.toggle.bind(this),
'resizeme.zf.trigger': function (){
_this._updatePosition();
}});
if(this.$anchor.length){
this.$anchor.on('keydown.zf.reveal', function (e){
if(e.which===13||e.which===32){
e.stopPropagation();
e.preventDefault();
_this.open();
}});
}
if(this.options.closeOnClick&&this.options.overlay){
this.$overlay.off('.zf.reveal').on('click.zf.reveal', function (e){
if(e.target===_this.$element[0]||$.contains(_this.$element[0], e.target)||!$.contains(document, e.target)){
return;
}
_this.close();
});
}
if(this.options.deepLink){
$(window).on('popstate.zf.reveal:' + this.id, this._handleState.bind(this));
}}
}, {
key: '_handleState',
value: function _handleState(e){
if(window.location.hash==='#' + this.id&&!this.isActive){
this.open();
}else{
this.close();
}}
}, {
key: 'open',
value: function open(){
var _this3=this;
if(this.options.deepLink){
var hash='#' + this.id;
if(window.history.pushState){
window.history.pushState(null, null, hash);
}else{
window.location.hash=hash;
}}
this.isActive=true;
this.$element.css({ 'visibility': 'hidden' }).show().scrollTop(0);
if(this.options.overlay){
this.$overlay.css({ 'visibility': 'hidden' }).show();
}
this._updatePosition();
this.$element.hide().css({ 'visibility': '' });
if(this.$overlay){
this.$overlay.css({ 'visibility': '' }).hide();
if(this.$element.hasClass('fast')){
this.$overlay.addClass('fast');
}else if(this.$element.hasClass('slow')){
this.$overlay.addClass('slow');
}}
if(!this.options.multipleOpened){
this.$element.trigger('closeme.zf.reveal', this.id);
}
var _this=this;
function addRevealOpenClasses(){
if(_this.isMobile){
if(!_this.originalScrollPos){
_this.originalScrollPos=window.pageYOffset;
}
$('html, body').addClass('is-reveal-open');
}else{
$('body').addClass('is-reveal-open');
}}
if(this.options.animationIn){
var afterAnimation=function (){
_this.$element.attr({
'aria-hidden': false,
'tabindex': -1
}).focus();
addRevealOpenClasses();
Foundation.Keyboard.trapFocus(_this.$element);
};
if(this.options.overlay){
Foundation.Motion.animateIn(this.$overlay, 'fade-in');
}
Foundation.Motion.animateIn(this.$element, this.options.animationIn, function (){
if(_this3.$element){
_this3.focusableElements=Foundation.Keyboard.findFocusable(_this3.$element);
afterAnimation();
}});
}else{
if(this.options.overlay){
this.$overlay.show(0);
}
this.$element.show(this.options.showDelay);
}
this.$element.attr({
'aria-hidden': false,
'tabindex': -1
}).focus();
Foundation.Keyboard.trapFocus(this.$element);
this.$element.trigger('open.zf.reveal');
addRevealOpenClasses();
setTimeout(function (){
_this3._extraHandlers();
}, 0);
}
}, {
key: '_extraHandlers',
value: function _extraHandlers(){
var _this=this;
if(!this.$element){
return;
}
this.focusableElements=Foundation.Keyboard.findFocusable(this.$element);
if(!this.options.overlay&&this.options.closeOnClick&&!this.options.fullScreen){
$('body').on('click.zf.reveal', function (e){
if(e.target===_this.$element[0]||$.contains(_this.$element[0], e.target)||!$.contains(document, e.target)){
return;
}
_this.close();
});
}
if(this.options.closeOnEsc){
$(window).on('keydown.zf.reveal', function (e){
Foundation.Keyboard.handleKey(e, 'Reveal', {
close: function (){
if(_this.options.closeOnEsc){
_this.close();
_this.$anchor.focus();
}}
});
});
}
this.$element.on('keydown.zf.reveal', function (e){
var $target=$(this);
Foundation.Keyboard.handleKey(e, 'Reveal', {
open: function (){
if(_this.$element.find(':focus').is(_this.$element.find('[data-close]'))){
setTimeout(function (){
_this.$anchor.focus();
}, 1);
}else if($target.is(_this.focusableElements)){
_this.open();
}},
close: function (){
if(_this.options.closeOnEsc){
_this.close();
_this.$anchor.focus();
}},
handled: function (preventDefault){
if(preventDefault){
e.preventDefault();
}}
});
});
}
}, {
key: 'close',
value: function close(){
if(!this.isActive||!this.$element.is(':visible')){
return false;
}
var _this=this;
if(this.options.animationOut){
if(this.options.overlay){
Foundation.Motion.animateOut(this.$overlay, 'fade-out', finishUp);
}else{
finishUp();
}
Foundation.Motion.animateOut(this.$element, this.options.animationOut);
}else{
this.$element.hide(this.options.hideDelay);
if(this.options.overlay){
this.$overlay.hide(0, finishUp);
}else{
finishUp();
}}
if(this.options.closeOnEsc){
$(window).off('keydown.zf.reveal');
}
if(!this.options.overlay&&this.options.closeOnClick){
$('body').off('click.zf.reveal');
}
this.$element.off('keydown.zf.reveal');
function finishUp(){
if(_this.isMobile){
if($('.reveal:visible').length===0){
$('html, body').removeClass('is-reveal-open');
}
if(_this.originalScrollPos){
$('body').scrollTop(_this.originalScrollPos);
_this.originalScrollPos=null;
}}else{
if($('.reveal:visible').length===0){
$('body').removeClass('is-reveal-open');
}}
Foundation.Keyboard.releaseFocus(_this.$element);
_this.$element.attr('aria-hidden', true);
_this.$element.trigger('closed.zf.reveal');
}
if(this.options.resetOnClose){
this.$element.html(this.$element.html());
}
this.isActive=false;
if(_this.options.deepLink){
if(window.history.replaceState){
window.history.replaceState('', document.title, window.location.href.replace('#' + this.id, ''));
}else{
window.location.hash='';
}}
}
}, {
key: 'toggle',
value: function toggle(){
if(this.isActive){
this.close();
}else{
this.open();
}}
}, {
key: 'destroy',
value: function destroy(){
if(this.options.overlay){
this.$element.appendTo($(this.options.appendTo));
this.$overlay.hide().off().remove();
}
this.$element.hide().off();
this.$anchor.off('.zf');
$(window).off('.zf.reveal:' + this.id);
Foundation.unregisterPlugin(this);
}}]);
return Reveal;
}();
Reveal.defaults={
animationIn: '',
animationOut: '',
showDelay: 0,
hideDelay: 0,
closeOnClick: true,
closeOnEsc: true,
multipleOpened: false,
vOffset: 'auto',
hOffset: 'auto',
fullScreen: false,
btmOffsetPct: 10,
overlay: true,
resetOnClose: false,
deepLink: false,
appendTo: "body"
};
Foundation.plugin(Reveal, 'Reveal');
function iPhoneSniff(){
return (/iP(ad|hone|od).*OS/.test(window.navigator.userAgent)
);
}
function androidSniff(){
return (/Android/.test(window.navigator.userAgent)
);
}
function mobileSniff(){
return iPhoneSniff()||androidSniff();
}}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var Slider=function (){
function Slider(element, options){
_classCallCheck(this, Slider);
this.$element=element;
this.options=$.extend({}, Slider.defaults, this.$element.data(), options);
this._init();
Foundation.registerPlugin(this, 'Slider');
Foundation.Keyboard.register('Slider', {
'ltr': {
'ARROW_RIGHT': 'increase',
'ARROW_UP': 'increase',
'ARROW_DOWN': 'decrease',
'ARROW_LEFT': 'decrease',
'SHIFT_ARROW_RIGHT': 'increase_fast',
'SHIFT_ARROW_UP': 'increase_fast',
'SHIFT_ARROW_DOWN': 'decrease_fast',
'SHIFT_ARROW_LEFT': 'decrease_fast'
},
'rtl': {
'ARROW_LEFT': 'increase',
'ARROW_RIGHT': 'decrease',
'SHIFT_ARROW_LEFT': 'increase_fast',
'SHIFT_ARROW_RIGHT': 'decrease_fast'
}});
}
_createClass(Slider, [{
key: '_init',
value: function _init(){
this.inputs=this.$element.find('input');
this.handles=this.$element.find('[data-slider-handle]');
this.$handle=this.handles.eq(0);
this.$input=this.inputs.length ? this.inputs.eq(0):$('#' + this.$handle.attr('aria-controls'));
this.$fill=this.$element.find('[data-slider-fill]').css(this.options.vertical ? 'height':'width', 0);
var isDbl=false,
_this=this;
if(this.options.disabled||this.$element.hasClass(this.options.disabledClass)){
this.options.disabled=true;
this.$element.addClass(this.options.disabledClass);
}
if(!this.inputs.length){
this.inputs=$().add(this.$input);
this.options.binding=true;
}
this._setInitAttr(0);
if(this.handles[1]){
this.options.doubleSided=true;
this.$handle2=this.handles.eq(1);
this.$input2=this.inputs.length > 1 ? this.inputs.eq(1):$('#' + this.$handle2.attr('aria-controls'));
if(!this.inputs[1]){
this.inputs=this.inputs.add(this.$input2);
}
isDbl=true;
this._setInitAttr(1);
}
this.setHandles();
this._events();
}}, {
key: 'setHandles',
value: function setHandles(){
var _this2=this;
if(this.handles[1]){
this._setHandlePos(this.$handle, this.inputs.eq(0).val(), true, function (){
_this2._setHandlePos(_this2.$handle2, _this2.inputs.eq(1).val(), true);
});
}else{
this._setHandlePos(this.$handle, this.inputs.eq(0).val(), true);
}}
}, {
key: '_reflow',
value: function _reflow(){
this.setHandles();
}
}, {
key: '_pctOfBar',
value: function _pctOfBar(value){
var pctOfBar=percent(value - this.options.start, this.options.end - this.options.start);
switch (this.options.positionValueFunction){
case "pow":
pctOfBar=this._logTransform(pctOfBar);
break;
case "log":
pctOfBar=this._powTransform(pctOfBar);
break;
}
return pctOfBar.toFixed(2);
}
}, {
key: '_value',
value: function _value(pctOfBar){
switch (this.options.positionValueFunction){
case "pow":
pctOfBar=this._powTransform(pctOfBar);
break;
case "log":
pctOfBar=this._logTransform(pctOfBar);
break;
}
var value=(this.options.end - this.options.start) * pctOfBar + this.options.start;
return value;
}
}, {
key: '_logTransform',
value: function _logTransform(value){
return baseLog(this.options.nonLinearBase, value * (this.options.nonLinearBase - 1) + 1);
}
}, {
key: '_powTransform',
value: function _powTransform(value){
return (Math.pow(this.options.nonLinearBase, value) - 1) / (this.options.nonLinearBase - 1);
}
}, {
key: '_setHandlePos',
value: function _setHandlePos($hndl, location, noInvert, cb){
if(this.$element.hasClass(this.options.disabledClass)){
return;
}
location=parseFloat(location);
if(location < this.options.start){
location=this.options.start;
}else if(location > this.options.end){
location=this.options.end;
}
var isDbl=this.options.doubleSided;
if(isDbl){
if(this.handles.index($hndl)===0){
var h2Val=parseFloat(this.$handle2.attr('aria-valuenow'));
location=location >=h2Val ? h2Val - this.options.step:location;
}else{
var h1Val=parseFloat(this.$handle.attr('aria-valuenow'));
location=location <=h1Val ? h1Val + this.options.step:location;
}}
if(this.options.vertical&&!noInvert){
location=this.options.end - location;
}
var _this=this,
vert=this.options.vertical,
hOrW=vert ? 'height':'width',
lOrT=vert ? 'top':'left',
handleDim=$hndl[0].getBoundingClientRect()[hOrW],
elemDim=this.$element[0].getBoundingClientRect()[hOrW],
pctOfBar=this._pctOfBar(location),
pxToMove=(elemDim - handleDim) * pctOfBar,
movement=(percent(pxToMove, elemDim) * 100).toFixed(this.options.decimal);
location=parseFloat(location.toFixed(this.options.decimal));
var css={};
this._setValues($hndl, location);
if(isDbl){
var isLeftHndl=this.handles.index($hndl)===0,
dim,
handlePct=~~(percent(handleDim, elemDim) * 100);
if(isLeftHndl){
css[lOrT]=movement + '%';
dim=parseFloat(this.$handle2[0].style[lOrT]) - movement + handlePct;
if(cb&&typeof cb==='function'){
cb();
}}else{
var handlePos=parseFloat(this.$handle[0].style[lOrT]);
dim=movement - (isNaN(handlePos) ? (this.options.initialStart - this.options.start) / ((this.options.end - this.options.start) / 100):handlePos) + handlePct;
}
css['min-' + hOrW]=dim + '%';
}
this.$element.one('finished.zf.animate', function (){
_this.$element.trigger('moved.zf.slider', [$hndl]);
});
var moveTime=this.$element.data('dragging') ? 1000 / 60:this.options.moveTime;
Foundation.Move(moveTime, $hndl, function (){
if(isNaN(movement)){
$hndl.css(lOrT, pctOfBar * 100 + '%');
}else{
$hndl.css(lOrT, movement + '%');
}
if(!_this.options.doubleSided){
_this.$fill.css(hOrW, pctOfBar * 100 + '%');
}else{
_this.$fill.css(css);
}});
clearTimeout(_this.timeout);
_this.timeout=setTimeout(function (){
_this.$element.trigger('changed.zf.slider', [$hndl]);
}, _this.options.changedDelay);
}
}, {
key: '_setInitAttr',
value: function _setInitAttr(idx){
var initVal=idx===0 ? this.options.initialStart:this.options.initialEnd;
var id=this.inputs.eq(idx).attr('id')||Foundation.GetYoDigits(6, 'slider');
this.inputs.eq(idx).attr({
'id': id,
'max': this.options.end,
'min': this.options.start,
'step': this.options.step
});
this.inputs.eq(idx).val(initVal);
this.handles.eq(idx).attr({
'role': 'slider',
'aria-controls': id,
'aria-valuemax': this.options.end,
'aria-valuemin': this.options.start,
'aria-valuenow': initVal,
'aria-orientation': this.options.vertical ? 'vertical':'horizontal',
'tabindex': 0
});
}
}, {
key: '_setValues',
value: function _setValues($handle, val){
var idx=this.options.doubleSided ? this.handles.index($handle):0;
this.inputs.eq(idx).val(val);
$handle.attr('aria-valuenow', val);
}
}, {
key: '_handleEvent',
value: function _handleEvent(e, $handle, val){
var value, hasVal;
if(!val){
e.preventDefault();
var _this=this,
vertical=this.options.vertical,
param=vertical ? 'height':'width',
direction=vertical ? 'top':'left',
eventOffset=vertical ? e.pageY:e.pageX,
halfOfHandle=this.$handle[0].getBoundingClientRect()[param] / 2,
barDim=this.$element[0].getBoundingClientRect()[param],
windowScroll=vertical ? $(window).scrollTop():$(window).scrollLeft();
var elemOffset=this.$element.offset()[direction];
if(e.clientY===e.pageY){
eventOffset=eventOffset + windowScroll;
}
var eventFromBar=eventOffset - elemOffset;
var barXY;
if(eventFromBar < 0){
barXY=0;
}else if(eventFromBar > barDim){
barXY=barDim;
}else{
barXY=eventFromBar;
}
var offsetPct=percent(barXY, barDim);
value=this._value(offsetPct);
if(Foundation.rtl()&&!this.options.vertical){
value=this.options.end - value;
}
value=_this._adjustValue(null, value);
hasVal=false;
if(!$handle){
var firstHndlPos=absPosition(this.$handle, direction, barXY, param),
secndHndlPos=absPosition(this.$handle2, direction, barXY, param);
$handle=firstHndlPos <=secndHndlPos ? this.$handle:this.$handle2;
}}else{
value=this._adjustValue(null, val);
hasVal=true;
}
this._setHandlePos($handle, value, hasVal);
}
}, {
key: '_adjustValue',
value: function _adjustValue($handle, value){
var val,
step=this.options.step,
div=parseFloat(step / 2),
left,
prev_val,
next_val;
if(!!$handle){
val=parseFloat($handle.attr('aria-valuenow'));
}else{
val=value;
}
left=val % step;
prev_val=val - left;
next_val=prev_val + step;
if(left===0){
return val;
}
val=val >=prev_val + div ? next_val:prev_val;
return val;
}
}, {
key: '_events',
value: function _events(){
this._eventsForHandle(this.$handle);
if(this.handles[1]){
this._eventsForHandle(this.$handle2);
}}
}, {
key: '_eventsForHandle',
value: function _eventsForHandle($handle){
var _this=this,
curHandle,
timer;
this.inputs.off('change.zf.slider').on('change.zf.slider', function (e){
var idx=_this.inputs.index($(this));
_this._handleEvent(e, _this.handles.eq(idx), $(this).val());
});
if(this.options.clickSelect){
this.$element.off('click.zf.slider').on('click.zf.slider', function (e){
if(_this.$element.data('dragging')){
return false;
}
if(!$(e.target).is('[data-slider-handle]')){
if(_this.options.doubleSided){
_this._handleEvent(e);
}else{
_this._handleEvent(e, _this.$handle);
}}
});
}
if(this.options.draggable){
this.handles.addTouch();
var $body=$('body');
$handle.off('mousedown.zf.slider').on('mousedown.zf.slider', function (e){
$handle.addClass('is-dragging');
_this.$fill.addClass('is-dragging');
_this.$element.data('dragging', true);
curHandle=$(e.currentTarget);
$body.on('mousemove.zf.slider', function (e){
e.preventDefault();
_this._handleEvent(e, curHandle);
}).on('mouseup.zf.slider', function (e){
_this._handleEvent(e, curHandle);
$handle.removeClass('is-dragging');
_this.$fill.removeClass('is-dragging');
_this.$element.data('dragging', false);
$body.off('mousemove.zf.slider mouseup.zf.slider');
});
})
.on('selectstart.zf.slider touchmove.zf.slider', function (e){
e.preventDefault();
});
}
$handle.off('keydown.zf.slider').on('keydown.zf.slider', function (e){
var _$handle=$(this),
idx=_this.options.doubleSided ? _this.handles.index(_$handle):0,
oldValue=parseFloat(_this.inputs.eq(idx).val()),
newValue;
Foundation.Keyboard.handleKey(e, 'Slider', {
decrease: function (){
newValue=oldValue - _this.options.step;
},
increase: function (){
newValue=oldValue + _this.options.step;
},
decrease_fast: function (){
newValue=oldValue - _this.options.step * 10;
},
increase_fast: function (){
newValue=oldValue + _this.options.step * 10;
},
handled: function (){
e.preventDefault();
_this._setHandlePos(_$handle, newValue, true);
}});
});
}
}, {
key: 'destroy',
value: function destroy(){
this.handles.off('.zf.slider');
this.inputs.off('.zf.slider');
this.$element.off('.zf.slider');
clearTimeout(this.timeout);
Foundation.unregisterPlugin(this);
}}]);
return Slider;
}();
Slider.defaults={
start: 0,
end: 100,
step: 1,
initialStart: 0,
initialEnd: 100,
binding: false,
clickSelect: true,
vertical: false,
draggable: true,
disabled: false,
doubleSided: false,
decimal: 2,
moveTime: 200,
disabledClass: 'disabled',
invertVertical: false,
changedDelay: 500,
nonLinearBase: 5,
positionValueFunction: 'linear'
};
function percent(frac, num){
return frac / num;
}
function absPosition($handle, dir, clickPos, param){
return Math.abs($handle.position()[dir] + $handle[param]() / 2 - clickPos);
}
function baseLog(base, value){
return Math.log(value) / Math.log(base);
}
Foundation.plugin(Slider, 'Slider');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var Sticky=function (){
function Sticky(element, options){
_classCallCheck(this, Sticky);
this.$element=element;
this.options=$.extend({}, Sticky.defaults, this.$element.data(), options);
this._init();
Foundation.registerPlugin(this, 'Sticky');
}
_createClass(Sticky, [{
key: '_init',
value: function _init(){
var $parent=this.$element.parent('[data-sticky-container]'),
id=this.$element[0].id||Foundation.GetYoDigits(6, 'sticky'),
_this=this;
if(!$parent.length){
this.wasWrapped=true;
}
this.$container=$parent.length ? $parent:$(this.options.container).wrapInner(this.$element);
this.$container.addClass(this.options.containerClass);
this.$element.addClass(this.options.stickyClass).attr({ 'data-resize': id, 'data-mutate': id });
if(this.options.anchor!==''){
$('#' + _this.options.anchor).attr({ 'data-mutate': id });
}
this.scrollCount=this.options.checkEvery;
this.isStuck=false;
$(window).one('load.zf.sticky', function (){
_this.containerHeight=_this.$element.css("display")=="none" ? 0:_this.$element[0].getBoundingClientRect().height;
_this.$container.css('height', _this.containerHeight);
_this.elemHeight=_this.containerHeight;
if(_this.options.anchor!==''){
_this.$anchor=$('#' + _this.options.anchor);
}else{
_this._parsePoints();
}
_this._setSizes(function (){
var scroll=window.pageYOffset;
_this._calc(false, scroll);
if(!_this.isStuck){
_this._removeSticky(scroll >=_this.topPoint ? false:true);
}});
_this._events(id.split('-').reverse().join('-'));
});
}
}, {
key: '_parsePoints',
value: function _parsePoints(){
var top=this.options.topAnchor=="" ? 1:this.options.topAnchor,
btm=this.options.btmAnchor=="" ? document.documentElement.scrollHeight:this.options.btmAnchor,
pts=[top, btm],
breaks={};
for (var i=0, len=pts.length; i < len&&pts[i]; i++){
var pt;
if(typeof pts[i]==='number'){
pt=pts[i];
}else{
var place=pts[i].split(':'),
anchor=$('#' + place[0]);
pt=anchor.offset().top;
if(place[1]&&place[1].toLowerCase()==='bottom'){
pt +=anchor[0].getBoundingClientRect().height;
}}
breaks[i]=pt;
}
this.points=breaks;
return;
}
}, {
key: '_events',
value: function _events(id){
var _this=this,
scrollListener=this.scrollListener='scroll.zf.' + id;
if(this.isOn){
return;
}
if(this.canStick){
this.isOn=true;
$(window).off(scrollListener).on(scrollListener, function (e){
if(_this.scrollCount===0){
_this.scrollCount=_this.options.checkEvery;
_this._setSizes(function (){
_this._calc(false, window.pageYOffset);
});
}else{
_this.scrollCount--;
_this._calc(false, window.pageYOffset);
}});
}
this.$element.off('resizeme.zf.trigger').on('resizeme.zf.trigger', function (e, el){
_this._eventsHandler(id);
});
this.$element.on('mutateme.zf.trigger', function (e, el){
_this._eventsHandler(id);
});
if(this.$anchor){
this.$anchor.on('mutateme.zf.trigger', function (e, el){
_this._eventsHandler(id);
});
}}
}, {
key: '_eventsHandler',
value: function _eventsHandler(id){
var _this=this,
scrollListener=this.scrollListener='scroll.zf.' + id;
_this._setSizes(function (){
_this._calc(false);
if(_this.canStick){
if(!_this.isOn){
_this._events(id);
}}else if(_this.isOn){
_this._pauseListeners(scrollListener);
}});
}
}, {
key: '_pauseListeners',
value: function _pauseListeners(scrollListener){
this.isOn=false;
$(window).off(scrollListener);
this.$element.trigger('pause.zf.sticky');
}
}, {
key: '_calc',
value: function _calc(checkSizes, scroll){
if(checkSizes){
this._setSizes();
}
if(!this.canStick){
if(this.isStuck){
this._removeSticky(true);
}
return false;
}
if(!scroll){
scroll=window.pageYOffset;
}
if(scroll >=this.topPoint){
if(scroll <=this.bottomPoint){
if(!this.isStuck){
this._setSticky();
}}else{
if(this.isStuck){
this._removeSticky(false);
}}
}else{
if(this.isStuck){
this._removeSticky(true);
}}
}
}, {
key: '_setSticky',
value: function _setSticky(){
var _this=this,
stickTo=this.options.stickTo,
mrgn=stickTo==='top' ? 'marginTop':'marginBottom',
notStuckTo=stickTo==='top' ? 'bottom':'top',
css={};
css[mrgn]=this.options[mrgn] + 'em';
css[stickTo]=0;
css[notStuckTo]='auto';
this.isStuck=true;
this.$element.removeClass('is-anchored is-at-' + notStuckTo).addClass('is-stuck is-at-' + stickTo).css(css)
.trigger('sticky.zf.stuckto:' + stickTo);
this.$element.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", function (){
_this._setSizes();
});
}
}, {
key: '_removeSticky',
value: function _removeSticky(isTop){
var stickTo=this.options.stickTo,
stickToTop=stickTo==='top',
css={},
anchorPt=(this.points ? this.points[1] - this.points[0]:this.anchorHeight) - this.elemHeight,
mrgn=stickToTop ? 'marginTop':'marginBottom',
notStuckTo=stickToTop ? 'bottom':'top',
topOrBottom=isTop ? 'top':'bottom';
css[mrgn]=0;
css['bottom']='auto';
if(isTop){
css['top']=0;
}else{
css['top']=anchorPt;
}
this.isStuck=false;
this.$element.removeClass('is-stuck is-at-' + stickTo).addClass('is-anchored is-at-' + topOrBottom).css(css)
.trigger('sticky.zf.unstuckfrom:' + topOrBottom);
}
}, {
key: '_setSizes',
value: function _setSizes(cb){
this.canStick=Foundation.MediaQuery.is(this.options.stickyOn);
if(!this.canStick){
if(cb&&typeof cb==='function'){
cb();
}}
var _this=this,
newElemWidth=this.$container[0].getBoundingClientRect().width,
comp=window.getComputedStyle(this.$container[0]),
pdngl=parseInt(comp['padding-left'], 10),
pdngr=parseInt(comp['padding-right'], 10);
if(this.$anchor&&this.$anchor.length){
this.anchorHeight=this.$anchor[0].getBoundingClientRect().height;
}else{
this._parsePoints();
}
this.$element.css({
'max-width': newElemWidth - pdngl - pdngr + 'px'
});
var newContainerHeight=this.$element[0].getBoundingClientRect().height||this.containerHeight;
if(this.$element.css("display")=="none"){
newContainerHeight=0;
}
this.containerHeight=newContainerHeight;
this.$container.css({
height: newContainerHeight
});
this.elemHeight=newContainerHeight;
if(!this.isStuck){
if(this.$element.hasClass('is-at-bottom')){
var anchorPt=(this.points ? this.points[1] - this.$container.offset().top:this.anchorHeight) - this.elemHeight;
this.$element.css('top', anchorPt);
}}
this._setBreakPoints(newContainerHeight, function (){
if(cb&&typeof cb==='function'){
cb();
}});
}
}, {
key: '_setBreakPoints',
value: function _setBreakPoints(elemHeight, cb){
if(!this.canStick){
if(cb&&typeof cb==='function'){
cb();
}else{
return false;
}}
var mTop=emCalc(this.options.marginTop),
mBtm=emCalc(this.options.marginBottom),
topPoint=this.points ? this.points[0]:this.$anchor.offset().top,
bottomPoint=this.points ? this.points[1]:topPoint + this.anchorHeight,
winHeight=window.innerHeight;
if(this.options.stickTo==='top'){
topPoint -=mTop;
bottomPoint -=elemHeight + mTop;
}else if(this.options.stickTo==='bottom'){
topPoint -=winHeight - (elemHeight + mBtm);
bottomPoint -=winHeight - mBtm;
}else{
}
this.topPoint=topPoint;
this.bottomPoint=bottomPoint;
if(cb&&typeof cb==='function'){
cb();
}}
}, {
key: 'destroy',
value: function destroy(){
this._removeSticky(true);
this.$element.removeClass(this.options.stickyClass + ' is-anchored is-at-top').css({
height: '',
top: '',
bottom: '',
'max-width': ''
}).off('resizeme.zf.trigger').off('mutateme.zf.trigger');
if(this.$anchor&&this.$anchor.length){
this.$anchor.off('change.zf.sticky');
}
$(window).off(this.scrollListener);
if(this.wasWrapped){
this.$element.unwrap();
}else{
this.$container.removeClass(this.options.containerClass).css({
height: ''
});
}
Foundation.unregisterPlugin(this);
}}]);
return Sticky;
}();
Sticky.defaults={
container: '<div data-sticky-container></div>',
stickTo: 'top',
anchor: '',
topAnchor: '',
btmAnchor: '',
marginTop: 1,
marginBottom: 1,
stickyOn: 'medium',
stickyClass: 'sticky',
containerClass: 'sticky-container',
checkEvery: -1
};
function emCalc(em){
return parseInt(window.getComputedStyle(document.body, null).fontSize, 10) * em;
}
Foundation.plugin(Sticky, 'Sticky');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var Tabs=function (){
function Tabs(element, options){
_classCallCheck(this, Tabs);
this.$element=element;
this.options=$.extend({}, Tabs.defaults, this.$element.data(), options);
this._init();
Foundation.registerPlugin(this, 'Tabs');
Foundation.Keyboard.register('Tabs', {
'ENTER': 'open',
'SPACE': 'open',
'ARROW_RIGHT': 'next',
'ARROW_UP': 'previous',
'ARROW_DOWN': 'next',
'ARROW_LEFT': 'previous'
});
}
_createClass(Tabs, [{
key: '_init',
value: function _init(){
var _this2=this;
var _this=this;
this.$element.attr({ 'role': 'tablist' });
this.$tabTitles=this.$element.find('.' + this.options.linkClass);
this.$tabContent=$('[data-tabs-content="' + this.$element[0].id + '"]');
this.$tabTitles.each(function (){
var $elem=$(this),
$link=$elem.find('a'),
isActive=$elem.hasClass('' + _this.options.linkActiveClass),
hash=$link[0].hash.slice(1),
linkId=$link[0].id ? $link[0].id:hash + '-label',
$tabContent=$('#' + hash);
$elem.attr({ 'role': 'presentation' });
$link.attr({
'role': 'tab',
'aria-controls': hash,
'aria-selected': isActive,
'id': linkId
});
$tabContent.attr({
'role': 'tabpanel',
'aria-hidden': !isActive,
'aria-labelledby': linkId
});
if(isActive&&_this.options.autoFocus){
$(window).load(function (){
$('html, body').animate({ scrollTop: $elem.offset().top }, _this.options.deepLinkSmudgeDelay, function (){
$link.focus();
});
});
}});
if(this.options.matchHeight){
var $images=this.$tabContent.find('img');
if($images.length){
Foundation.onImagesLoaded($images, this._setHeight.bind(this));
}else{
this._setHeight();
}}
this._checkDeepLink=function (){
var anchor=window.location.hash;
if(anchor.length){
var $link=_this2.$element.find('[href$="' + anchor + '"]');
if($link.length){
_this2.selectTab($(anchor), true);
if(_this2.options.deepLinkSmudge){
var offset=_this2.$element.offset();
$('html, body').animate({ scrollTop: offset.top }, _this2.options.deepLinkSmudgeDelay);
}
_this2.$element.trigger('deeplink.zf.tabs', [$link, $(anchor)]);
}}
};
if(this.options.deepLink){
this._checkDeepLink();
}
this._events();
}
}, {
key: '_events',
value: function _events(){
this._addKeyHandler();
this._addClickHandler();
this._setHeightMqHandler=null;
if(this.options.matchHeight){
this._setHeightMqHandler=this._setHeight.bind(this);
$(window).on('changed.zf.mediaquery', this._setHeightMqHandler);
}
if(this.options.deepLink){
$(window).on('popstate', this._checkDeepLink);
}}
}, {
key: '_addClickHandler',
value: function _addClickHandler(){
var _this=this;
this.$element.off('click.zf.tabs').on('click.zf.tabs', '.' + this.options.linkClass, function (e){
e.preventDefault();
e.stopPropagation();
_this._handleTabChange($(this));
});
}
}, {
key: '_addKeyHandler',
value: function _addKeyHandler(){
var _this=this;
this.$tabTitles.off('keydown.zf.tabs').on('keydown.zf.tabs', function (e){
if(e.which===9) return;
var $element=$(this),
$elements=$element.parent('ul').children('li'),
$prevElement,
$nextElement;
$elements.each(function (i){
if($(this).is($element)){
if(_this.options.wrapOnKeys){
$prevElement=i===0 ? $elements.last():$elements.eq(i - 1);
$nextElement=i===$elements.length - 1 ? $elements.first():$elements.eq(i + 1);
}else{
$prevElement=$elements.eq(Math.max(0, i - 1));
$nextElement=$elements.eq(Math.min(i + 1, $elements.length - 1));
}
return;
}});
Foundation.Keyboard.handleKey(e, 'Tabs', {
open: function (){
$element.find('[role="tab"]').focus();
_this._handleTabChange($element);
},
previous: function (){
$prevElement.find('[role="tab"]').focus();
_this._handleTabChange($prevElement);
},
next: function (){
$nextElement.find('[role="tab"]').focus();
_this._handleTabChange($nextElement);
},
handled: function (){
e.stopPropagation();
e.preventDefault();
}});
});
}
}, {
key: '_handleTabChange',
value: function _handleTabChange($target, historyHandled){
if($target.hasClass('' + this.options.linkActiveClass)){
if(this.options.activeCollapse){
this._collapseTab($target);
this.$element.trigger('collapse.zf.tabs', [$target]);
}
return;
}
var $oldTab=this.$element.find('.' + this.options.linkClass + '.' + this.options.linkActiveClass),
$tabLink=$target.find('[role="tab"]'),
hash=$tabLink[0].hash,
$targetContent=this.$tabContent.find(hash);
this._collapseTab($oldTab);
this._openTab($target);
if(this.options.deepLink&&!historyHandled){
var anchor=$target.find('a').attr('href');
if(this.options.updateHistory){
history.pushState({}, '', anchor);
}else{
history.replaceState({}, '', anchor);
}}
this.$element.trigger('change.zf.tabs', [$target, $targetContent]);
$targetContent.find("[data-mutate]").trigger("mutateme.zf.trigger");
}
}, {
key: '_openTab',
value: function _openTab($target){
var $tabLink=$target.find('[role="tab"]'),
hash=$tabLink[0].hash,
$targetContent=this.$tabContent.find(hash);
$target.addClass('' + this.options.linkActiveClass);
$tabLink.attr({ 'aria-selected': 'true' });
$targetContent.addClass('' + this.options.panelActiveClass).attr({ 'aria-hidden': 'false' });
}
}, {
key: '_collapseTab',
value: function _collapseTab($target){
var $target_anchor=$target.removeClass('' + this.options.linkActiveClass).find('[role="tab"]').attr({ 'aria-selected': 'false' });
$('#' + $target_anchor.attr('aria-controls')).removeClass('' + this.options.panelActiveClass).attr({ 'aria-hidden': 'true' });
}
}, {
key: 'selectTab',
value: function selectTab(elem, historyHandled){
var idStr;
if(typeof elem==='object'){
idStr=elem[0].id;
}else{
idStr=elem;
}
if(idStr.indexOf('#') < 0){
idStr='#' + idStr;
}
var $target=this.$tabTitles.find('[href$="' + idStr + '"]').parent('.' + this.options.linkClass);
this._handleTabChange($target, historyHandled);
}}, {
key: '_setHeight',
value: function _setHeight(){
var max=0,
_this=this;
this.$tabContent.find('.' + this.options.panelClass).css('height', '').each(function (){
var panel=$(this),
isActive=panel.hasClass('' + _this.options.panelActiveClass);
if(!isActive){
panel.css({ 'visibility': 'hidden', 'display': 'block' });
}
var temp=this.getBoundingClientRect().height;
if(!isActive){
panel.css({
'visibility': '',
'display': ''
});
}
max=temp > max ? temp:max;
}).css('height', max + 'px');
}
}, {
key: 'destroy',
value: function destroy(){
this.$element.find('.' + this.options.linkClass).off('.zf.tabs').hide().end().find('.' + this.options.panelClass).hide();
if(this.options.matchHeight){
if(this._setHeightMqHandler!=null){
$(window).off('changed.zf.mediaquery', this._setHeightMqHandler);
}}
if(this.options.deepLink){
$(window).off('popstate', this._checkDeepLink);
}
Foundation.unregisterPlugin(this);
}}]);
return Tabs;
}();
Tabs.defaults={
deepLink: false,
deepLinkSmudge: false,
deepLinkSmudgeDelay: 300,
updateHistory: false,
autoFocus: false,
wrapOnKeys: true,
matchHeight: false,
activeCollapse: false,
linkClass: 'tabs-title',
linkActiveClass: 'is-active',
panelClass: 'tabs-panel',
panelActiveClass: 'is-active'
};
Foundation.plugin(Tabs, 'Tabs');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var Toggler=function (){
function Toggler(element, options){
_classCallCheck(this, Toggler);
this.$element=element;
this.options=$.extend({}, Toggler.defaults, element.data(), options);
this.className='';
this._init();
this._events();
Foundation.registerPlugin(this, 'Toggler');
}
_createClass(Toggler, [{
key: '_init',
value: function _init(){
var input;
if(this.options.animate){
input=this.options.animate.split(' ');
this.animationIn=input[0];
this.animationOut=input[1]||null;
}else{
input=this.$element.data('toggler');
this.className=input[0]==='.' ? input.slice(1):input;
}
var id=this.$element[0].id;
$('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').attr('aria-controls', id);
this.$element.attr('aria-expanded', this.$element.is(':hidden') ? false:true);
}
}, {
key: '_events',
value: function _events(){
this.$element.off('toggle.zf.trigger').on('toggle.zf.trigger', this.toggle.bind(this));
}
}, {
key: 'toggle',
value: function toggle(){
this[this.options.animate ? '_toggleAnimate':'_toggleClass']();
}}, {
key: '_toggleClass',
value: function _toggleClass(){
this.$element.toggleClass(this.className);
var isOn=this.$element.hasClass(this.className);
if(isOn){
this.$element.trigger('on.zf.toggler');
}else{
this.$element.trigger('off.zf.toggler');
}
this._updateARIA(isOn);
this.$element.find('[data-mutate]').trigger('mutateme.zf.trigger');
}}, {
key: '_toggleAnimate',
value: function _toggleAnimate(){
var _this=this;
if(this.$element.is(':hidden')){
Foundation.Motion.animateIn(this.$element, this.animationIn, function (){
_this._updateARIA(true);
this.trigger('on.zf.toggler');
this.find('[data-mutate]').trigger('mutateme.zf.trigger');
});
}else{
Foundation.Motion.animateOut(this.$element, this.animationOut, function (){
_this._updateARIA(false);
this.trigger('off.zf.toggler');
this.find('[data-mutate]').trigger('mutateme.zf.trigger');
});
}}
}, {
key: '_updateARIA',
value: function _updateARIA(isOn){
this.$element.attr('aria-expanded', isOn ? true:false);
}
}, {
key: 'destroy',
value: function destroy(){
this.$element.off('.zf.toggler');
Foundation.unregisterPlugin(this);
}}]);
return Toggler;
}();
Toggler.defaults={
animate: false
};
Foundation.plugin(Toggler, 'Toggler');
}(jQuery);
;'use strict';
var _createClass=function (){ function defineProperties(target, props){ for (var i=0; i < props.length; i++){ var descriptor=props[i]; descriptor.enumerable=descriptor.enumerable||false; descriptor.configurable=true; if("value" in descriptor) descriptor.writable=true; Object.defineProperty(target, descriptor.key, descriptor); }} return function (Constructor, protoProps, staticProps){ if(protoProps) defineProperties(Constructor.prototype, protoProps); if(staticProps) defineProperties(Constructor, staticProps); return Constructor; };}();
function _classCallCheck(instance, Constructor){ if(!(instance instanceof Constructor)){ throw new TypeError("Cannot call a class as a function"); }}
!function ($){
var Tooltip=function (){
function Tooltip(element, options){
_classCallCheck(this, Tooltip);
this.$element=element;
this.options=$.extend({}, Tooltip.defaults, this.$element.data(), options);
this.isActive=false;
this.isClick=false;
this._init();
Foundation.registerPlugin(this, 'Tooltip');
}
_createClass(Tooltip, [{
key: '_init',
value: function _init(){
var elemId=this.$element.attr('aria-describedby')||Foundation.GetYoDigits(6, 'tooltip');
this.options.positionClass=this.options.positionClass||this._getPositionClass(this.$element);
this.options.tipText=this.options.tipText||this.$element.attr('title');
this.template=this.options.template ? $(this.options.template):this._buildTemplate(elemId);
if(this.options.allowHtml){
this.template.appendTo(document.body).html(this.options.tipText).hide();
}else{
this.template.appendTo(document.body).text(this.options.tipText).hide();
}
this.$element.attr({
'title': '',
'aria-describedby': elemId,
'data-yeti-box': elemId,
'data-toggle': elemId,
'data-resize': elemId
}).addClass(this.options.triggerClass);
this.usedPositions=[];
this.counter=4;
this.classChanged=false;
this._events();
}
}, {
key: '_getPositionClass',
value: function _getPositionClass(element){
if(!element){
return '';
}
var position=element[0].className.match(/\b(top|left|right)\b/g);
position=position ? position[0]:'';
return position;
}}, {
key: '_buildTemplate',
value: function _buildTemplate(id){
var templateClasses=(this.options.tooltipClass + ' ' + this.options.positionClass + ' ' + this.options.templateClasses).trim();
var $template=$('<div></div>').addClass(templateClasses).attr({
'role': 'tooltip',
'aria-hidden': true,
'data-is-active': false,
'data-is-focus': false,
'id': id
});
return $template;
}
}, {
key: '_reposition',
value: function _reposition(position){
this.usedPositions.push(position ? position:'bottom');
if(!position&&this.usedPositions.indexOf('top') < 0){
this.template.addClass('top');
}else if(position==='top'&&this.usedPositions.indexOf('bottom') < 0){
this.template.removeClass(position);
}else if(position==='left'&&this.usedPositions.indexOf('right') < 0){
this.template.removeClass(position).addClass('right');
}else if(position==='right'&&this.usedPositions.indexOf('left') < 0){
this.template.removeClass(position).addClass('left');
}
else if(!position&&this.usedPositions.indexOf('top') > -1&&this.usedPositions.indexOf('left') < 0){
this.template.addClass('left');
}else if(position==='top'&&this.usedPositions.indexOf('bottom') > -1&&this.usedPositions.indexOf('left') < 0){
this.template.removeClass(position).addClass('left');
}else if(position==='left'&&this.usedPositions.indexOf('right') > -1&&this.usedPositions.indexOf('bottom') < 0){
this.template.removeClass(position);
}else if(position==='right'&&this.usedPositions.indexOf('left') > -1&&this.usedPositions.indexOf('bottom') < 0){
this.template.removeClass(position);
}else{
this.template.removeClass(position);
}
this.classChanged=true;
this.counter--;
}
}, {
key: '_setPosition',
value: function _setPosition(){
var position=this._getPositionClass(this.template),
$tipDims=Foundation.Box.GetDimensions(this.template),
$anchorDims=Foundation.Box.GetDimensions(this.$element),
direction=position==='left' ? 'left':position==='right' ? 'left':'top',
param=direction==='top' ? 'height':'width',
offset=param==='height' ? this.options.vOffset:this.options.hOffset,
_this=this;
if($tipDims.width >=$tipDims.windowDims.width||!this.counter&&!Foundation.Box.ImNotTouchingYou(this.template)){
this.template.offset(Foundation.Box.GetOffsets(this.template, this.$element, 'center bottom', this.options.vOffset, this.options.hOffset, true)).css({
'width': $anchorDims.windowDims.width - this.options.hOffset * 2,
'height': 'auto'
});
return false;
}
this.template.offset(Foundation.Box.GetOffsets(this.template, this.$element, 'center ' + (position||'bottom'), this.options.vOffset, this.options.hOffset));
while (!Foundation.Box.ImNotTouchingYou(this.template)&&this.counter){
this._reposition(position);
this._setPosition();
}}
}, {
key: 'show',
value: function show(){
if(this.options.showOn!=='all'&&!Foundation.MediaQuery.is(this.options.showOn)){
return false;
}
var _this=this;
this.template.css('visibility', 'hidden').show();
this._setPosition();
this.$element.trigger('closeme.zf.tooltip', this.template.attr('id'));
this.template.attr({
'data-is-active': true,
'aria-hidden': false
});
_this.isActive=true;
this.template.stop().hide().css('visibility', '').fadeIn(this.options.fadeInDuration, function (){
});
this.$element.trigger('show.zf.tooltip');
}
}, {
key: 'hide',
value: function hide(){
var _this=this;
this.template.stop().attr({
'aria-hidden': true,
'data-is-active': false
}).fadeOut(this.options.fadeOutDuration, function (){
_this.isActive=false;
_this.isClick=false;
if(_this.classChanged){
_this.template.removeClass(_this._getPositionClass(_this.template)).addClass(_this.options.positionClass);
_this.usedPositions=[];
_this.counter=4;
_this.classChanged=false;
}});
this.$element.trigger('hide.zf.tooltip');
}
}, {
key: '_events',
value: function _events(){
var _this=this;
var $template=this.template;
var isFocus=false;
if(!this.options.disableHover){
this.$element.on('mouseenter.zf.tooltip', function (e){
if(!_this.isActive){
_this.timeout=setTimeout(function (){
_this.show();
}, _this.options.hoverDelay);
}}).on('mouseleave.zf.tooltip', function (e){
clearTimeout(_this.timeout);
if(!isFocus||_this.isClick&&!_this.options.clickOpen){
_this.hide();
}});
}
if(this.options.clickOpen){
this.$element.on('mousedown.zf.tooltip', function (e){
e.stopImmediatePropagation();
if(_this.isClick){
}else{
_this.isClick=true;
if((_this.options.disableHover||!_this.$element.attr('tabindex'))&&!_this.isActive){
_this.show();
}}
});
}else{
this.$element.on('mousedown.zf.tooltip', function (e){
e.stopImmediatePropagation();
_this.isClick=true;
});
}
if(!this.options.disableForTouch){
this.$element.on('tap.zf.tooltip touchend.zf.tooltip', function (e){
_this.isActive ? _this.hide():_this.show();
});
}
this.$element.on({
'close.zf.trigger': this.hide.bind(this)
});
this.$element.on('focus.zf.tooltip', function (e){
isFocus=true;
if(_this.isClick){
if(!_this.options.clickOpen){
isFocus=false;
}
return false;
}else{
_this.show();
}}).on('focusout.zf.tooltip', function (e){
isFocus=false;
_this.isClick=false;
_this.hide();
}).on('resizeme.zf.trigger', function (){
if(_this.isActive){
_this._setPosition();
}});
}
}, {
key: 'toggle',
value: function toggle(){
if(this.isActive){
this.hide();
}else{
this.show();
}}
}, {
key: 'destroy',
value: function destroy(){
this.$element.attr('title', this.template.text()).off('.zf.trigger .zf.tooltip').removeClass('has-tip top right left').removeAttr('aria-describedby aria-haspopup data-disable-hover data-resize data-toggle data-tooltip data-yeti-box');
this.template.remove();
Foundation.unregisterPlugin(this);
}}]);
return Tooltip;
}();
Tooltip.defaults={
disableForTouch: false,
hoverDelay: 200,
fadeInDuration: 150,
fadeOutDuration: 150,
disableHover: false,
templateClasses: '',
tooltipClass: 'tooltip',
triggerClass: 'has-tip',
showOn: 'small',
template: '',
tipText: '',
touchCloseText: 'Tap to close.',
clickOpen: true,
positionClass: '',
vOffset: 10,
hOffset: 12,
allowHtml: false
};
Foundation.plugin(Tooltip, 'Tooltip');
}(jQuery);
;'use strict';
(function (){
if(!Date.now) Date.now=function (){
return new Date().getTime();
};
var vendors=['webkit', 'moz'];
for (var i=0; i < vendors.length&&!window.requestAnimationFrame; ++i){
var vp=vendors[i];
window.requestAnimationFrame=window[vp + 'RequestAnimationFrame'];
window.cancelAnimationFrame=window[vp + 'CancelAnimationFrame']||window[vp + 'CancelRequestAnimationFrame'];
}
if(/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent)||!window.requestAnimationFrame||!window.cancelAnimationFrame){
var lastTime=0;
window.requestAnimationFrame=function (callback){
var now=Date.now();
var nextTime=Math.max(lastTime + 16, now);
return setTimeout(function (){
callback(lastTime=nextTime);
}, nextTime - now);
};
window.cancelAnimationFrame=clearTimeout;
}})();
var initClasses=['mui-enter', 'mui-leave'];
var activeClasses=['mui-enter-active', 'mui-leave-active'];
var endEvent=function (){
var transitions={
'transition': 'transitionend',
'WebkitTransition': 'webkitTransitionEnd',
'MozTransition': 'transitionend',
'OTransition': 'otransitionend'
};
var elem=window.document.createElement('div');
for (var t in transitions){
if(typeof elem.style[t]!=='undefined'){
return transitions[t];
}}
return null;
}();
function animate(isIn, element, animation, cb){
element=$(element).eq(0);
if(!element.length) return;
if(endEvent===null){
isIn ? element.show():element.hide();
cb();
return;
}
var initClass=isIn ? initClasses[0]:initClasses[1];
var activeClass=isIn ? activeClasses[0]:activeClasses[1];
reset();
element.addClass(animation);
element.css('transition', 'none');
requestAnimationFrame(function (){
element.addClass(initClass);
if(isIn) element.show();
});
requestAnimationFrame(function (){
element[0].offsetWidth;
element.css('transition', '');
element.addClass(activeClass);
});
element.one('transitionend', finish);
function finish(){
if(!isIn) element.hide();
reset();
if(cb) cb.apply(element);
}
function reset(){
element[0].style.transitionDuration=0;
element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
}}
var MotionUI={
animateIn: function (element, animation, cb){
animate(true, element, animation, cb);
},
animateOut: function (element, animation, cb){
animate(false, element, animation, cb);
}};
;"use strict";
!function (e, t){
"function"==typeof define&&define.amd ? define(t):"object"==typeof exports ? module.exports=t():e.ScrollMagic=t();
}(this, function (){
"use strict";
var e=function (){};e.version="2.0.5", window.addEventListener("mousewheel", function (){});var t="data-scrollmagic-pin-spacer";e.Controller=function (r){
var o,
s,
a="ScrollMagic.Controller",
l="FORWARD",
c="REVERSE",
u="PAUSED",
f=n.defaults,
d=this,
h=i.extend({}, f, r),
g=[],
p = !1,
v=0,
m=u,
w = !0,
y=0,
S = !0,
b=function (){
for (var e in h){
f.hasOwnProperty(e)||delete h[e];
}if(h.container=i.get.elements(h.container)[0], !h.container) throw a + " init failed.";w=h.container===window||h.container===document.body||!document.body.contains(h.container), w&&(h.container=window), y=z(), h.container.addEventListener("resize", T), h.container.addEventListener("scroll", T), h.refreshInterval=parseInt(h.refreshInterval)||f.refreshInterval, E();
},
E=function (){
h.refreshInterval > 0&&(s=window.setTimeout(A, h.refreshInterval));
},
x=function (){
return h.vertical ? i.get.scrollTop(h.container):i.get.scrollLeft(h.container);
},
z=function (){
return h.vertical ? i.get.height(h.container):i.get.width(h.container);
},
C=this._setScrollPos=function (e){
h.vertical ? w ? window.scrollTo(i.get.scrollLeft(), e):h.container.scrollTop=e:w ? window.scrollTo(e, i.get.scrollTop()):h.container.scrollLeft=e;
},
F=function (){
if(S&&p){
var e=i.type.Array(p) ? p:g.slice(0);p = !1;var t=v;v=d.scrollPos();var n=v - t;0!==n&&(m=n > 0 ? l:c), m===c&&e.reverse(), e.forEach(function (e){
e.update(!0);
});
}},
L=function (){
o=i.rAF(F);
},
T=function (e){
"resize"==e.type&&(y=z(), m=u), p!==!0&&(p = !0, L());
},
A=function (){
if(!w&&y!=z()){
var e;try {
e=new Event("resize", { bubbles: !1, cancelable: !1 });
} catch (t){
e=document.createEvent("Event"), e.initEvent("resize", !1, !1);
}h.container.dispatchEvent(e);
}g.forEach(function (e){
e.refresh();
}), E();
};this._options=h;var O=function (e){
if(e.length <=1) return e;var t=e.slice(0);return t.sort(function (e, t){
return e.scrollOffset() > t.scrollOffset() ? 1:-1;
}), t;
};return this.addScene=function (t){
if(i.type.Array(t)) t.forEach(function (e){
d.addScene(e);
});else if(t instanceof e.Scene) if(t.controller()!==d) t.addTo(d);else if(g.indexOf(t) < 0){
g.push(t), g=O(g), t.on("shift.controller_sort", function (){
g=O(g);
});for (var n in h.globalSceneOptions){
t[n]&&t[n].call(t, h.globalSceneOptions[n]);
}}return d;
}, this.removeScene=function (e){
if(i.type.Array(e)) e.forEach(function (e){
d.removeScene(e);
});else {
var t=g.indexOf(e);t > -1&&(e.off("shift.controller_sort"), g.splice(t, 1), e.remove());
}return d;
}, this.updateScene=function (t, n){
return i.type.Array(t) ? t.forEach(function (e){
d.updateScene(e, n);
}):n ? t.update(!0):p!==!0&&t instanceof e.Scene&&(p=p||[], -1==p.indexOf(t)&&p.push(t), p=O(p), L()), d;
}, this.update=function (e){
return T({ type: "resize" }), e&&F(), d;
}, this.scrollTo=function (n, r){
if(i.type.Number(n)) C.call(h.container, n, r);else if(n instanceof e.Scene) n.controller()===d&&d.scrollTo(n.scrollOffset(), r);else if(i.type.Function(n)) C=n;else {
var o=i.get.elements(n)[0];if(o){
for (; o.parentNode.hasAttribute(t);){
o=o.parentNode;
}var s=h.vertical ? "top":"left",
a=i.get.offset(h.container),
l=i.get.offset(o);w||(a[s] -=d.scrollPos()), d.scrollTo(l[s] - a[s], r);
}}return d;
}, this.scrollPos=function (e){
return arguments.length ? (i.type.Function(e)&&(x=e), d):x.call(d);
}, this.info=function (e){
var t={ size: y, vertical: h.vertical, scrollPos: v, scrollDirection: m, container: h.container, isDocument: w };return arguments.length ? void 0!==t[e] ? t[e]:void 0:t;
}, this.loglevel=function (){
return d;
}, this.enabled=function (e){
return arguments.length ? (S!=e&&(S = !!e, d.updateScene(g, !0)), d):S;
}, this.destroy=function (e){
window.clearTimeout(s);for (var t=g.length; t--;){
g[t].destroy(e);
}return h.container.removeEventListener("resize", T), h.container.removeEventListener("scroll", T), i.cAF(o), null;
}, b(), d;
};var n={ defaults: { container: window, vertical: !0, globalSceneOptions: {}, loglevel: 2, refreshInterval: 100 }};e.Controller.addOption=function (e, t){
n.defaults[e]=t;
}, e.Controller.extend=function (t){
var n=this;e.Controller=function (){
return n.apply(this, arguments), this.$super=i.extend({}, this), t.apply(this, arguments)||this;
}, i.extend(e.Controller, n), e.Controller.prototype=n.prototype, e.Controller.prototype.constructor=e.Controller;
}, e.Scene=function (n){
var o,
s,
a="BEFORE",
l="DURING",
c="AFTER",
u=r.defaults,
f=this,
d=i.extend({}, u, n),
h=a,
g=0,
p={ start: 0, end: 0 },
v=0,
m = !0,
w=function (){
for (var e in d){
u.hasOwnProperty(e)||delete d[e];
}for (var t in u){
L(t);
}C();
},
y={};this.on=function (e, t){
return i.type.Function(t)&&(e=e.trim().split(" "), e.forEach(function (e){
var n=e.split("."),
r=n[0],
i=n[1];"*"!=r&&(y[r]||(y[r]=[]), y[r].push({ namespace: i||"", callback: t }));
})), f;
}, this.off=function (e, t){
return e ? (e=e.trim().split(" "), e.forEach(function (e){
var n=e.split("."),
r=n[0],
i=n[1]||"",
o="*"===r ? Object.keys(y):[r];o.forEach(function (e){
for (var n=y[e]||[], r=n.length; r--;){
var o=n[r];!o||i!==o.namespace&&"*"!==i||t&&t!=o.callback||n.splice(r, 1);
}n.length||delete y[e];
});
}), f):f;
}, this.trigger=function (t, n){
if(t){
var r=t.trim().split("."),
i=r[0],
o=r[1],
s=y[i];s&&s.forEach(function (t){
o&&o!==t.namespace||t.callback.call(f, new e.Event(i, t.namespace, f, n));
});
}return f;
}, f.on("change.internal", function (e){
"loglevel"!==e.what&&"tweenChanges"!==e.what&&("triggerElement"===e.what ? E():"reverse"===e.what&&f.update());
}).on("shift.internal", function (){
S(), f.update();
}), this.addTo=function (t){
return t instanceof e.Controller&&s!=t&&(s&&s.removeScene(f), s=t, C(), b(!0), E(!0), S(), s.info("container").addEventListener("resize", x), t.addScene(f), f.trigger("add", { controller: s }), f.update()), f;
}, this.enabled=function (e){
return arguments.length ? (m!=e&&(m = !!e, f.update(!0)), f):m;
}, this.remove=function (){
if(s){
s.info("container").removeEventListener("resize", x);var e=s;s=void 0, e.removeScene(f), f.trigger("remove");
}return f;
}, this.destroy=function (e){
return f.trigger("destroy", { reset: e }), f.remove(), f.off("*.*"), null;
}, this.update=function (e){
if(s) if(e){
if(s.enabled()&&m){
var t,
n=s.info("scrollPos");t=d.duration > 0 ? (n - p.start) / (p.end - p.start):n >=p.start ? 1:0, f.trigger("update", { startPos: p.start, endPos: p.end, scrollPos: n }), f.progress(t);
} else T&&h===l&&O(!0);
} else s.updateScene(f, !1);return f;
}, this.refresh=function (){
return b(), E(), f;
}, this.progress=function (e){
if(arguments.length){
var t = !1,
n=h,
r=s ? s.info("scrollDirection"):"PAUSED",
i=d.reverse||e >=g;if(0===d.duration ? (t=g!=e, g=1 > e&&i ? 0:1, h=0===g ? a:l):0 > e&&h!==a&&i ? (g=0, h=a, t = !0):e >=0&&1 > e&&i ? (g=e, h=l, t = !0):e >=1&&h!==c ? (g=1, h=c, t = !0):h!==l||i || O(), t){
var o={ progress: g, state: h, scrollDirection: r },
u=h!=n,
p=function (e){
f.trigger(e, o);
};u&&n!==l&&(p("enter"), p(n===a ? "start":"end")), p("progress"), u&&h!==l&&(p(h===a ? "start":"end"), p("leave"));
}return f;
}return g;
};var S=function (){
p={ start: v + d.offset }, s&&d.triggerElement&&(p.start -=s.info("size") * d.triggerHook), p.end=p.start + d.duration;
},
b=function (e){
if(o){
var t="duration";F(t, o.call(f))&&!e&&(f.trigger("change", { what: t, newval: d[t] }), f.trigger("shift", { reason: t }));
}},
E=function (e){
var n=0,
r=d.triggerElement;if(s&&r){
for (var o=s.info(), a=i.get.offset(o.container), l=o.vertical ? "top":"left"; r.parentNode.hasAttribute(t);){
r=r.parentNode;
}var c=i.get.offset(r);o.isDocument||(a[l] -=s.scrollPos()), n=c[l] - a[l];
}var u=n!=v;v=n, u&&!e&&f.trigger("shift", { reason: "triggerElementPosition" });
},
x=function (){
d.triggerHook > 0&&f.trigger("shift", { reason: "containerResize" });
},
z=i.extend(r.validate, { duration: function (e){
if(i.type.String(e)&&e.match(/^(\.|\d)*\d+%$/)){
var t=parseFloat(e) / 100;e=function (){
return s ? s.info("size") * t:0;
};}if(i.type.Function(e)){
o=e;try {
e=parseFloat(o());
} catch (n){
e=-1;
}}if(e=parseFloat(e), !i.type.Number(e)||0 > e) throw o ? (o=void 0, 0):0;return e;
}}),
C=function (e){
e=arguments.length ? [e]:Object.keys(z), e.forEach(function (e){
var t;if(z[e]) try {
t=z[e](d[e]);
} catch (n){
t=u[e];
} finally {
d[e]=t;
}});
},
F=function (e, t){
var n = !1,
r=d[e];return d[e]!=t&&(d[e]=t, C(e), n=r!=d[e]), n;
},
L=function (e){
f[e]||(f[e]=function (t){
return arguments.length ? ("duration"===e&&(o=void 0), F(e, t)&&(f.trigger("change", { what: e, newval: d[e] }), r.shifts.indexOf(e) > -1&&f.trigger("shift", { reason: e })), f):d[e];
});
};this.controller=function (){
return s;
}, this.state=function (){
return h;
}, this.scrollOffset=function (){
return p.start;
}, this.triggerPosition=function (){
var e=d.offset;return s&&(e +=d.triggerElement ? v:s.info("size") * f.triggerHook()), e;
};var T, A;f.on("shift.internal", function (e){
var t="duration"===e.reason;(h===c&&t||h===l&&0===d.duration)&&O(), t&&_();
}).on("progress.internal", function (){
O();
}).on("add.internal", function (){
_();
}).on("destroy.internal", function (e){
f.removePin(e.reset);
});var O=function (e){
if(T&&s){
var t=s.info(),
n=A.spacer.firstChild;if(e||h!==l){
var r={ position: A.inFlow ? "relative":"absolute", top: 0, left: 0 },
o=i.css(n, "position")!=r.position;A.pushFollowers ? d.duration > 0&&(h===c&&0===parseFloat(i.css(A.spacer, "padding-top")) ? o = !0:h===a&&0===parseFloat(i.css(A.spacer, "padding-bottom"))&&(o = !0)):r[t.vertical ? "top":"left"]=d.duration * g, i.css(n, r), o&&_();
}else{
"fixed"!=i.css(n, "position")&&(i.css(n, { position: "fixed" }), _());var u=i.get.offset(A.spacer, !0),
f=d.reverse||0===d.duration ? t.scrollPos - p.start:Math.round(g * d.duration * 10) / 10;u[t.vertical ? "top":"left"] +=f, i.css(A.spacer.firstChild, { top: u.top, left: u.left });
}}
},
_=function (){
if(T&&s && A.inFlow){
var e=h===l,
t=s.info("vertical"),
n=A.spacer.firstChild,
r=i.isMarginCollapseType(i.css(A.spacer, "display")),
o={};A.relSize.width||A.relSize.autoFullWidth ? e ? i.css(T, { width: i.get.width(A.spacer) }):i.css(T, { width: "100%" }):(o["min-width"]=i.get.width(t ? T:n, !0, !0), o.width=e ? o["min-width"]:"auto"), A.relSize.height ? e ? i.css(T, { height: i.get.height(A.spacer) - (A.pushFollowers ? d.duration:0) }):i.css(T, { height: "100%" }):(o["min-height"]=i.get.height(t ? n:T, !0, !r), o.height=e ? o["min-height"]:"auto"), A.pushFollowers&&(o["padding" + (t ? "Top":"Left")]=d.duration * g, o["padding" + (t ? "Bottom":"Right")]=d.duration * (1 - g)), i.css(A.spacer, o);
}},
N=function (){
s&&T && h===l&&!s.info("isDocument")&&O();
},
P=function (){
s&&T && h===l&&((A.relSize.width||A.relSize.autoFullWidth)&&i.get.width(window)!=i.get.width(A.spacer.parentNode)||A.relSize.height&&i.get.height(window)!=i.get.height(A.spacer.parentNode))&&_();
},
D=function (e){
s&&T && h===l&&!s.info("isDocument")&&(e.preventDefault(), s._setScrollPos(s.info("scrollPos") - ((e.wheelDelta||e[s.info("vertical") ? "wheelDeltaY":"wheelDeltaX"]) / 3||30 * -e.detail)));
};this.setPin=function (e, n){
var r={ pushFollowers: !0, spacerClass: "scrollmagic-pin-spacer" };if(n=i.extend({}, r, n), e=i.get.elements(e)[0], !e) return f;if("fixed"===i.css(e, "position")) return f;if(T){
if(T===e) return f;f.removePin();
}T=e;var o=T.parentNode.style.display,
s=["top", "left", "bottom", "right", "margin", "marginLeft", "marginRight", "marginTop", "marginBottom"];T.parentNode.style.display="none";var a="absolute"!=i.css(T, "position"),
l=i.css(T, s.concat(["display"])),
c=i.css(T, ["width", "height"]);T.parentNode.style.display=o, !a&&n.pushFollowers&&(n.pushFollowers = !1);var u=T.parentNode.insertBefore(document.createElement("div"), T),
d=i.extend(l, { position: a ? "relative":"absolute", boxSizing: "content-box", mozBoxSizing: "content-box", webkitBoxSizing: "content-box" });if(a||i.extend(d, i.css(T, ["width", "height"])), i.css(u, d), u.setAttribute(t, ""), i.addClass(u, n.spacerClass), A={ spacer: u, relSize: { width: "%"===c.width.slice(-1), height: "%"===c.height.slice(-1), autoFullWidth: "auto"===c.width&&a && i.isMarginCollapseType(l.display) }, pushFollowers: n.pushFollowers, inFlow: a }, !T.___origStyle){
T.___origStyle={};var h=T.style,
g=s.concat(["width", "height", "position", "boxSizing", "mozBoxSizing", "webkitBoxSizing"]);g.forEach(function (e){
T.___origStyle[e]=h[e]||"";
});
}return A.relSize.width&&i.css(u, { width: c.width }), A.relSize.height&&i.css(u, { height: c.height }), u.appendChild(T), i.css(T, { position: a ? "relative":"absolute", margin: "auto", top: "auto", left: "auto", bottom: "auto", right: "auto" }), (A.relSize.width||A.relSize.autoFullWidth)&&i.css(T, { boxSizing: "border-box", mozBoxSizing: "border-box", webkitBoxSizing: "border-box" }), window.addEventListener("scroll", N), window.addEventListener("resize", N), window.addEventListener("resize", P), T.addEventListener("mousewheel", D), T.addEventListener("DOMMouseScroll", D), O(), f;
}, this.removePin=function (e){
if(T){
if(h===l&&O(!0), e||!s){
var n=A.spacer.firstChild;if(n.hasAttribute(t)){
var r=A.spacer.style,
o=["margin", "marginLeft", "marginRight", "marginTop", "marginBottom"];margins={}, o.forEach(function (e){
margins[e]=r[e]||"";
}), i.css(n, margins);
}A.spacer.parentNode.insertBefore(n, A.spacer), A.spacer.parentNode.removeChild(A.spacer), T.parentNode.hasAttribute(t)||(i.css(T, T.___origStyle), delete T.___origStyle);
}window.removeEventListener("scroll", N), window.removeEventListener("resize", N), window.removeEventListener("resize", P), T.removeEventListener("mousewheel", D), T.removeEventListener("DOMMouseScroll", D), T=void 0;
}return f;
};var R,
k=[];return f.on("destroy.internal", function (e){
f.removeClassToggle(e.reset);
}), this.setClassToggle=function (e, t){
var n=i.get.elements(e);return 0!==n.length&&i.type.String(t) ? (k.length > 0&&f.removeClassToggle(), R=t, k=n, f.on("enter.internal_class leave.internal_class", function (e){
var t="enter"===e.type ? i.addClass:i.removeClass;k.forEach(function (e){
t(e, R);
});
}), f):f;
}, this.removeClassToggle=function (e){
return e&&k.forEach(function (e){
i.removeClass(e, R);
}), f.off("start.internal_class end.internal_class"), R=void 0, k=[], f;
}, w(), f;
};var r={ defaults: { duration: 0, offset: 0, triggerElement: void 0, triggerHook: .5, reverse: !0, loglevel: 2 }, validate: { offset: function (e){
if(e=parseFloat(e), !i.type.Number(e)) throw 0;return e;
}, triggerElement: function (e){
if(e=e||void 0){
var t=i.get.elements(e)[0];if(!t) throw 0;e=t;
}return e;
}, triggerHook: function (e){
var t={ onCenter: .5, onEnter: 1, onLeave: 0 };if(i.type.Number(e)) e=Math.max(0, Math.min(parseFloat(e), 1));else {
if(!(e in t)) throw 0;e=t[e];
}return e;
}, reverse: function (e){
return !!e;
}}, shifts: ["duration", "offset", "triggerHook"] };e.Scene.addOption=function (e, t, n, i){
e in r.defaults||(r.defaults[e]=t, r.validate[e]=n, i&&r.shifts.push(e));
}, e.Scene.extend=function (t){
var n=this;e.Scene=function (){
return n.apply(this, arguments), this.$super=i.extend({}, this), t.apply(this, arguments)||this;
}, i.extend(e.Scene, n), e.Scene.prototype=n.prototype, e.Scene.prototype.constructor=e.Scene;
}, e.Event=function (e, t, n, r){
r=r||{};for (var i in r){
this[i]=r[i];
}return this.type=e, this.target=this.currentTarget=n, this.namespace=t||"", this.timeStamp=this.timestamp=Date.now(), this;
};var i=e._util=function (e){
var t,
n={},
r=function (e){
return parseFloat(e)||0;
},
i=function (t){
return t.currentStyle ? t.currentStyle:e.getComputedStyle(t);
},
o=function (t, n, o, s){
if(n=n===document ? e:n, n===e) s = !1;else if(!f.DomElement(n)) return 0;t=t.charAt(0).toUpperCase() + t.substr(1).toLowerCase();var a=(o ? n["offset" + t]||n["outer" + t]:n["client" + t]||n["inner" + t])||0;if(o&&s){
var l=i(n);a +="Height"===t ? r(l.marginTop) + r(l.marginBottom):r(l.marginLeft) + r(l.marginRight);
}return a;
},
s=function (e){
return e.replace(/^[^a-z]+([a-z])/g, "$1").replace(/-([a-z])/g, function (e){
return e[1].toUpperCase();
});
};n.extend=function (e){
for (e=e||{}, t=1; t < arguments.length; t++){
if(arguments[t]) for (var n in arguments[t]){
arguments[t].hasOwnProperty(n)&&(e[n]=arguments[t][n]);
}}return e;
}, n.isMarginCollapseType=function (e){
return ["block", "flex", "list-item", "table", "-webkit-box"].indexOf(e) > -1;
};var a=0,
l=["ms", "moz", "webkit", "o"],
c=e.requestAnimationFrame,
u=e.cancelAnimationFrame;for (t=0; !c&&t < l.length; ++t){
c=e[l[t] + "RequestAnimationFrame"], u=e[l[t] + "CancelAnimationFrame"]||e[l[t] + "CancelRequestAnimationFrame"];
}c||(c=function (t){
var n=new Date().getTime(),
r=Math.max(0, 16 - (n - a)),
i=e.setTimeout(function (){
t(n + r);
}, r);return a=n + r, i;
}), u||(u=function (t){
e.clearTimeout(t);
}), n.rAF=c.bind(e), n.cAF=u.bind(e);var f=n.type=function (e){
return Object.prototype.toString.call(e).replace(/^\[object (.+)\]$/, "$1").toLowerCase();
};f.String=function (e){
return "string"===f(e);
}, f.Function=function (e){
return "function"===f(e);
}, f.Array=function (e){
return Array.isArray(e);
}, f.Number=function (e){
return !f.Array(e)&&e - parseFloat(e) + 1 >=0;
}, f.DomElement=function (e){
return "object"==typeof HTMLElement ? e instanceof HTMLElement:e&&"object"==typeof e&&null!==e&&1===e.nodeType&&"string"==typeof e.nodeName;
};var d=n.get={};return d.elements=function (t){
var n=[];if(f.String(t)) try {
t=document.querySelectorAll(t);
} catch (r){
return n;
}if("nodelist"===f(t)||f.Array(t)) for (var i=0, o=n.length=t.length; o > i; i++){
var s=t[i];n[i]=f.DomElement(s) ? s:d.elements(s);
} else (f.DomElement(t)||t===document||t===e)&&(n=[t]);return n;
}, d.scrollTop=function (t){
return t&&"number"==typeof t.scrollTop ? t.scrollTop:e.pageYOffset||0;
}, d.scrollLeft=function (t){
return t&&"number"==typeof t.scrollLeft ? t.scrollLeft:e.pageXOffset||0;
}, d.width=function (e, t, n){
return o("width", e, t, n);
}, d.height=function (e, t, n){
return o("height", e, t, n);
}, d.offset=function (e, t){
var n={ top: 0, left: 0 };if(e&&e.getBoundingClientRect){
var r=e.getBoundingClientRect();n.top=r.top, n.left=r.left, t||(n.top +=d.scrollTop(), n.left +=d.scrollLeft());
}return n;
}, n.addClass=function (e, t){
t&&(e.classList ? e.classList.add(t):e.className +=" " + t);
}, n.removeClass=function (e, t){
t&&(e.classList ? e.classList.remove(t):e.className=e.className.replace(RegExp("(^|\\b)" + t.split(" ").join("|") + "(\\b|$)", "gi"), " "));
}, n.css=function (e, t){
if(f.String(t)) return i(e)[s(t)];if(f.Array(t)){
var n={},
r=i(e);return t.forEach(function (e){
n[e]=r[s(e)];
}), n;
}for (var o in t){
var a=t[o];a==parseFloat(a)&&(a +="px"), e.style[s(o)]=a;
}}, n;
}(window||{});return e;
});
;"use strict";
var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global ? global:this||window;(_gsScope._gsQueue||(_gsScope._gsQueue=[])).push(function (){
"use strict";
_gsScope._gsDefine("TweenMax", ["core.Animation", "core.SimpleTimeline", "TweenLite"], function (a, b, c){
var d=function (a){
var b,
c=[],
d=a.length;for (b=0; b!==d; c.push(a[b++])){}return c;
},
e=function (a, b, c){
var d,
e,
f=a.cycle;for (d in f){
e=f[d], a[d]="function"==typeof e ? e.call(b[c], c):e[c % e.length];
}delete a.cycle;
},
f=function (a, b, d){
c.call(this, a, b, d), this._cycle=0, this._yoyo=this.vars.yoyo===!0, this._repeat=this.vars.repeat||0, this._repeatDelay=this.vars.repeatDelay||0, this._dirty = !0, this.render=f.prototype.render;
},
g=1e-10,
h=c._internals,
i=h.isSelector,
j=h.isArray,
k=f.prototype=c.to({}, .1, {}),
l=[];f.version="1.18.5", k.constructor=f, k.kill()._gc = !1, f.killTweensOf=f.killDelayedCallsTo=c.killTweensOf, f.getTweensOf=c.getTweensOf, f.lagSmoothing=c.lagSmoothing, f.ticker=c.ticker, f.render=c.render, k.invalidate=function (){
return this._yoyo=this.vars.yoyo===!0, this._repeat=this.vars.repeat||0, this._repeatDelay=this.vars.repeatDelay||0, this._uncache(!0), c.prototype.invalidate.call(this);
}, k.updateTo=function (a, b){
var d,
e=this.ratio,
f=this.vars.immediateRender||a.immediateRender;b&&this._startTime < this._timeline._time&&(this._startTime=this._timeline._time, this._uncache(!1), this._gc ? this._enabled(!0, !1):this._timeline.insert(this, this._startTime - this._delay));for (d in a){
this.vars[d]=a[d];
}if(this._initted||f) if(b) this._initted = !1, f&&this.render(0, !0, !0);else if(this._gc&&this._enabled(!0, !1), this._notifyPluginsOfEnabled&&this._firstPT&&c._onPluginEvent("_onDisable", this), this._time / this._duration > .998){
var g=this._totalTime;this.render(0, !0, !1), this._initted = !1, this.render(g, !0, !1);
}else if(this._initted = !1, this._init(), this._time > 0||f) for (var h, i=1 / (1 - e), j=this._firstPT; j;){
h=j.s + j.c, j.c *=i, j.s=h - j.c, j=j._next;
}return this;
}, k.render=function (a, b, c){
this._initted||0===this._duration&&this.vars.repeat&&this.invalidate();var d,
e,
f,
i,
j,
k,
l,
m,
n=this._dirty ? this.totalDuration():this._totalDuration,
o=this._time,
p=this._totalTime,
q=this._cycle,
r=this._duration,
s=this._rawPrevTime;if(a >=n - 1e-7 ? (this._totalTime=n, this._cycle=this._repeat, this._yoyo&&0!==(1 & this._cycle) ? (this._time=0, this.ratio=this._ease._calcEnd ? this._ease.getRatio(0):0):(this._time=r, this.ratio=this._ease._calcEnd ? this._ease.getRatio(1):1), this._reversed||(d = !0, e="onComplete", c=c||this._timeline.autoRemoveChildren), 0===r&&(this._initted||!this.vars.lazy||c)&&(this._startTime===this._timeline._duration&&(a=0), (0 > s||0 >=a&&a >=-1e-7||s===g&&"isPause"!==this.data)&&s!==a&&(c = !0, s > g&&(e="onReverseComplete")), this._rawPrevTime=m = !b||a || s===a ? a:g)):1e-7 > a ? (this._totalTime=this._time=this._cycle=0, this.ratio=this._ease._calcEnd ? this._ease.getRatio(0):0, (0!==p||0===r&&s > 0)&&(e="onReverseComplete", d=this._reversed), 0 > a&&(this._active = !1, 0===r&&(this._initted||!this.vars.lazy||c)&&(s >=0&&(c = !0), this._rawPrevTime=m = !b||a || s===a ? a:g)), this._initted||(c = !0)):(this._totalTime=this._time=a, 0!==this._repeat&&(i=r + this._repeatDelay, this._cycle=this._totalTime / i >> 0, 0!==this._cycle&&this._cycle===this._totalTime / i&&a >=p&&this._cycle--, this._time=this._totalTime - this._cycle * i, this._yoyo&&0!==(1 & this._cycle)&&(this._time=r - this._time), this._time > r ? this._time=r:this._time < 0&&(this._time=0)), this._easeType ? (j=this._time / r, k=this._easeType, l=this._easePower, (1===k||3===k&&j >=.5)&&(j=1 - j), 3===k&&(j *=2), 1===l ? j *=j:2===l ? j *=j * j:3===l ? j *=j * j * j:4===l&&(j *=j * j * j * j), 1===k ? this.ratio=1 - j:2===k ? this.ratio=j:this._time / r < .5 ? this.ratio=j / 2:this.ratio=1 - j / 2):this.ratio=this._ease.getRatio(this._time / r)), o===this._time&&!c&&q===this._cycle) return void (p!==this._totalTime&&this._onUpdate&&(b||this._callback("onUpdate")));if(!this._initted){
if(this._init(), !this._initted||this._gc) return;if(!c&&this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration)) return this._time=o, this._totalTime=p, this._rawPrevTime=s, this._cycle=q, h.lazyTweens.push(this), void (this._lazy=[a, b]);this._time&&!d ? this.ratio=this._ease.getRatio(this._time / r):d&&this._ease._calcEnd&&(this.ratio=this._ease.getRatio(0===this._time ? 0:1));
}for (this._lazy!==!1&&(this._lazy = !1), this._active||!this._paused&&this._time!==o&&a >=0&&(this._active = !0), 0===p&&(2===this._initted&&a > 0&&this._init(), this._startAt&&(a >=0 ? this._startAt.render(a, b, c):e||(e="_dummyGS")), this.vars.onStart&&(0!==this._totalTime||0===r)&&(b||this._callback("onStart"))), f=this._firstPT; f;){
f.f ? f.t[f.p](f.c * this.ratio + f.s):f.t[f.p]=f.c * this.ratio + f.s, f=f._next;
}this._onUpdate&&(0 > a&&this._startAt&&this._startTime&&this._startAt.render(a, b, c), b||(this._totalTime!==p||e)&&this._callback("onUpdate")), this._cycle!==q&&(b||this._gc||this.vars.onRepeat&&this._callback("onRepeat")), e&&(!this._gc||c)&&(0 > a&&this._startAt&&!this._onUpdate&&this._startTime&&this._startAt.render(a, b, c), d&&(this._timeline.autoRemoveChildren&&this._enabled(!1, !1), this._active = !1), !b&&this.vars[e]&&this._callback(e), 0===r&&this._rawPrevTime===g&&m!==g&&(this._rawPrevTime=0));
}, f.to=function (a, b, c){
return new f(a, b, c);
}, f.from=function (a, b, c){
return c.runBackwards = !0, c.immediateRender=0!=c.immediateRender, new f(a, b, c);
}, f.fromTo=function (a, b, c, d){
return d.startAt=c, d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender, new f(a, b, d);
}, f.staggerTo=f.allTo=function (a, b, g, h, k, m, n){
h=h||0;var o,
p,
q,
r,
s=0,
t=[],
u=function (){
g.onComplete&&g.onComplete.apply(g.onCompleteScope||this, arguments), k.apply(n||g.callbackScope||this, m||l);
},
v=g.cycle,
w=g.startAt&&g.startAt.cycle;for (j(a)||("string"==typeof a&&(a=c.selector(a)||a), i(a)&&(a=d(a))), a=a||[], 0 > h&&(a=d(a), a.reverse(), h *=-1), o=a.length - 1, q=0; o >=q; q++){
p={};for (r in g){
p[r]=g[r];
}if(v&&(e(p, a, q), null!=p.duration&&(b=p.duration, delete p.duration)), w){
w=p.startAt={};for (r in g.startAt){
w[r]=g.startAt[r];
}e(p.startAt, a, q);
}p.delay=s + (p.delay||0), q===o&&k && (p.onComplete=u), t[q]=new f(a[q], b, p), s +=h;
}return t;
}, f.staggerFrom=f.allFrom=function (a, b, c, d, e, g, h){
return c.runBackwards = !0, c.immediateRender=0!=c.immediateRender, f.staggerTo(a, b, c, d, e, g, h);
}, f.staggerFromTo=f.allFromTo=function (a, b, c, d, e, g, h, i){
return d.startAt=c, d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender, f.staggerTo(a, b, d, e, g, h, i);
}, f.delayedCall=function (a, b, c, d, e){
return new f(b, 0, { delay: a, onComplete: b, onCompleteParams: c, callbackScope: d, onReverseComplete: b, onReverseCompleteParams: c, immediateRender: !1, useFrames: e, overwrite: 0 });
}, f.set=function (a, b){
return new f(a, 0, b);
}, f.isTweening=function (a){
return c.getTweensOf(a, !0).length > 0;
};var m=function (a, b){
for (var d=[], e=0, f=a._first; f;){
f instanceof c ? d[e++]=f:(b&&(d[e++]=f), d=d.concat(m(f, b)), e=d.length), f=f._next;
}return d;
},
n=f.getAllTweens=function (b){
return m(a._rootTimeline, b).concat(m(a._rootFramesTimeline, b));
};f.killAll=function (a, c, d, e){
null==c&&(c = !0), null==d&&(d = !0);var f,
g,
h,
i=n(0!=e),
j=i.length,
k=c&&d && e;for (h=0; j > h; h++){
g=i[h], (k||g instanceof b||(f=g.target===g.vars.onComplete)&&d||c&&!f)&&(a ? g.totalTime(g._reversed ? 0:g.totalDuration()):g._enabled(!1, !1));
}}, f.killChildTweensOf=function (a, b){
if(null!=a){
var e,
g,
k,
l,
m,
n=h.tweenLookup;if("string"==typeof a&&(a=c.selector(a)||a), i(a)&&(a=d(a)), j(a)) for (l=a.length; --l > -1;){
f.killChildTweensOf(a[l], b);
}else{
e=[];for (k in n){
for (g=n[k].target.parentNode; g;){
g===a&&(e=e.concat(n[k].tweens)), g=g.parentNode;
}}for (m=e.length, l=0; m > l; l++){
b&&e[l].totalTime(e[l].totalDuration()), e[l]._enabled(!1, !1);
}}
}};var o=function (a, c, d, e){
c=c!==!1, d=d!==!1, e=e!==!1;for (var f, g, h=n(e), i=c&&d && e, j=h.length; --j > -1;){
g=h[j], (i||g instanceof b||(f=g.target===g.vars.onComplete)&&d||c&&!f)&&g.paused(a);
}};return f.pauseAll=function (a, b, c){
o(!0, a, b, c);
}, f.resumeAll=function (a, b, c){
o(!1, a, b, c);
}, f.globalTimeScale=function (b){
var d=a._rootTimeline,
e=c.ticker.time;return arguments.length ? (b=b||g, d._startTime=e - (e - d._startTime) * d._timeScale / b, d=a._rootFramesTimeline, e=c.ticker.frame, d._startTime=e - (e - d._startTime) * d._timeScale / b, d._timeScale=a._rootTimeline._timeScale=b, b):d._timeScale;
}, k.progress=function (a, b){
return arguments.length ? this.totalTime(this.duration() * (this._yoyo&&0!==(1 & this._cycle) ? 1 - a:a) + this._cycle * (this._duration + this._repeatDelay), b):this._time / this.duration();
}, k.totalProgress=function (a, b){
return arguments.length ? this.totalTime(this.totalDuration() * a, b):this._totalTime / this.totalDuration();
}, k.time=function (a, b){
return arguments.length ? (this._dirty&&this.totalDuration(), a > this._duration&&(a=this._duration), this._yoyo&&0!==(1 & this._cycle) ? a=this._duration - a + this._cycle * (this._duration + this._repeatDelay):0!==this._repeat&&(a +=this._cycle * (this._duration + this._repeatDelay)), this.totalTime(a, b)):this._time;
}, k.duration=function (b){
return arguments.length ? a.prototype.duration.call(this, b):this._duration;
}, k.totalDuration=function (a){
return arguments.length ? -1===this._repeat ? this:this.duration((a - this._repeat * this._repeatDelay) / (this._repeat + 1)):(this._dirty&&(this._totalDuration=-1===this._repeat ? 999999999999:this._duration * (this._repeat + 1) + this._repeatDelay * this._repeat, this._dirty = !1), this._totalDuration);
}, k.repeat=function (a){
return arguments.length ? (this._repeat=a, this._uncache(!0)):this._repeat;
}, k.repeatDelay=function (a){
return arguments.length ? (this._repeatDelay=a, this._uncache(!0)):this._repeatDelay;
}, k.yoyo=function (a){
return arguments.length ? (this._yoyo=a, this):this._yoyo;
}, f;
}, !0), _gsScope._gsDefine("TimelineLite", ["core.Animation", "core.SimpleTimeline", "TweenLite"], function (a, b, c){
var d=function (a){
b.call(this, a), this._labels={}, this.autoRemoveChildren=this.vars.autoRemoveChildren===!0, this.smoothChildTiming=this.vars.smoothChildTiming===!0, this._sortChildren = !0, this._onUpdate=this.vars.onUpdate;var c,
d,
e=this.vars;for (d in e){
c=e[d], i(c)&&-1!==c.join("").indexOf("{self}")&&(e[d]=this._swapSelfInParams(c));
}i(e.tweens)&&this.add(e.tweens, 0, e.align, e.stagger);
},
e=1e-10,
f=c._internals,
g=d._internals={},
h=f.isSelector,
i=f.isArray,
j=f.lazyTweens,
k=f.lazyRender,
l=_gsScope._gsDefine.globals,
m=function (a){
var b,
c={};for (b in a){
c[b]=a[b];
}return c;
},
n=function (a, b, c){
var d,
e,
f=a.cycle;for (d in f){
e=f[d], a[d]="function"==typeof e ? e.call(b[c], c):e[c % e.length];
}delete a.cycle;
},
o=g.pauseCallback=function (){},
p=function (a){
var b,
c=[],
d=a.length;for (b=0; b!==d; c.push(a[b++])){}return c;
},
q=d.prototype=new b();return d.version="1.18.5", q.constructor=d, q.kill()._gc=q._forcingPlayhead=q._hasPause = !1, q.to=function (a, b, d, e){
var f=d.repeat&&l.TweenMax||c;return b ? this.add(new f(a, b, d), e):this.set(a, d, e);
}, q.from=function (a, b, d, e){
return this.add((d.repeat&&l.TweenMax||c).from(a, b, d), e);
}, q.fromTo=function (a, b, d, e, f){
var g=e.repeat&&l.TweenMax||c;return b ? this.add(g.fromTo(a, b, d, e), f):this.set(a, e, f);
}, q.staggerTo=function (a, b, e, f, g, i, j, k){
var l,
o,
q=new d({ onComplete: i, onCompleteParams: j, callbackScope: k, smoothChildTiming: this.smoothChildTiming }),
r=e.cycle;for ("string"==typeof a&&(a=c.selector(a)||a), a=a||[], h(a)&&(a=p(a)), f=f||0, 0 > f&&(a=p(a), a.reverse(), f *=-1), o=0; o < a.length; o++){
l=m(e), l.startAt&&(l.startAt=m(l.startAt), l.startAt.cycle&&n(l.startAt, a, o)), r&&(n(l, a, o), null!=l.duration&&(b=l.duration, delete l.duration)), q.to(a[o], b, l, o * f);
}return this.add(q, g);
}, q.staggerFrom=function (a, b, c, d, e, f, g, h){
return c.immediateRender=0!=c.immediateRender, c.runBackwards = !0, this.staggerTo(a, b, c, d, e, f, g, h);
}, q.staggerFromTo=function (a, b, c, d, e, f, g, h, i){
return d.startAt=c, d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender, this.staggerTo(a, b, d, e, f, g, h, i);
}, q.call=function (a, b, d, e){
return this.add(c.delayedCall(0, a, b, d), e);
}, q.set=function (a, b, d){
return d=this._parseTimeOrLabel(d, 0, !0), null==b.immediateRender&&(b.immediateRender=d===this._time&&!this._paused), this.add(new c(a, 0, b), d);
}, d.exportRoot=function (a, b){
a=a||{}, null==a.smoothChildTiming&&(a.smoothChildTiming = !0);var e,
f,
g=new d(a),
h=g._timeline;for (null==b&&(b = !0), h._remove(g, !0), g._startTime=0, g._rawPrevTime=g._time=g._totalTime=h._time, e=h._first; e;){
f=e._next, b&&e instanceof c&&e.target===e.vars.onComplete||g.add(e, e._startTime - e._delay), e=f;
}return h.add(g, 0), g;
}, q.add=function (e, f, g, h){
var j, k, l, m, n, o;if("number"!=typeof f&&(f=this._parseTimeOrLabel(f, 0, !0, e)), !(e instanceof a)){
if(e instanceof Array||e&&e.push&&i(e)){
for (g=g||"normal", h=h||0, j=f, k=e.length, l=0; k > l; l++){
i(m=e[l])&&(m=new d({ tweens: m })), this.add(m, j), "string"!=typeof m&&"function"!=typeof m&&("sequence"===g ? j=m._startTime + m.totalDuration() / m._timeScale:"start"===g&&(m._startTime -=m.delay())), j +=h;
}return this._uncache(!0);
}if("string"==typeof e) return this.addLabel(e, f);if("function"!=typeof e) throw "Cannot add " + e + " into the timeline; it is not a tween, timeline, function, or string.";e=c.delayedCall(0, e);
}if(b.prototype.add.call(this, e, f), (this._gc||this._time===this._duration)&&!this._paused&&this._duration < this.duration()) for (n=this, o=n.rawTime() > e._startTime; n._timeline;){
o&&n._timeline.smoothChildTiming ? n.totalTime(n._totalTime, !0):n._gc&&n._enabled(!0, !1), n=n._timeline;
}return this;
}, q.remove=function (b){
if(b instanceof a){
this._remove(b, !1);var c=b._timeline=b.vars.useFrames ? a._rootFramesTimeline:a._rootTimeline;return b._startTime=(b._paused ? b._pauseTime:c._time) - (b._reversed ? b.totalDuration() - b._totalTime:b._totalTime) / b._timeScale, this;
}if(b instanceof Array||b&&b.push&&i(b)){
for (var d=b.length; --d > -1;){
this.remove(b[d]);
}return this;
}return "string"==typeof b ? this.removeLabel(b):this.kill(null, b);
}, q._remove=function (a, c){
b.prototype._remove.call(this, a, c);var d=this._last;return d ? this._time > d._startTime + d._totalDuration / d._timeScale&&(this._time=this.duration(), this._totalTime=this._totalDuration):this._time=this._totalTime=this._duration=this._totalDuration=0, this;
}, q.append=function (a, b){
return this.add(a, this._parseTimeOrLabel(null, b, !0, a));
}, q.insert=q.insertMultiple=function (a, b, c, d){
return this.add(a, b||0, c, d);
}, q.appendMultiple=function (a, b, c, d){
return this.add(a, this._parseTimeOrLabel(null, b, !0, a), c, d);
}, q.addLabel=function (a, b){
return this._labels[a]=this._parseTimeOrLabel(b), this;
}, q.addPause=function (a, b, d, e){
var f=c.delayedCall(0, o, d, e||this);return f.vars.onComplete=f.vars.onReverseComplete=b, f.data="isPause", this._hasPause = !0, this.add(f, a);
}, q.removeLabel=function (a){
return delete this._labels[a], this;
}, q.getLabelTime=function (a){
return null!=this._labels[a] ? this._labels[a]:-1;
}, q._parseTimeOrLabel=function (b, c, d, e){
var f;if(e instanceof a&&e.timeline===this) this.remove(e);else if(e&&(e instanceof Array||e.push&&i(e))) for (f=e.length; --f > -1;){
e[f] instanceof a&&e[f].timeline===this&&this.remove(e[f]);
}if("string"==typeof c) return this._parseTimeOrLabel(c, d&&"number"==typeof b&&null==this._labels[c] ? b - this.duration():0, d);if(c=c||0, "string"!=typeof b||!isNaN(b)&&null==this._labels[b]) null==b&&(b=this.duration());else {
if(f=b.indexOf("="), -1===f) return null==this._labels[b] ? d ? this._labels[b]=this.duration() + c:c : this._labels[b] + c;c=parseInt(b.charAt(f - 1) + "1", 10) * Number(b.substr(f + 1)), b=f > 1 ? this._parseTimeOrLabel(b.substr(0, f - 1), 0, d):this.duration();
}return Number(b) + c;
}, q.seek=function (a, b){
return this.totalTime("number"==typeof a ? a:this._parseTimeOrLabel(a), b!==!1);
}, q.stop=function (){
return this.paused(!0);
}, q.gotoAndPlay=function (a, b){
return this.play(a, b);
}, q.gotoAndStop=function (a, b){
return this.pause(a, b);
}, q.render=function (a, b, c){
this._gc&&this._enabled(!0, !1);var d,
f,
g,
h,
i,
l,
m,
n=this._dirty ? this.totalDuration():this._totalDuration,
o=this._time,
p=this._startTime,
q=this._timeScale,
r=this._paused;if(a >=n - 1e-7) this._totalTime=this._time=n, this._reversed||this._hasPausedChild()||(f = !0, h="onComplete", i = !!this._timeline.autoRemoveChildren, 0===this._duration&&(0 >=a&&a >=-1e-7||this._rawPrevTime < 0||this._rawPrevTime===e)&&this._rawPrevTime!==a&&this._first&&(i = !0, this._rawPrevTime > e&&(h="onReverseComplete"))), this._rawPrevTime=this._duration||!b||a || this._rawPrevTime===a ? a:e, a=n + 1e-4;else if(1e-7 > a){
if(this._totalTime=this._time=0, (0!==o||0===this._duration&&this._rawPrevTime!==e&&(this._rawPrevTime > 0||0 > a&&this._rawPrevTime >=0))&&(h="onReverseComplete", f=this._reversed), 0 > a) this._active = !1, this._timeline.autoRemoveChildren&&this._reversed ? (i=f = !0, h="onReverseComplete"):this._rawPrevTime >=0&&this._first&&(i = !0), this._rawPrevTime=a;else {
if(this._rawPrevTime=this._duration||!b||a || this._rawPrevTime===a ? a:e, 0===a&&f) for (d=this._first; d&&0===d._startTime;){
d._duration||(f = !1), d=d._next;
}a=0, this._initted||(i = !0);
}}else{
if(this._hasPause&&!this._forcingPlayhead&&!b){
if(a >=o) for (d=this._first; d&&d._startTime <=a&&!l;){
d._duration||"isPause"!==d.data||d.ratio||0===d._startTime&&0===this._rawPrevTime||(l=d), d=d._next;
} else for (d=this._last; d&&d._startTime >=a&&!l;){
d._duration||"isPause"===d.data&&d._rawPrevTime > 0&&(l=d), d=d._prev;
}l&&(this._time=a = l._startTime, this._totalTime=a + this._cycle * (this._totalDuration + this._repeatDelay));
}this._totalTime=this._time=this._rawPrevTime=a;
}if(this._time!==o&&this._first||c || i||l){
if(this._initted||(this._initted = !0), this._active||!this._paused&&this._time!==o&&a > 0&&(this._active = !0), 0===o&&this.vars.onStart&&(0===this._time&&this._duration||b || this._callback("onStart")), m=this._time, m >=o) for (d=this._first; d&&(g=d._next, m===this._time&&(!this._paused||r));){
(d._active||d._startTime <=m&&!d._paused&&!d._gc)&&(l===d&&this.pause(), d._reversed ? d.render((d._dirty ? d.totalDuration():d._totalDuration) - (a - d._startTime) * d._timeScale, b, c):d.render((a - d._startTime) * d._timeScale, b, c)), d=g;
} else for (d=this._last; d&&(g=d._prev, m===this._time&&(!this._paused||r));){
if(d._active||d._startTime <=o&&!d._paused&&!d._gc){
if(l===d){
for (l=d._prev; l&&l.endTime() > this._time;){
l.render(l._reversed ? l.totalDuration() - (a - l._startTime) * l._timeScale:(a - l._startTime) * l._timeScale, b, c), l=l._prev;
}l=null, this.pause();
}d._reversed ? d.render((d._dirty ? d.totalDuration():d._totalDuration) - (a - d._startTime) * d._timeScale, b, c):d.render((a - d._startTime) * d._timeScale, b, c);
}d=g;
}this._onUpdate&&(b||(j.length&&k(), this._callback("onUpdate"))), h&&(this._gc||(p===this._startTime||q!==this._timeScale)&&(0===this._time||n >=this.totalDuration())&&(f&&(j.length&&k(), this._timeline.autoRemoveChildren&&this._enabled(!1, !1), this._active = !1), !b&&this.vars[h]&&this._callback(h)));
}}, q._hasPausedChild=function (){
for (var a=this._first; a;){
if(a._paused||a instanceof d&&a._hasPausedChild()) return !0;a=a._next;
}return !1;
}, q.getChildren=function (a, b, d, e){
e=e||-9999999999;for (var f=[], g=this._first, h=0; g;){
g._startTime < e||(g instanceof c ? b!==!1&&(f[h++]=g):(d!==!1&&(f[h++]=g), a!==!1&&(f=f.concat(g.getChildren(!0, b, d)), h=f.length))), g=g._next;
}return f;
}, q.getTweensOf=function (a, b){
var d,
e,
f=this._gc,
g=[],
h=0;for (f&&this._enabled(!0, !0), d=c.getTweensOf(a), e=d.length; --e > -1;){
(d[e].timeline===this||b&&this._contains(d[e]))&&(g[h++]=d[e]);
}return f&&this._enabled(!1, !0), g;
}, q.recent=function (){
return this._recent;
}, q._contains=function (a){
for (var b=a.timeline; b;){
if(b===this) return !0;b=b.timeline;
}return !1;
}, q.shiftChildren=function (a, b, c){
c=c||0;for (var d, e=this._first, f=this._labels; e;){
e._startTime >=c&&(e._startTime +=a), e=e._next;
}if(b) for (d in f){
f[d] >=c&&(f[d] +=a);
}return this._uncache(!0);
}, q._kill=function (a, b){
if(!a&&!b) return this._enabled(!1, !1);for (var c=b ? this.getTweensOf(b):this.getChildren(!0, !0, !1), d=c.length, e = !1; --d > -1;){
c[d]._kill(a, b)&&(e = !0);
}return e;
}, q.clear=function (a){
var b=this.getChildren(!1, !0, !0),
c=b.length;for (this._time=this._totalTime=0; --c > -1;){
b[c]._enabled(!1, !1);
}return a!==!1&&(this._labels={}), this._uncache(!0);
}, q.invalidate=function (){
for (var b=this._first; b;){
b.invalidate(), b=b._next;
}return a.prototype.invalidate.call(this);
}, q._enabled=function (a, c){
if(a===this._gc) for (var d=this._first; d;){
d._enabled(a, !0), d=d._next;
}return b.prototype._enabled.call(this, a, c);
}, q.totalTime=function (b, c, d){
this._forcingPlayhead = !0;var e=a.prototype.totalTime.apply(this, arguments);return this._forcingPlayhead = !1, e;
}, q.duration=function (a){
return arguments.length ? (0!==this.duration()&&0!==a&&this.timeScale(this._duration / a), this):(this._dirty&&this.totalDuration(), this._duration);
}, q.totalDuration=function (a){
if(!arguments.length){
if(this._dirty){
for (var b, c, d=0, e=this._last, f=999999999999; e;){
b=e._prev, e._dirty&&e.totalDuration(), e._startTime > f&&this._sortChildren&&!e._paused ? this.add(e, e._startTime - e._delay):f=e._startTime, e._startTime < 0&&!e._paused&&(d -=e._startTime, this._timeline.smoothChildTiming&&(this._startTime +=e._startTime / this._timeScale), this.shiftChildren(-e._startTime, !1, -9999999999), f=0), c=e._startTime + e._totalDuration / e._timeScale, c > d&&(d=c), e=b;
}this._duration=this._totalDuration=d, this._dirty = !1;
}return this._totalDuration;
}return a&&this.totalDuration() ? this.timeScale(this._totalDuration / a):this;
}, q.paused=function (b){
if(!b) for (var c=this._first, d=this._time; c;){
c._startTime===d&&"isPause"===c.data&&(c._rawPrevTime=0), c=c._next;
}return a.prototype.paused.apply(this, arguments);
}, q.usesFrames=function (){
for (var b=this._timeline; b._timeline;){
b=b._timeline;
}return b===a._rootFramesTimeline;
}, q.rawTime=function (){
return this._paused ? this._totalTime:(this._timeline.rawTime() - this._startTime) * this._timeScale;
}, d;
}, !0), _gsScope._gsDefine("TimelineMax", ["TimelineLite", "TweenLite", "easing.Ease"], function (a, b, c){
var d=function (b){
a.call(this, b), this._repeat=this.vars.repeat||0, this._repeatDelay=this.vars.repeatDelay||0, this._cycle=0, this._yoyo=this.vars.yoyo===!0, this._dirty = !0;
},
e=1e-10,
f=b._internals,
g=f.lazyTweens,
h=f.lazyRender,
i=new c(null, null, 1, 0),
j=d.prototype=new a();return j.constructor=d, j.kill()._gc = !1, d.version="1.18.5", j.invalidate=function (){
return this._yoyo=this.vars.yoyo===!0, this._repeat=this.vars.repeat||0, this._repeatDelay=this.vars.repeatDelay||0, this._uncache(!0), a.prototype.invalidate.call(this);
}, j.addCallback=function (a, c, d, e){
return this.add(b.delayedCall(0, a, d, e), c);
}, j.removeCallback=function (a, b){
if(a) if(null==b) this._kill(null, a);else for (var c=this.getTweensOf(a, !1), d=c.length, e=this._parseTimeOrLabel(b); --d > -1;){
c[d]._startTime===e&&c[d]._enabled(!1, !1);
}return this;
}, j.removePause=function (b){
return this.removeCallback(a._internals.pauseCallback, b);
}, j.tweenTo=function (a, c){
c=c||{};var d,
e,
f,
g={ ease: i, useFrames: this.usesFrames(), immediateRender: !1 };for (e in c){
g[e]=c[e];
}return g.time=this._parseTimeOrLabel(a), d=Math.abs(Number(g.time) - this._time) / this._timeScale||.001, f=new b(this, d, g), g.onStart=function (){
f.target.paused(!0), f.vars.time!==f.target.time()&&d===f.duration()&&f.duration(Math.abs(f.vars.time - f.target.time()) / f.target._timeScale), c.onStart&&f._callback("onStart");
}, f;
}, j.tweenFromTo=function (a, b, c){
c=c||{}, a=this._parseTimeOrLabel(a), c.startAt={ onComplete: this.seek, onCompleteParams: [a], callbackScope: this }, c.immediateRender=c.immediateRender!==!1;var d=this.tweenTo(b, c);return d.duration(Math.abs(d.vars.time - a) / this._timeScale||.001);
}, j.render=function (a, b, c){
this._gc&&this._enabled(!0, !1);var d,
f,
i,
j,
k,
l,
m,
n,
o=this._dirty ? this.totalDuration():this._totalDuration,
p=this._duration,
q=this._time,
r=this._totalTime,
s=this._startTime,
t=this._timeScale,
u=this._rawPrevTime,
v=this._paused,
w=this._cycle;if(a >=o - 1e-7) this._locked||(this._totalTime=o, this._cycle=this._repeat), this._reversed||this._hasPausedChild()||(f = !0, j="onComplete", k = !!this._timeline.autoRemoveChildren, 0===this._duration&&(0 >=a&&a >=-1e-7||0 > u||u===e)&&u!==a&&this._first&&(k = !0, u > e&&(j="onReverseComplete"))), this._rawPrevTime=this._duration||!b||a || this._rawPrevTime===a ? a:e, this._yoyo&&0!==(1 & this._cycle) ? this._time=a = 0:(this._time=p, a=p + 1e-4);else if(1e-7 > a){
if(this._locked||(this._totalTime=this._cycle=0), this._time=0, (0!==q||0===p&&u!==e&&(u > 0||0 > a&&u >=0)&&!this._locked)&&(j="onReverseComplete", f=this._reversed), 0 > a) this._active = !1, this._timeline.autoRemoveChildren&&this._reversed ? (k=f = !0, j="onReverseComplete"):u >=0&&this._first&&(k = !0), this._rawPrevTime=a;else {
if(this._rawPrevTime=p||!b||a || this._rawPrevTime===a ? a:e, 0===a&&f) for (d=this._first; d&&0===d._startTime;){
d._duration||(f = !1), d=d._next;
}a=0, this._initted||(k = !0);
}}else if(0===p&&0 > u&&(k = !0), this._time=this._rawPrevTime=a, this._locked||(this._totalTime=a, 0!==this._repeat&&(l=p + this._repeatDelay, this._cycle=this._totalTime / l >> 0, 0!==this._cycle&&this._cycle===this._totalTime / l&&a >=r&&this._cycle--, this._time=this._totalTime - this._cycle * l, this._yoyo&&0!==(1 & this._cycle)&&(this._time=p - this._time), this._time > p ? (this._time=p, a=p + 1e-4):this._time < 0 ? this._time=a = 0:a=this._time)), this._hasPause&&!this._forcingPlayhead&&!b){
if(a=this._time, a >=q) for (d=this._first; d&&d._startTime <=a&&!m;){
d._duration||"isPause"!==d.data||d.ratio||0===d._startTime&&0===this._rawPrevTime||(m=d), d=d._next;
} else for (d=this._last; d&&d._startTime >=a&&!m;){
d._duration||"isPause"===d.data&&d._rawPrevTime > 0&&(m=d), d=d._prev;
}m&&(this._time=a = m._startTime, this._totalTime=a + this._cycle * (this._totalDuration + this._repeatDelay));
}if(this._cycle!==w&&!this._locked){
var x=this._yoyo&&0!==(1 & w),
y=x===(this._yoyo&&0!==(1 & this._cycle)),
z=this._totalTime,
A=this._cycle,
B=this._rawPrevTime,
C=this._time;if(this._totalTime=w * p, this._cycle < w ? x = !x:this._totalTime +=p, this._time=q, this._rawPrevTime=0===p ? u - 1e-4:u, this._cycle=w, this._locked = !0, q=x ? 0:p, this.render(q, b, 0===p), b||this._gc||this.vars.onRepeat&&this._callback("onRepeat"), q!==this._time) return;if(y&&(q=x ? p + 1e-4:-1e-4, this.render(q, !0, !1)), this._locked = !1, this._paused&&!v) return;this._time=C, this._totalTime=z, this._cycle=A, this._rawPrevTime=B;
}if(!(this._time!==q&&this._first||c || k||m)) return void (r!==this._totalTime&&this._onUpdate&&(b||this._callback("onUpdate")));if(this._initted||(this._initted = !0), this._active||!this._paused&&this._totalTime!==r&&a > 0&&(this._active = !0), 0===r&&this.vars.onStart&&(0===this._totalTime&&this._totalDuration||b || this._callback("onStart")), n=this._time, n >=q) for (d=this._first; d&&(i=d._next, n===this._time&&(!this._paused||v));){
(d._active||d._startTime <=this._time&&!d._paused&&!d._gc)&&(m===d&&this.pause(), d._reversed ? d.render((d._dirty ? d.totalDuration():d._totalDuration) - (a - d._startTime) * d._timeScale, b, c):d.render((a - d._startTime) * d._timeScale, b, c)), d=i;
} else for (d=this._last; d&&(i=d._prev, n===this._time&&(!this._paused||v));){
if(d._active||d._startTime <=q&&!d._paused&&!d._gc){
if(m===d){
for (m=d._prev; m&&m.endTime() > this._time;){
m.render(m._reversed ? m.totalDuration() - (a - m._startTime) * m._timeScale:(a - m._startTime) * m._timeScale, b, c), m=m._prev;
}m=null, this.pause();
}d._reversed ? d.render((d._dirty ? d.totalDuration():d._totalDuration) - (a - d._startTime) * d._timeScale, b, c):d.render((a - d._startTime) * d._timeScale, b, c);
}d=i;
}this._onUpdate&&(b||(g.length&&h(), this._callback("onUpdate"))), j&&(this._locked||this._gc||(s===this._startTime||t!==this._timeScale)&&(0===this._time||o >=this.totalDuration())&&(f&&(g.length&&h(), this._timeline.autoRemoveChildren&&this._enabled(!1, !1), this._active = !1), !b&&this.vars[j]&&this._callback(j)));
}, j.getActive=function (a, b, c){
null==a&&(a = !0), null==b&&(b = !0), null==c&&(c = !1);var d,
e,
f=[],
g=this.getChildren(a, b, c),
h=0,
i=g.length;for (d=0; i > d; d++){
e=g[d], e.isActive()&&(f[h++]=e);
}return f;
}, j.getLabelAfter=function (a){
a||0!==a&&(a=this._time);var b,
c=this.getLabelsArray(),
d=c.length;for (b=0; d > b; b++){
if(c[b].time > a) return c[b].name;
}return null;
}, j.getLabelBefore=function (a){
null==a&&(a=this._time);for (var b=this.getLabelsArray(), c=b.length; --c > -1;){
if(b[c].time < a) return b[c].name;
}return null;
}, j.getLabelsArray=function (){
var a,
b=[],
c=0;for (a in this._labels){
b[c++]={ time: this._labels[a], name: a };}return b.sort(function (a, b){
return a.time - b.time;
}), b;
}, j.progress=function (a, b){
return arguments.length ? this.totalTime(this.duration() * (this._yoyo&&0!==(1 & this._cycle) ? 1 - a:a) + this._cycle * (this._duration + this._repeatDelay), b):this._time / this.duration();
}, j.totalProgress=function (a, b){
return arguments.length ? this.totalTime(this.totalDuration() * a, b):this._totalTime / this.totalDuration();
}, j.totalDuration=function (b){
return arguments.length ? -1!==this._repeat&&b ? this.timeScale(this.totalDuration() / b):this:(this._dirty&&(a.prototype.totalDuration.call(this), this._totalDuration=-1===this._repeat ? 999999999999:this._duration * (this._repeat + 1) + this._repeatDelay * this._repeat), this._totalDuration);
}, j.time=function (a, b){
return arguments.length ? (this._dirty&&this.totalDuration(), a > this._duration&&(a=this._duration), this._yoyo&&0!==(1 & this._cycle) ? a=this._duration - a + this._cycle * (this._duration + this._repeatDelay):0!==this._repeat&&(a +=this._cycle * (this._duration + this._repeatDelay)), this.totalTime(a, b)):this._time;
}, j.repeat=function (a){
return arguments.length ? (this._repeat=a, this._uncache(!0)):this._repeat;
}, j.repeatDelay=function (a){
return arguments.length ? (this._repeatDelay=a, this._uncache(!0)):this._repeatDelay;
}, j.yoyo=function (a){
return arguments.length ? (this._yoyo=a, this):this._yoyo;
}, j.currentLabel=function (a){
return arguments.length ? this.seek(a, !0):this.getLabelBefore(this._time + 1e-8);
}, d;
}, !0), function (){
var a=180 / Math.PI,
b=[],
c=[],
d=[],
e={},
f=_gsScope._gsDefine.globals,
g=function (a, b, c, d){
c===d&&(c=d - (d - b) / 1e6), a===b&&(b=a + (c - a) / 1e6), this.a=a, this.b=b, this.c=c, this.d=d, this.da=d - a, this.ca=c - a, this.ba=b - a;
},
h=",x,y,z,left,top,right,bottom,marginTop,marginLeft,marginRight,marginBottom,paddingLeft,paddingTop,paddingRight,paddingBottom,backgroundPosition,backgroundPosition_y,",
i=function (a, b, c, d){
var e={ a: a },
f={},
g={},
h={ c: d },
i=(a + b) / 2,
j=(b + c) / 2,
k=(c + d) / 2,
l=(i + j) / 2,
m=(j + k) / 2,
n=(m - l) / 8;return e.b=i + (a - i) / 4, f.b=l + n, e.c=f.a=(e.b + f.b) / 2, f.c=g.a=(l + m) / 2, g.b=m - n, h.b=k + (d - k) / 4, g.c=h.a=(g.b + h.b) / 2, [e, f, g, h];
},
j=function (a, e, f, g, h){
var j,
k,
l,
m,
n,
o,
p,
q,
r,
s,
t,
u,
v,
w=a.length - 1,
x=0,
y=a[0].a;for (j=0; w > j; j++){
n=a[x], k=n.a, l=n.d, m=a[x + 1].d, h ? (t=b[j], u=c[j], v=(u + t) * e * .25 / (g ? .5:d[j]||.5), o=l - (l - k) * (g ? .5 * e:0!==t ? v / t:0), p=l + (m - l) * (g ? .5 * e:0!==u ? v / u:0), q=l - (o + ((p - o) * (3 * t / (t + u) + .5) / 4||0))):(o=l - (l - k) * e * .5, p=l + (m - l) * e * .5, q=l - (o + p) / 2), o +=q, p +=q, n.c=r = o, 0!==j ? n.b=y:n.b=y = n.a + .6 * (n.c - n.a), n.da=l - k, n.ca=r - k, n.ba=y - k, f ? (s=i(k, y, r, l), a.splice(x, 1, s[0], s[1], s[2], s[3]), x +=4):x++, y=p;
}n=a[x], n.b=y, n.c=y + .4 * (n.d - y), n.da=n.d - n.a, n.ca=n.c - n.a, n.ba=y - n.a, f&&(s=i(n.a, y, n.c, n.d), a.splice(x, 1, s[0], s[1], s[2], s[3]));
},
k=function (a, d, e, f){
var h,
i,
j,
k,
l,
m,
n=[];if(f) for (a=[f].concat(a), i=a.length; --i > -1;){
"string"==typeof (m=a[i][d])&&"="===m.charAt(1)&&(a[i][d]=f[d] + Number(m.charAt(0) + m.substr(2)));
}if(h=a.length - 2, 0 > h) return n[0]=new g(a[0][d], 0, 0, a[-1 > h ? 0:1][d]), n;for (i=0; h > i; i++){
j=a[i][d], k=a[i + 1][d], n[i]=new g(j, 0, 0, k), e&&(l=a[i + 2][d], b[i]=(b[i]||0) + (k - j) * (k - j), c[i]=(c[i]||0) + (l - k) * (l - k));
}return n[i]=new g(a[i][d], 0, 0, a[i + 1][d]), n;
},
l=function (a, f, g, i, l, m){
var n,
o,
p,
q,
r,
s,
t,
u,
v={},
w=[],
x=m||a[0];l="string"==typeof l ? "," + l + ",":h, null==f&&(f=1);for (o in a[0]){
w.push(o);
}if(a.length > 1){
for (u=a[a.length - 1], t = !0, n=w.length; --n > -1;){
if(o=w[n], Math.abs(x[o] - u[o]) > .05){
t = !1;break;
}}t&&(a=a.concat(), m&&a.unshift(m), a.push(a[1]), m=a[a.length - 3]);
}for (b.length=c.length=d.length=0, n=w.length; --n > -1;){
o=w[n], e[o]=-1!==l.indexOf("," + o + ","), v[o]=k(a, o, e[o], m);
}for (n=b.length; --n > -1;){
b[n]=Math.sqrt(b[n]), c[n]=Math.sqrt(c[n]);
}if(!i){
for (n=w.length; --n > -1;){
if(e[o]) for (p=v[w[n]], s=p.length - 1, q=0; s > q; q++){
r=p[q + 1].da / c[q] + p[q].da / b[q]||0, d[q]=(d[q]||0) + r * r;
}}for (n=d.length; --n > -1;){
d[n]=Math.sqrt(d[n]);
}}for (n=w.length, q=g ? 4:1; --n > -1;){
o=w[n], p=v[o], j(p, f, g, i, e[o]), t&&(p.splice(0, q), p.splice(p.length - q, q));
}return v;
},
m=function (a, b, c){
b=b||"soft";var d,
e,
f,
h,
i,
j,
k,
l,
m,
n,
o,
p={},
q="cubic"===b ? 3:2,
r="soft"===b,
s=[];if(r&&c && (a=[c].concat(a)), null==a||a.length < q + 1) throw "invalid Bezier data";for (m in a[0]){
s.push(m);
}for (j=s.length; --j > -1;){
for (m=s[j], p[m]=i = [], n=0, l=a.length, k=0; l > k; k++){
d=null==c ? a[k][m]:"string"==typeof (o=a[k][m])&&"="===o.charAt(1) ? c[m] + Number(o.charAt(0) + o.substr(2)):Number(o), r&&k > 1&&l - 1 > k&&(i[n++]=(d + i[n - 2]) / 2), i[n++]=d;
}for (l=n - q + 1, n=0, k=0; l > k; k +=q){
d=i[k], e=i[k + 1], f=i[k + 2], h=2===q ? 0:i[k + 3], i[n++]=o = 3===q ? new g(d, e, f, h):new g(d, (2 * e + d) / 3, (2 * e + f) / 3, f);
}i.length=n;
}return p;
},
n=function (a, b, c){
for (var d, e, f, g, h, i, j, k, l, m, n, o=1 / c, p=a.length; --p > -1;){
for (m=a[p], f=m.a, g=m.d - f, h=m.c - f, i=m.b - f, d=e = 0, k=1; c >=k; k++){
j=o * k, l=1 - j, d=e - (e=(j * j * g + 3 * l * (j * h + l * i)) * j), n=p * c + k - 1, b[n]=(b[n]||0) + d * d;
}}
},
o=function (a, b){
b=b >> 0||6;var c,
d,
e,
f,
g=[],
h=[],
i=0,
j=0,
k=b - 1,
l=[],
m=[];for (c in a){
n(a[c], g, b);
}for (e=g.length, d=0; e > d; d++){
i +=Math.sqrt(g[d]), f=d % b, m[f]=i, f===k&&(j +=i, f=d / b >> 0, l[f]=m, h[f]=j, i=0, m=[]);
}return { length: j, lengths: h, segments: l };},
p=_gsScope._gsDefine.plugin({ propName: "bezier",
priority: -1, version: "1.3.6", API: 2, global: !0, init: function (a, b, c){
this._target=a, b instanceof Array&&(b={ values: b }), this._func={}, this._round={}, this._props=[], this._timeRes=null==b.timeResolution ? 6:parseInt(b.timeResolution, 10);var d,
e,
f,
g,
h,
i=b.values||[],
j={},
k=i[0],
n=b.autoRotate||c.vars.orientToBezier;this._autoRotate=n ? n instanceof Array ? n:[["x", "y", "rotation", n===!0 ? 0:Number(n)||0]]:null;for (d in k){
this._props.push(d);
}for (f=this._props.length; --f > -1;){
d=this._props[f], this._overwriteProps.push(d), e=this._func[d]="function"==typeof a[d], j[d]=e ? a[d.indexOf("set")||"function"!=typeof a["get" + d.substr(3)] ? d:"get" + d.substr(3)]():parseFloat(a[d]), h||j[d]!==i[0][d]&&(h=j);
}if(this._beziers="cubic"!==b.type&&"quadratic"!==b.type&&"soft"!==b.type ? l(i, isNaN(b.curviness) ? 1:b.curviness, !1, "thruBasic"===b.type, b.correlate, h):m(i, b.type, j), this._segCount=this._beziers[d].length, this._timeRes){
var p=o(this._beziers, this._timeRes);this._length=p.length, this._lengths=p.lengths, this._segments=p.segments, this._l1=this._li=this._s1=this._si=0, this._l2=this._lengths[0], this._curSeg=this._segments[0], this._s2=this._curSeg[0], this._prec=1 / this._curSeg.length;
}if(n=this._autoRotate) for (this._initialRotations=[], n[0] instanceof Array||(this._autoRotate=n = [n]), f=n.length; --f > -1;){
for (g=0; 3 > g; g++){
d=n[f][g], this._func[d]="function"==typeof a[d] ? a[d.indexOf("set")||"function"!=typeof a["get" + d.substr(3)] ? d:"get" + d.substr(3)]:!1;
}d=n[f][2], this._initialRotations[f]=(this._func[d] ? this._func[d].call(this._target):this._target[d])||0;
}return this._startRatio=c.vars.runBackwards ? 1:0, !0;
}, set: function (b){
var c,
d,
e,
f,
g,
h,
i,
j,
k,
l,
m=this._segCount,
n=this._func,
o=this._target,
p=b!==this._startRatio;if(this._timeRes){
if(k=this._lengths, l=this._curSeg, b *=this._length, e=this._li, b > this._l2&&m - 1 > e){
for (j=m - 1; j > e&&(this._l2=k[++e]) <=b;){}this._l1=k[e - 1], this._li=e, this._curSeg=l = this._segments[e], this._s2=l[this._s1=this._si=0];
}else if(b < this._l1&&e > 0){
for (; e > 0&&(this._l1=k[--e]) >=b;){}0===e&&b < this._l1 ? this._l1=0:e++, this._l2=k[e], this._li=e, this._curSeg=l = this._segments[e], this._s1=l[(this._si=l.length - 1) - 1]||0, this._s2=l[this._si];
}if(c=e, b -=this._l1, e=this._si, b > this._s2&&e < l.length - 1){
for (j=l.length - 1; j > e&&(this._s2=l[++e]) <=b;){}this._s1=l[e - 1], this._si=e;
}else if(b < this._s1&&e > 0){
for (; e > 0&&(this._s1=l[--e]) >=b;){}0===e&&b < this._s1 ? this._s1=0:e++, this._s2=l[e], this._si=e;
}h=(e + (b - this._s1) / (this._s2 - this._s1)) * this._prec||0;
} else c=0 > b ? 0:b >=1 ? m - 1:m * b >> 0, h=(b - c * (1 / m)) * m;for (d=1 - h, e=this._props.length; --e > -1;){
f=this._props[e], g=this._beziers[f][c], i=(h * h * g.da + 3 * d * (h * g.ca + d * g.ba)) * h + g.a, this._round[f]&&(i=Math.round(i)), n[f] ? o[f](i):o[f]=i;
}if(this._autoRotate){
var q,
r,
s,
t,
u,
v,
w,
x=this._autoRotate;for (e=x.length; --e > -1;){
f=x[e][2], v=x[e][3]||0, w=x[e][4]===!0 ? 1:a, g=this._beziers[x[e][0]], q=this._beziers[x[e][1]], g&&q && (g=g[c], q=q[c], r=g.a + (g.b - g.a) * h, t=g.b + (g.c - g.b) * h, r +=(t - r) * h, t +=(g.c + (g.d - g.c) * h - t) * h, s=q.a + (q.b - q.a) * h, u=q.b + (q.c - q.b) * h, s +=(u - s) * h, u +=(q.c + (q.d - q.c) * h - u) * h, i=p ? Math.atan2(u - s, t - r) * w + v:this._initialRotations[e], n[f] ? o[f](i):o[f]=i);
}}
}}),
q=p.prototype;p.bezierThrough=l, p.cubicToQuadratic=i, p._autoCSS = !0, p.quadraticToCubic=function (a, b, c){
return new g(a, (2 * b + a) / 3, (2 * b + c) / 3, c);
}, p._cssRegister=function (){
var a=f.CSSPlugin;if(a){
var b=a._internals,
c=b._parseToProxy,
d=b._setPluginRatio,
e=b.CSSPropTween;b._registerComplexSpecialProp("bezier", { parser: function (a, b, f, g, h, i){
b instanceof Array&&(b={ values: b }), i=new p();var j,
k,
l,
m=b.values,
n=m.length - 1,
o=[],
q={};if(0 > n) return h;for (j=0; n >=j; j++){
l=c(a, m[j], g, h, i, n!==j), o[j]=l.end;
}for (k in b){
q[k]=b[k];
}return q.values=o, h=new e(a, "bezier", 0, 0, l.pt, 2), h.data=l, h.plugin=i, h.setRatio=d, 0===q.autoRotate&&(q.autoRotate = !0), !q.autoRotate||q.autoRotate instanceof Array||(j=q.autoRotate===!0 ? 0:Number(q.autoRotate), q.autoRotate=null!=l.end.left ? [["left", "top", "rotation", j, !1]]:null!=l.end.x ? [["x", "y", "rotation", j, !1]]:!1), q.autoRotate&&(g._transform||g._enableTransforms(!1), l.autoRotate=g._target._gsTransform, l.proxy.rotation=l.autoRotate.rotation||0), i._onInitTween(l.proxy, q, g._tween), h;
}});
}}, q._roundProps=function (a, b){
for (var c=this._overwriteProps, d=c.length; --d > -1;){
(a[c[d]]||a.bezier||a.bezierThrough)&&(this._round[c[d]]=b);
}}, q._kill=function (a){
var b,
c,
d=this._props;for (b in this._beziers){
if(b in a) for (delete this._beziers[b], delete this._func[b], c=d.length; --c > -1;){
d[c]===b&&d.splice(c, 1);
}}return this._super._kill.call(this, a);
};}(), _gsScope._gsDefine("plugins.CSSPlugin", ["plugins.TweenPlugin", "TweenLite"], function (a, b){
var c,
d,
e,
f,
g=function (){
a.call(this, "css"), this._overwriteProps.length=0, this.setRatio=g.prototype.setRatio;
},
h=_gsScope._gsDefine.globals,
i={},
j=g.prototype=new a("css");j.constructor=g, g.version="1.18.5", g.API=2, g.defaultTransformPerspective=0, g.defaultSkewType="compensated", g.defaultSmoothOrigin = !0, j="px", g.suffixMap={ top: j, right: j, bottom: j, left: j, width: j, height: j, fontSize: j, padding: j, margin: j, perspective: j, lineHeight: "" };var k,
l,
m,
n,
o,
p,
q=/(?:\-|\.|\b)(\d|\.|e\-)+/g,
r=/(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,
s=/(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi,
t=/(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g,
u=/(?:\d|\-|\+|=|#|\.)*/g,
v=/opacity *=*([^)]*)/i,
w=/opacity:([^;]*)/i,
x=/alpha\(opacity *=.+?\)/i,
y=/^(rgb|hsl)/,
z=/([A-Z])/g,
A=/-([a-z])/gi,
B=/(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi,
C=function (a, b){
return b.toUpperCase();
},
D=/(?:Left|Right|Width)/i,
E=/(M11|M12|M21|M22)=[\d\-\.e]+/gi,
F=/progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,
G=/,(?=[^\)]*(?:\(|$))/gi,
H=/[\s,\(]/i,
I=Math.PI / 180,
J=180 / Math.PI,
K={},
L=document,
M=function (a){
return L.createElementNS ? L.createElementNS("http://www.w3.org/1999/xhtml", a):L.createElement(a);
},
N=M("div"),
O=M("img"),
P=g._internals={ _specialProps: i },
Q=navigator.userAgent,
R=function (){
var a=Q.indexOf("Android"),
b=M("a");return m=-1!==Q.indexOf("Safari")&&-1===Q.indexOf("Chrome")&&(-1===a||Number(Q.substr(a + 8, 1)) > 3), o=m&&Number(Q.substr(Q.indexOf("Version/") + 8, 1)) < 6, n=-1!==Q.indexOf("Firefox"), (/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(Q)||/Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(Q))&&(p=parseFloat(RegExp.$1)), b ? (b.style.cssText="top:1px;opacity:.55;", /^0.55/.test(b.style.opacity)):!1;
}(),
S=function (a){
return v.test("string"==typeof a ? a:(a.currentStyle ? a.currentStyle.filter:a.style.filter)||"") ? parseFloat(RegExp.$1) / 100:1;
},
T=function (a){
window.console&&console.log(a);
},
U="",
V="",
W=function (a, b){
b=b||N;var c,
d,
e=b.style;if(void 0!==e[a]) return a;for (a=a.charAt(0).toUpperCase() + a.substr(1), c=["O", "Moz", "ms", "Ms", "Webkit"], d=5; --d > -1&&void 0===e[c[d] + a];){}return d >=0 ? (V=3===d ? "ms":c[d], U="-" + V.toLowerCase() + "-", V + a):null;
},
X=L.defaultView ? L.defaultView.getComputedStyle:function (){},
Y=g.getStyle=function (a, b, c, d, e){
var f;return R||"opacity"!==b ? (!d&&a.style[b] ? f=a.style[b]:(c=c||X(a)) ? f=c[b]||c.getPropertyValue(b)||c.getPropertyValue(b.replace(z, "-$1").toLowerCase()):a.currentStyle&&(f=a.currentStyle[b]), null==e||f&&"none"!==f&&"auto"!==f&&"auto auto"!==f ? f:e):S(a);
},
Z=P.convertToPixels=function (a, c, d, e, f){
if("px"===e||!e) return d;if("auto"===e||!d) return 0;var h,
i,
j,
k=D.test(c),
l=a,
m=N.style,
n=0 > d,
o=1===d;if(n&&(d=-d), o&&(d *=100), "%"===e&&-1!==c.indexOf("border")) h=d / 100 * (k ? a.clientWidth:a.clientHeight);else {
if(m.cssText="border:0 solid red;position:" + Y(a, "position") + ";line-height:0;", "%"!==e&&l.appendChild&&"v"!==e.charAt(0)&&"rem"!==e) m[k ? "borderLeftWidth":"borderTopWidth"]=d + e;else {
if(l=a.parentNode||L.body, i=l._gsCache, j=b.ticker.frame, i&&k && i.time===j) return i.width * d / 100;m[k ? "width":"height"]=d + e;
}l.appendChild(N), h=parseFloat(N[k ? "offsetWidth":"offsetHeight"]), l.removeChild(N), k&&"%"===e&&g.cacheWidths!==!1&&(i=l._gsCache=l._gsCache||{}, i.time=j, i.width=h / d * 100), 0!==h||f || (h=Z(a, c, d, e, !0));
}return o&&(h /=100), n ? -h:h;
},
$=P.calculateOffset=function (a, b, c){
if("absolute"!==Y(a, "position", c)) return 0;var d="left"===b ? "Left":"Top",
e=Y(a, "margin" + d, c);return a["offset" + d] - (Z(a, b, parseFloat(e), e.replace(u, ""))||0);
},
_=function (a, b){
var c,
d,
e,
f={};if(b=b||X(a, null)){
if(c=b.length) for (; --c > -1;){
e=b[c], (-1===e.indexOf("-transform")||Aa===e)&&(f[e.replace(A, C)]=b.getPropertyValue(e));
} else for (c in b){
(-1===c.indexOf("Transform")||za===c)&&(f[c]=b[c]);
}}else if(b=a.currentStyle||a.style) for (c in b){
"string"==typeof c&&void 0===f[c]&&(f[c.replace(A, C)]=b[c]);
}return R||(f.opacity=S(a)), d=Na(a, b, !1), f.rotation=d.rotation, f.skewX=d.skewX, f.scaleX=d.scaleX, f.scaleY=d.scaleY, f.x=d.x, f.y=d.y, Ca&&(f.z=d.z, f.rotationX=d.rotationX, f.rotationY=d.rotationY, f.scaleZ=d.scaleZ), f.filters&&delete f.filters, f;
},
aa=function (a, b, c, d, e){
var f,
g,
h,
i={},
j=a.style;for (g in c){
"cssText"!==g&&"length"!==g&&isNaN(g)&&(b[g]!==(f=c[g])||e&&e[g])&&-1===g.indexOf("Origin")&&("number"==typeof f||"string"==typeof f)&&(i[g]="auto"!==f||"left"!==g&&"top"!==g ? ""!==f&&"auto"!==f&&"none"!==f||"string"!=typeof b[g]||""===b[g].replace(t, "") ? f:0 : $(a, g), void 0!==j[g]&&(h=new pa(j, g, j[g], h)));
}if(d) for (g in d){
"className"!==g&&(i[g]=d[g]);
}return { difs: i, firstMPT: h };},
ba={ width: ["Left", "Right"], height: ["Top", "Bottom"] },
ca=["marginLeft", "marginRight", "marginTop", "marginBottom"],
da=function (a, b, c){
if("svg"===(a.nodeName + "").toLowerCase()) return (c||X(a))[b]||0;if(a.getBBox&&Ka(a)) return a.getBBox()[b]||0;var d=parseFloat("width"===b ? a.offsetWidth:a.offsetHeight),
e=ba[b],
f=e.length;for (c=c||X(a, null); --f > -1;){
d -=parseFloat(Y(a, "padding" + e[f], c, !0))||0, d -=parseFloat(Y(a, "border" + e[f] + "Width", c, !0))||0;
}return d;
},
ea=function (a, b){
if("contain"===a||"auto"===a||"auto auto"===a) return a + " ";(null==a||""===a)&&(a="0 0");var c,
d=a.split(" "),
e=-1!==a.indexOf("left") ? "0%":-1!==a.indexOf("right") ? "100%":d[0],
f=-1!==a.indexOf("top") ? "0%":-1!==a.indexOf("bottom") ? "100%":d[1];if(d.length > 3&&!b){
for (d=a.split(", ").join(",").split(","), a=[], c=0; c < d.length; c++){
a.push(ea(d[c]));
}return a.join(",");
}return null==f ? f="center"===e ? "50%":"0":"center"===f&&(f="50%"), ("center"===e||isNaN(parseFloat(e))&&-1===(e + "").indexOf("="))&&(e="50%"), a=e + " " + f + (d.length > 2 ? " " + d[2]:""), b&&(b.oxp=-1!==e.indexOf("%"), b.oyp=-1!==f.indexOf("%"), b.oxr="="===e.charAt(1), b.oyr="="===f.charAt(1), b.ox=parseFloat(e.replace(t, "")), b.oy=parseFloat(f.replace(t, "")), b.v=a), b||a;
},
fa=function (a, b){
return "string"==typeof a&&"="===a.charAt(1) ? parseInt(a.charAt(0) + "1", 10) * parseFloat(a.substr(2)):parseFloat(a) - parseFloat(b)||0;
},
ga=function (a, b){
return null==a ? b:"string"==typeof a&&"="===a.charAt(1) ? parseInt(a.charAt(0) + "1", 10) * parseFloat(a.substr(2)) + b:parseFloat(a)||0;
},
ha=function (a, b, c, d){
var e,
f,
g,
h,
i,
j=1e-6;return null==a ? h=b:"number"==typeof a ? h=a:(e=360, f=a.split("_"), i="="===a.charAt(1), g=(i ? parseInt(a.charAt(0) + "1", 10) * parseFloat(f[0].substr(2)):parseFloat(f[0])) * (-1===a.indexOf("rad") ? 1:J) - (i ? 0:b), f.length&&(d&&(d[c]=b + g), -1!==a.indexOf("short")&&(g %=e, g!==g % (e / 2)&&(g=0 > g ? g + e:g - e)), -1!==a.indexOf("_cw")&&0 > g ? g=(g + 9999999999 * e) % e - (g / e | 0) * e:-1!==a.indexOf("ccw")&&g > 0&&(g=(g - 9999999999 * e) % e - (g / e | 0) * e)), h=b + g), j > h&&h > -j&&(h=0), h;
},
ia={ aqua: [0, 255, 255], lime: [0, 255, 0], silver: [192, 192, 192], black: [0, 0, 0], maroon: [128, 0, 0], teal: [0, 128, 128], blue: [0, 0, 255], navy: [0, 0, 128], white: [255, 255, 255], fuchsia: [255, 0, 255], olive: [128, 128, 0], yellow: [255, 255, 0], orange: [255, 165, 0], gray: [128, 128, 128], purple: [128, 0, 128], green: [0, 128, 0], red: [255, 0, 0], pink: [255, 192, 203], cyan: [0, 255, 255], transparent: [255, 255, 255, 0] },
ja=function (a, b, c){
return a=0 > a ? a + 1:a > 1 ? a - 1:a, 255 * (1 > 6 * a ? b + (c - b) * a * 6 : .5 > a ? c:2 > 3 * a ? b + (c - b) * (2 / 3 - a) * 6:b) + .5 | 0;
},
ka=g.parseColor=function (a, b){
var c, d, e, f, g, h, i, j, k, l, m;if(a){
if("number"==typeof a) c=[a >> 16, a >> 8 & 255, 255 & a];else {
if(","===a.charAt(a.length - 1)&&(a=a.substr(0, a.length - 1)), ia[a]) c=ia[a];else if("#"===a.charAt(0)) 4===a.length&&(d=a.charAt(1), e=a.charAt(2), f=a.charAt(3), a="#" + d + d + e + e + f + f), a=parseInt(a.substr(1), 16), c=[a >> 16, a >> 8 & 255, 255 & a];else if("hsl"===a.substr(0, 3)){
if(c=m = a.match(q), b){
if(-1!==a.indexOf("=")) return a.match(r);
} else g=Number(c[0]) % 360 / 360, h=Number(c[1]) / 100, i=Number(c[2]) / 100, e=.5 >=i ? i * (h + 1):i + h - i * h, d=2 * i - e, c.length > 3&&(c[3]=Number(a[3])), c[0]=ja(g + 1 / 3, d, e), c[1]=ja(g, d, e), c[2]=ja(g - 1 / 3, d, e);
} else c=a.match(q)||ia.transparent;c[0]=Number(c[0]), c[1]=Number(c[1]), c[2]=Number(c[2]), c.length > 3&&(c[3]=Number(c[3]));
}} else c=ia.black;return b&&!m&&(d=c[0] / 255, e=c[1] / 255, f=c[2] / 255, j=Math.max(d, e, f), k=Math.min(d, e, f), i=(j + k) / 2, j===k ? g=h = 0:(l=j - k, h=i > .5 ? l / (2 - j - k):l / (j + k), g=j===d ? (e - f) / l + (f > e ? 6:0):j===e ? (f - d) / l + 2:(d - e) / l + 4, g *=60), c[0]=g + .5 | 0, c[1]=100 * h + .5 | 0, c[2]=100 * i + .5 | 0), c;
},
la=function (a, b){
var c,
d,
e,
f=a.match(ma)||[],
g=0,
h=f.length ? "":a;for (c=0; c < f.length; c++){
d=f[c], e=a.substr(g, a.indexOf(d, g) - g), g +=e.length + d.length, d=ka(d, b), 3===d.length&&d.push(1), h +=e + (b ? "hsla(" + d[0] + "," + d[1] + "%," + d[2] + "%," + d[3]:"rgba(" + d.join(",")) + ")";
}return h + a.substr(g);
},
ma="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3}){1,2}\\b";for (j in ia){
ma +="|" + j + "\\b";
}ma=new RegExp(ma + ")", "gi"), g.colorStringFilter=function (a){
var b,
c=a[0] + a[1];ma.test(c)&&(b=-1!==c.indexOf("hsl(")||-1!==c.indexOf("hsla("), a[0]=la(a[0], b), a[1]=la(a[1], b)), ma.lastIndex=0;
}, b.defaultStringFilter||(b.defaultStringFilter=g.colorStringFilter);var na=function (a, b, c, d){
if(null==a) return function (a){
return a;
};var e,
f=b ? (a.match(ma)||[""])[0]:"",
g=a.split(f).join("").match(s)||[],
h=a.substr(0, a.indexOf(g[0])),
i=")"===a.charAt(a.length - 1) ? ")":"",
j=-1!==a.indexOf(" ") ? " ":",",
k=g.length,
l=k > 0 ? g[0].replace(q, ""):"";return k ? e=b ? function (a){
var b, m, n, o;if("number"==typeof a) a +=l;else if(d&&G.test(a)){
for (o=a.replace(G, "|").split("|"), n=0; n < o.length; n++){
o[n]=e(o[n]);
}return o.join(",");
}if(b=(a.match(ma)||[f])[0], m=a.split(b).join("").match(s)||[], n=m.length, k > n--) for (; ++n < k;){
m[n]=c ? m[(n - 1) / 2 | 0]:g[n];
}return h + m.join(j) + j + b + i + (-1!==a.indexOf("inset") ? " inset":"");
}:function (a){
var b, f, m;if("number"==typeof a) a +=l;else if(d&&G.test(a)){
for (f=a.replace(G, "|").split("|"), m=0; m < f.length; m++){
f[m]=e(f[m]);
}return f.join(",");
}if(b=a.match(s)||[], m=b.length, k > m--) for (; ++m < k;){
b[m]=c ? b[(m - 1) / 2 | 0]:g[m];
}return h + b.join(j) + i;
}:function (a){
return a;
};},
oa=function (a){
return a=a.split(","), function (b, c, d, e, f, g, h){
var i,
j=(c + "").split(" ");for (h={}, i=0; 4 > i; i++){
h[a[i]]=j[i]=j[i]||j[(i - 1) / 2 >> 0];
}return e.parse(b, h, f, g);
};},
pa=(P._setPluginRatio=function (a){
this.plugin.setRatio(a);for (var b, c, d, e, f, g=this.data, h=g.proxy, i=g.firstMPT, j=1e-6; i;){
b=h[i.v], i.r ? b=Math.round(b):j > b&&b > -j&&(b=0), i.t[i.p]=b, i=i._next;
}if(g.autoRotate&&(g.autoRotate.rotation=h.rotation), 1===a||0===a) for (i=g.firstMPT, f=1===a ? "e":"b"; i;){
if(c=i.t, c.type){
if(1===c.type){
for (e=c.xs0 + c.s + c.xs1, d=1; d < c.l; d++){
e +=c["xn" + d] + c["xs" + (d + 1)];
}c[f]=e;
}} else c[f]=c.s + c.xs0;i=i._next;
}}, function (a, b, c, d, e){
this.t=a, this.p=b, this.v=c, this.r=e, d&&(d._prev=this, this._next=d);
}),
qa=(P._parseToProxy=function (a, b, c, d, e, f){
var g,
h,
i,
j,
k,
l=d,
m={},
n={},
o=c._transform,
p=K;for (c._transform=null, K=b, d=k = c.parse(a, b, d, e), K=p, f&&(c._transform=o, l&&(l._prev=null, l._prev&&(l._prev._next=null))); d&&d!==l;){
if(d.type <=1&&(h=d.p, n[h]=d.s + d.c, m[h]=d.s, f||(j=new pa(d, "s", h, j, d.r), d.c=0), 1===d.type)) for (g=d.l; --g > 0;){
i="xn" + g, h=d.p + "_" + i, n[h]=d.data[i], m[h]=d[i], f||(j=new pa(d, i, h, j, d.rxp[i]));
}d=d._next;
}return { proxy: m, end: n, firstMPT: j, pt: k };}, P.CSSPropTween=function (a, b, d, e, g, h, i, j, k, l, m){
this.t=a, this.p=b, this.s=d, this.c=e, this.n=i||b, a instanceof qa||f.push(this.n), this.r=j, this.type=h||0, k&&(this.pr=k, c = !0), this.b=void 0===l ? d:l, this.e=void 0===m ? d + e:m, g&&(this._next=g, g._prev=this);
}),
ra=function (a, b, c, d, e, f){
var g=new qa(a, b, c, d - c, e, -1, f);return g.b=c, g.e=g.xs0=d, g;
},
sa=g.parseComplex=function (a, b, c, d, e, f, h, i, j, l){
c=c||f || "", h=new qa(a, b, 0, 0, h, l ? 2:1, null, !1, i, c, d), d +="", e&&ma.test(d + c)&&(d=[c, d], g.colorStringFilter(d), c=d[0], d=d[1]);var m,
n,
o,
p,
s,
t,
u,
v,
w,
x,
y,
z,
A,
B=c.split(", ").join(",").split(" "),
C=d.split(", ").join(",").split(" "),
D=B.length,
E=k!==!1;for ((-1!==d.indexOf(",")||-1!==c.indexOf(","))&&(B=B.join(" ").replace(G, ", ").split(" "), C=C.join(" ").replace(G, ", ").split(" "), D=B.length), D!==C.length&&(B=(f||"").split(" "), D=B.length), h.plugin=j, h.setRatio=l, ma.lastIndex=0, m=0; D > m; m++){
if(p=B[m], s=C[m], v=parseFloat(p), v||0===v) h.appendXtra("", v, fa(s, v), s.replace(r, ""), E&&-1!==s.indexOf("px"), !0);else if(e&&ma.test(p)) z=s.indexOf(")") + 1, z=")" + (z ? s.substr(z):""), A=-1!==s.indexOf("hsl")&&R, p=ka(p, A), s=ka(s, A), w=p.length + s.length > 6, w&&!R&&0===s[3] ? (h["xs" + h.l] +=h.l ? " transparent":"transparent", h.e=h.e.split(C[m]).join("transparent")):(R||(w = !1), A ? h.appendXtra(w ? "hsla(":"hsl(", p[0], fa(s[0], p[0]), ",", !1, !0).appendXtra("", p[1], fa(s[1], p[1]), "%,", !1).appendXtra("", p[2], fa(s[2], p[2]), w ? "%,":"%" + z, !1):h.appendXtra(w ? "rgba(":"rgb(", p[0], s[0] - p[0], ",", !0, !0).appendXtra("", p[1], s[1] - p[1], ",", !0).appendXtra("", p[2], s[2] - p[2], w ? ",":z, !0), w&&(p=p.length < 4 ? 1:p[3], h.appendXtra("", p, (s.length < 4 ? 1:s[3]) - p, z, !1))), ma.lastIndex=0;else if(t=p.match(q)){
if(u=s.match(r), !u||u.length!==t.length) return h;for (o=0, n=0; n < t.length; n++){
y=t[n], x=p.indexOf(y, o), h.appendXtra(p.substr(o, x - o), Number(y), fa(u[n], y), "", E&&"px"===p.substr(x + y.length, 2), 0===n), o=x + y.length;
}h["xs" + h.l] +=p.substr(o);
} else h["xs" + h.l] +=h.l||h["xs" + h.l] ? " " + s:s;
}if(-1!==d.indexOf("=")&&h.data){
for (z=h.xs0 + h.data.s, m=1; m < h.l; m++){
z +=h["xs" + m] + h.data["xn" + m];
}h.e=z + h["xs" + m];
}return h.l||(h.type=-1, h.xs0=h.e), h.xfirst||h;
},
ta=9;for (j=qa.prototype, j.l=j.pr=0; --ta > 0;){
j["xn" + ta]=0, j["xs" + ta]="";
}j.xs0="", j._next=j._prev=j.xfirst=j.data=j.plugin=j.setRatio=j.rxp=null, j.appendXtra=function (a, b, c, d, e, f){
var g=this,
h=g.l;return g["xs" + h] +=f&&(h||g["xs" + h]) ? " " + a:a||"", c||0===h||g.plugin ? (g.l++, g.type=g.setRatio ? 2:1, g["xs" + g.l]=d||"", h > 0 ? (g.data["xn" + h]=b + c, g.rxp["xn" + h]=e, g["xn" + h]=b, g.plugin||(g.xfirst=new qa(g, "xn" + h, b, c, g.xfirst||g, 0, g.n, e, g.pr), g.xfirst.xs0=0), g):(g.data={ s: b + c }, g.rxp={}, g.s=b, g.c=c, g.r=e, g)):(g["xs" + h] +=b + (d||""), g);
};var ua=function (a, b){
b=b||{}, this.p=b.prefix ? W(a)||a:a, i[a]=i[this.p]=this, this.format=b.formatter||na(b.defaultValue, b.color, b.collapsible, b.multi), b.parser&&(this.parse=b.parser), this.clrs=b.color, this.multi=b.multi, this.keyword=b.keyword, this.dflt=b.defaultValue, this.pr=b.priority||0;
},
va=P._registerComplexSpecialProp=function (a, b, c){
"object"!=typeof b&&(b={ parser: c });var d,
e,
f=a.split(","),
g=b.defaultValue;for (c=c||[g], d=0; d < f.length; d++){
b.prefix=0===d&&b.prefix, b.defaultValue=c[d]||g, e=new ua(f[d], b);
}},
wa=function (a){
if(!i[a]){
var b=a.charAt(0).toUpperCase() + a.substr(1) + "Plugin";va(a, { parser: function (a, c, d, e, f, g, j){
var k=h.com.greensock.plugins[b];return k ? (k._cssRegister(), i[d].parse(a, c, d, e, f, g, j)):(T("Error: " + b + " js file not loaded."), f);
}});
}};j=ua.prototype, j.parseComplex=function (a, b, c, d, e, f){
var g,
h,
i,
j,
k,
l,
m=this.keyword;if(this.multi&&(G.test(c)||G.test(b) ? (h=b.replace(G, "|").split("|"), i=c.replace(G, "|").split("|")):m&&(h=[b], i=[c])), i){
for (j=i.length > h.length ? i.length:h.length, g=0; j > g; g++){
b=h[g]=h[g]||this.dflt, c=i[g]=i[g]||this.dflt, m&&(k=b.indexOf(m), l=c.indexOf(m), k!==l&&(-1===l ? h[g]=h[g].split(m).join(""):-1===k&&(h[g] +=" " + m)));
}b=h.join(", "), c=i.join(", ");
}return sa(a, this.p, b, c, this.clrs, this.dflt, d, this.pr, e, f);
}, j.parse=function (a, b, c, d, f, g, h){
return this.parseComplex(a.style, this.format(Y(a, this.p, e, !1, this.dflt)), this.format(b), f, g);
}, g.registerSpecialProp=function (a, b, c){
va(a, { parser: function (a, d, e, f, g, h, i){
var j=new qa(a, e, 0, 0, g, 2, e, !1, c);return j.plugin=h, j.setRatio=b(a, d, f._tween, e), j;
}, priority: c });
}, g.useSVGTransformAttr=m||n;var xa,
ya="scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent".split(","),
za=W("transform"),
Aa=U + "transform",
Ba=W("transformOrigin"),
Ca=null!==W("perspective"),
Da=P.Transform=function (){
this.perspective=parseFloat(g.defaultTransformPerspective)||0, this.force3D=g.defaultForce3D!==!1&&Ca ? g.defaultForce3D||"auto":!1;
},
Ea=window.SVGElement,
Fa=function (a, b, c){
var d,
e=L.createElementNS("http://www.w3.org/2000/svg", a),
f=/([a-z])([A-Z])/g;for (d in c){
e.setAttributeNS(null, d.replace(f, "$1-$2").toLowerCase(), c[d]);
}return b.appendChild(e), e;
},
Ga=L.documentElement,
Ha=function (){
var a,
b,
c,
d=p||/Android/i.test(Q)&&!window.chrome;return L.createElementNS&&!d&&(a=Fa("svg", Ga), b=Fa("rect", a, { width: 100, height: 50, x: 100 }), c=b.getBoundingClientRect().width, b.style[Ba]="50% 50%", b.style[za]="scaleX(0.5)", d=c===b.getBoundingClientRect().width&&!(n&&Ca), Ga.removeChild(a)), d;
}(),
Ia=function (a, b, c, d, e, f){
var h,
i,
j,
k,
l,
m,
n,
o,
p,
q,
r,
s,
t,
u,
v=a._gsTransform,
w=Ma(a, !0);v&&(t=v.xOrigin, u=v.yOrigin), (!d||(h=d.split(" ")).length < 2)&&(n=a.getBBox(), b=ea(b).split(" "), h=[(-1!==b[0].indexOf("%") ? parseFloat(b[0]) / 100 * n.width:parseFloat(b[0])) + n.x, (-1!==b[1].indexOf("%") ? parseFloat(b[1]) / 100 * n.height:parseFloat(b[1])) + n.y]), c.xOrigin=k = parseFloat(h[0]), c.yOrigin=l = parseFloat(h[1]), d&&w!==La&&(m=w[0], n=w[1], o=w[2], p=w[3], q=w[4], r=w[5], s=m * p - n * o, i=k * (p / s) + l * (-o / s) + (o * r - p * q) / s, j=k * (-n / s) + l * (m / s) - (m * r - n * q) / s, k=c.xOrigin=h[0]=i, l=c.yOrigin=h[1]=j), v&&(f&&(c.xOffset=v.xOffset, c.yOffset=v.yOffset, v=c), e||e!==!1&&g.defaultSmoothOrigin!==!1 ? (i=k - t, j=l - u, v.xOffset +=i * w[0] + j * w[2] - i, v.yOffset +=i * w[1] + j * w[3] - j):v.xOffset=v.yOffset=0), f||a.setAttribute("data-svg-origin", h.join(" "));
},
Ja=function (a){
try {
return a.getBBox();
} catch (a){}},
Ka=function (a){
return !!(Ea&&a.getBBox&&a.getCTM&&Ja(a)&&(!a.parentNode||a.parentNode.getBBox&&a.parentNode.getCTM));
},
La=[1, 0, 0, 1, 0, 0],
Ma=function (a, b){
var c,
d,
e,
f,
g,
h,
i=a._gsTransform||new Da(),
j=1e5,
k=a.style;if(za ? d=Y(a, Aa, null, !0):a.currentStyle&&(d=a.currentStyle.filter.match(E), d=d&&4===d.length ? [d[0].substr(4), Number(d[2].substr(4)), Number(d[1].substr(4)), d[3].substr(4), i.x||0, i.y||0].join(","):""), c = !d||"none"===d||"matrix(1, 0, 0, 1, 0, 0)"===d, c&&za&&((h="none"===X(a).display)||!a.parentNode)&&(h&&(f=k.display, k.display="block"), a.parentNode||(g=1, Ga.appendChild(a)), d=Y(a, Aa, null, !0), c = !d||"none"===d||"matrix(1, 0, 0, 1, 0, 0)"===d, f ? k.display=f:h&&Ra(k, "display"), g&&Ga.removeChild(a)), (i.svg||a.getBBox&&Ka(a))&&(c&&-1!==(k[za] + "").indexOf("matrix")&&(d=k[za], c=0), e=a.getAttribute("transform"), c&&e && (-1!==e.indexOf("matrix") ? (d=e, c=0):-1!==e.indexOf("translate")&&(d="matrix(1,0,0,1," + e.match(/(?:\-|\b)[\d\-\.e]+\b/gi).join(",") + ")", c=0))), c) return La;for (e=(d||"").match(q)||[], ta=e.length; --ta > -1;){
f=Number(e[ta]), e[ta]=(g=f - (f |=0)) ? (g * j + (0 > g ? -.5 : .5) | 0) / j + f:f;
}return b&&e.length > 6 ? [e[0], e[1], e[4], e[5], e[12], e[13]]:e;
},
Na=P.getTransform=function (a, c, d, e){
if(a._gsTransform&&d && !e) return a._gsTransform;var f,
h,
i,
j,
k,
l,
m=d ? a._gsTransform||new Da():new Da(),
n=m.scaleX < 0,
o=2e-5,
p=1e5,
q=Ca ? parseFloat(Y(a, Ba, c, !1, "0 0 0").split(" ")[2])||m.zOrigin||0:0,
r=parseFloat(g.defaultTransformPerspective)||0;if(m.svg = !(!a.getBBox||!Ka(a)), m.svg&&(Ia(a, Y(a, Ba, c, !1, "50% 50%") + "", m, a.getAttribute("data-svg-origin")), xa=g.useSVGTransformAttr||Ha), f=Ma(a), f!==La){
if(16===f.length){
var s,
t,
u,
v,
w,
x=f[0],
y=f[1],
z=f[2],
A=f[3],
B=f[4],
C=f[5],
D=f[6],
E=f[7],
F=f[8],
G=f[9],
H=f[10],
I=f[12],
K=f[13],
L=f[14],
M=f[11],
N=Math.atan2(D, H);m.zOrigin&&(L=-m.zOrigin, I=F * L - f[12], K=G * L - f[13], L=H * L + m.zOrigin - f[14]), m.rotationX=N * J, N&&(v=Math.cos(-N), w=Math.sin(-N), s=B * v + F * w, t=C * v + G * w, u=D * v + H * w, F=B * -w + F * v, G=C * -w + G * v, H=D * -w + H * v, M=E * -w + M * v, B=s, C=t, D=u), N=Math.atan2(-z, H), m.rotationY=N * J, N&&(v=Math.cos(-N), w=Math.sin(-N), s=x * v - F * w, t=y * v - G * w, u=z * v - H * w, G=y * w + G * v, H=z * w + H * v, M=A * w + M * v, x=s, y=t, z=u), N=Math.atan2(y, x), m.rotation=N * J, N&&(v=Math.cos(-N), w=Math.sin(-N), x=x * v + B * w, t=y * v + C * w, C=y * -w + C * v, D=z * -w + D * v, y=t), m.rotationX&&Math.abs(m.rotationX) + Math.abs(m.rotation) > 359.9&&(m.rotationX=m.rotation=0, m.rotationY=180 - m.rotationY), m.scaleX=(Math.sqrt(x * x + y * y) * p + .5 | 0) / p, m.scaleY=(Math.sqrt(C * C + G * G) * p + .5 | 0) / p, m.scaleZ=(Math.sqrt(D * D + H * H) * p + .5 | 0) / p, m.rotationX||m.rotationY ? m.skewX=0:(m.skewX=B||C ? Math.atan2(B, C) * J + m.rotation:m.skewX||0, Math.abs(m.skewX) > 90&&Math.abs(m.skewX) < 270&&(n ? (m.scaleX *=-1, m.skewX +=m.rotation <=0 ? 180:-180, m.rotation +=m.rotation <=0 ? 180:-180):(m.scaleY *=-1, m.skewX +=m.skewX <=0 ? 180:-180))), m.perspective=M ? 1 / (0 > M ? -M:M):0, m.x=I, m.y=K, m.z=L, m.svg&&(m.x -=m.xOrigin - (m.xOrigin * x - m.yOrigin * B), m.y -=m.yOrigin - (m.yOrigin * y - m.xOrigin * C));
}else if(!Ca||e || !f.length||m.x!==f[4]||m.y!==f[5]||!m.rotationX&&!m.rotationY){
var O=f.length >=6,
P=O ? f[0]:1,
Q=f[1]||0,
R=f[2]||0,
S=O ? f[3]:1;m.x=f[4]||0, m.y=f[5]||0, i=Math.sqrt(P * P + Q * Q), j=Math.sqrt(S * S + R * R), k=P||Q ? Math.atan2(Q, P) * J:m.rotation||0, l=R||S ? Math.atan2(R, S) * J + k:m.skewX||0, Math.abs(l) > 90&&Math.abs(l) < 270&&(n ? (i *=-1, l +=0 >=k ? 180:-180, k +=0 >=k ? 180:-180):(j *=-1, l +=0 >=l ? 180:-180)), m.scaleX=i, m.scaleY=j, m.rotation=k, m.skewX=l, Ca&&(m.rotationX=m.rotationY=m.z=0, m.perspective=r, m.scaleZ=1), m.svg&&(m.x -=m.xOrigin - (m.xOrigin * P + m.yOrigin * R), m.y -=m.yOrigin - (m.xOrigin * Q + m.yOrigin * S));
}m.zOrigin=q;for (h in m){
m[h] < o&&m[h] > -o&&(m[h]=0);
}}return d&&(a._gsTransform=m, m.svg&&(xa&&a.style[za] ? b.delayedCall(.001, function (){
Ra(a.style, za);
}):!xa&&a.getAttribute("transform")&&b.delayedCall(.001, function (){
a.removeAttribute("transform");
}))), m;
},
Oa=function (a){
var b,
c,
d=this.data,
e=-d.rotation * I,
f=e + d.skewX * I,
g=1e5,
h=(Math.cos(e) * d.scaleX * g | 0) / g,
i=(Math.sin(e) * d.scaleX * g | 0) / g,
j=(Math.sin(f) * -d.scaleY * g | 0) / g,
k=(Math.cos(f) * d.scaleY * g | 0) / g,
l=this.t.style,
m=this.t.currentStyle;if(m){
c=i, i=-j, j=-c, b=m.filter, l.filter="";var n,
o,
q=this.t.offsetWidth,
r=this.t.offsetHeight,
s="absolute"!==m.position,
t="progid:DXImageTransform.Microsoft.Matrix(M11=" + h + ", M12=" + i + ", M21=" + j + ", M22=" + k,
w=d.x + q * d.xPercent / 100,
x=d.y + r * d.yPercent / 100;if(null!=d.ox&&(n=(d.oxp ? q * d.ox * .01:d.ox) - q / 2, o=(d.oyp ? r * d.oy * .01:d.oy) - r / 2, w +=n - (n * h + o * i), x +=o - (n * j + o * k)), s ? (n=q / 2, o=r / 2, t +=", Dx=" + (n - (n * h + o * i) + w) + ", Dy=" + (o - (n * j + o * k) + x) + ")"):t +=", sizingMethod='auto expand')", -1!==b.indexOf("DXImageTransform.Microsoft.Matrix(") ? l.filter=b.replace(F, t):l.filter=t + " " + b, (0===a||1===a)&&1===h&&0===i&&0===j&&1===k&&(s&&-1===t.indexOf("Dx=0, Dy=0")||v.test(b)&&100!==parseFloat(RegExp.$1)||-1===b.indexOf(b.indexOf("Alpha"))&&l.removeAttribute("filter")), !s){
var y,
z,
A,
B=8 > p ? 1:-1;for (n=d.ieOffsetX||0, o=d.ieOffsetY||0, d.ieOffsetX=Math.round((q - ((0 > h ? -h:h) * q + (0 > i ? -i:i) * r)) / 2 + w), d.ieOffsetY=Math.round((r - ((0 > k ? -k:k) * r + (0 > j ? -j:j) * q)) / 2 + x), ta=0; 4 > ta; ta++){
z=ca[ta], y=m[z], c=-1!==y.indexOf("px") ? parseFloat(y):Z(this.t, z, parseFloat(y), y.replace(u, ""))||0, A=c!==d[z] ? 2 > ta ? -d.ieOffsetX:-d.ieOffsetY:2 > ta ? n - d.ieOffsetX:o - d.ieOffsetY, l[z]=(d[z]=Math.round(c - A * (0===ta||2===ta ? 1:B))) + "px";
}}
}},
Pa=P.set3DTransformRatio=P.setTransformRatio=function (a){
var b,
c,
d,
e,
f,
g,
h,
i,
j,
k,
l,
m,
o,
p,
q,
r,
s,
t,
u,
v,
w,
x,
y,
z=this.data,
A=this.t.style,
B=z.rotation,
C=z.rotationX,
D=z.rotationY,
E=z.scaleX,
F=z.scaleY,
G=z.scaleZ,
H=z.x,
J=z.y,
K=z.z,
L=z.svg,
M=z.perspective,
N=z.force3D;if(((1===a||0===a)&&"auto"===N&&(this.tween._totalTime===this.tween._totalDuration||!this.tween._totalTime)||!N)&&!K&&!M&&!D&&!C&&1===G||xa&&L||!Ca) return void (B||z.skewX||L ? (B *=I, x=z.skewX * I, y=1e5, b=Math.cos(B) * E, e=Math.sin(B) * E, c=Math.sin(B - x) * -F, f=Math.cos(B - x) * F, x&&"simple"===z.skewType&&(s=Math.tan(x), s=Math.sqrt(1 + s * s), c *=s, f *=s, z.skewY&&(b *=s, e *=s)), L&&(H +=z.xOrigin - (z.xOrigin * b + z.yOrigin * c) + z.xOffset, J +=z.yOrigin - (z.xOrigin * e + z.yOrigin * f) + z.yOffset, xa&&(z.xPercent||z.yPercent)&&(p=this.t.getBBox(), H +=.01 * z.xPercent * p.width, J +=.01 * z.yPercent * p.height), p=1e-6, p > H&&H > -p&&(H=0), p > J&&J > -p&&(J=0)), u=(b * y | 0) / y + "," + (e * y | 0) / y + "," + (c * y | 0) / y + "," + (f * y | 0) / y + "," + H + "," + J + ")", L&&xa ? this.t.setAttribute("transform", "matrix(" + u):A[za]=(z.xPercent||z.yPercent ? "translate(" + z.xPercent + "%," + z.yPercent + "%) matrix(":"matrix(") + u):A[za]=(z.xPercent||z.yPercent ? "translate(" + z.xPercent + "%," + z.yPercent + "%) matrix(":"matrix(") + E + ",0,0," + F + "," + H + "," + J + ")");if(n&&(p=1e-4, p > E&&E > -p&&(E=G = 2e-5), p > F&&F > -p&&(F=G = 2e-5), !M||z.z||z.rotationX||z.rotationY||(M=0)), B||z.skewX) B *=I, q=b = Math.cos(B), r=e = Math.sin(B), z.skewX&&(B -=z.skewX * I, q=Math.cos(B), r=Math.sin(B), "simple"===z.skewType&&(s=Math.tan(z.skewX * I), s=Math.sqrt(1 + s * s), q *=s, r *=s, z.skewY&&(b *=s, e *=s))), c=-r, f=q;else {
if(!(D||C || 1!==G||M || L)) return void (A[za]=(z.xPercent||z.yPercent ? "translate(" + z.xPercent + "%," + z.yPercent + "%) translate3d(":"translate3d(") + H + "px," + J + "px," + K + "px)" + (1!==E||1!==F ? " scale(" + E + "," + F + ")":""));b=f = 1, c=e = 0;
}j=1, d=g = h=i = k=l = 0, m=M ? -1 / M:0, o=z.zOrigin, p=1e-6, v=",", w="0", B=D * I, B&&(q=Math.cos(B), r=Math.sin(B), h=-r, k=m * -r, d=b * r, g=e * r, j=q, m *=q, b *=q, e *=q), B=C * I, B&&(q=Math.cos(B), r=Math.sin(B), s=c * q + d * r, t=f * q + g * r, i=j * r, l=m * r, d=c * -r + d * q, g=f * -r + g * q, j *=q, m *=q, c=s, f=t), 1!==G&&(d *=G, g *=G, j *=G, m *=G), 1!==F&&(c *=F, f *=F, i *=F, l *=F), 1!==E&&(b *=E, e *=E, h *=E, k *=E), (o||L)&&(o&&(H +=d * -o, J +=g * -o, K +=j * -o + o), L&&(H +=z.xOrigin - (z.xOrigin * b + z.yOrigin * c) + z.xOffset, J +=z.yOrigin - (z.xOrigin * e + z.yOrigin * f) + z.yOffset), p > H&&H > -p&&(H=w), p > J&&J > -p&&(J=w), p > K&&K > -p&&(K=0)), u=z.xPercent||z.yPercent ? "translate(" + z.xPercent + "%," + z.yPercent + "%) matrix3d(":"matrix3d(", u +=(p > b&&b > -p ? w:b) + v + (p > e&&e > -p ? w:e) + v + (p > h&&h > -p ? w:h), u +=v + (p > k&&k > -p ? w:k) + v + (p > c&&c > -p ? w:c) + v + (p > f&&f > -p ? w:f), C||D || 1!==G ? (u +=v + (p > i&&i > -p ? w:i) + v + (p > l&&l > -p ? w:l) + v + (p > d&&d > -p ? w:d), u +=v + (p > g&&g > -p ? w:g) + v + (p > j&&j > -p ? w:j) + v + (p > m&&m > -p ? w:m) + v):u +=",0,0,0,0,1,0,", u +=H + v + J + v + K + v + (M ? 1 + -K / M:1) + ")", A[za]=u;
};j=Da.prototype, j.x=j.y=j.z=j.skewX=j.skewY=j.rotation=j.rotationX=j.rotationY=j.zOrigin=j.xPercent=j.yPercent=j.xOffset=j.yOffset=0, j.scaleX=j.scaleY=j.scaleZ=1, va("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,svgOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent,smoothOrigin", { parser: function (a, b, c, d, f, h, i){
if(d._lastParsedTransform===i) return f;d._lastParsedTransform=i;var j,
k,
l,
m,
n,
o,
p,
q,
r,
s=a._gsTransform,
t=a.style,
u=1e-6,
v=ya.length,
w=i,
x={},
y="transformOrigin",
z=Na(a, e, !0, i.parseTransform);if(d._transform=z, "string"==typeof w.transform&&za) k=N.style, k[za]=w.transform, k.display="block", k.position="absolute", L.body.appendChild(N), j=Na(N, null, !1), z.svg&&(p=z.xOrigin, q=z.yOrigin, j.x -=z.xOffset, j.y -=z.yOffset, (w.transformOrigin||w.svgOrigin)&&(l={}, Ia(a, ea(w.transformOrigin), l, w.svgOrigin, w.smoothOrigin, !0), p=l.xOrigin, q=l.yOrigin, j.x -=l.xOffset - z.xOffset, j.y -=l.yOffset - z.yOffset), (p||q)&&(r=Ma(N, !0), j.x -=p - (p * r[0] + q * r[2]), j.y -=q - (p * r[1] + q * r[3]))), L.body.removeChild(N), j.perspective||(j.perspective=z.perspective), null!=w.xPercent&&(j.xPercent=ga(w.xPercent, z.xPercent)), null!=w.yPercent&&(j.yPercent=ga(w.yPercent, z.yPercent));else if("object"==typeof w){
if(j={ scaleX: ga(null!=w.scaleX ? w.scaleX:w.scale, z.scaleX), scaleY: ga(null!=w.scaleY ? w.scaleY:w.scale, z.scaleY), scaleZ: ga(w.scaleZ, z.scaleZ), x: ga(w.x, z.x), y: ga(w.y, z.y), z: ga(w.z, z.z), xPercent: ga(w.xPercent, z.xPercent), yPercent: ga(w.yPercent, z.yPercent), perspective: ga(w.transformPerspective, z.perspective) }, o=w.directionalRotation, null!=o) if("object"==typeof o) for (k in o){
w[k]=o[k];
} else w.rotation=o;"string"==typeof w.x&&-1!==w.x.indexOf("%")&&(j.x=0, j.xPercent=ga(w.x, z.xPercent)), "string"==typeof w.y&&-1!==w.y.indexOf("%")&&(j.y=0, j.yPercent=ga(w.y, z.yPercent)), j.rotation=ha("rotation" in w ? w.rotation:"shortRotation" in w ? w.shortRotation + "_short":"rotationZ" in w ? w.rotationZ:z.rotation - z.skewY, z.rotation - z.skewY, "rotation", x), Ca&&(j.rotationX=ha("rotationX" in w ? w.rotationX:"shortRotationX" in w ? w.shortRotationX + "_short":z.rotationX||0, z.rotationX, "rotationX", x), j.rotationY=ha("rotationY" in w ? w.rotationY:"shortRotationY" in w ? w.shortRotationY + "_short":z.rotationY||0, z.rotationY, "rotationY", x)), j.skewX=ha(w.skewX, z.skewX - z.skewY), (j.skewY=ha(w.skewY, z.skewY))&&(j.skewX +=j.skewY, j.rotation +=j.skewY);
}for (Ca&&null!=w.force3D&&(z.force3D=w.force3D, n = !0), z.skewType=w.skewType||z.skewType||g.defaultSkewType, m=z.force3D||z.z||z.rotationX||z.rotationY||j.z||j.rotationX||j.rotationY||j.perspective, m||null==w.scale||(j.scaleZ=1); --v > -1;){
c=ya[v], l=j[c] - z[c], (l > u||-u > l||null!=w[c]||null!=K[c])&&(n = !0, f=new qa(z, c, z[c], l, f), c in x&&(f.e=x[c]), f.xs0=0, f.plugin=h, d._overwriteProps.push(f.n));
}return l=w.transformOrigin, z.svg&&(l||w.svgOrigin)&&(p=z.xOffset, q=z.yOffset, Ia(a, ea(l), j, w.svgOrigin, w.smoothOrigin), f=ra(z, "xOrigin", (s ? z:j).xOrigin, j.xOrigin, f, y), f=ra(z, "yOrigin", (s ? z:j).yOrigin, j.yOrigin, f, y), (p!==z.xOffset||q!==z.yOffset)&&(f=ra(z, "xOffset", s ? p:z.xOffset, z.xOffset, f, y), f=ra(z, "yOffset", s ? q:z.yOffset, z.yOffset, f, y)), l=xa ? null:"0px 0px"), (l||Ca&&m && z.zOrigin)&&(za ? (n = !0, c=Ba, l=(l||Y(a, c, e, !1, "50% 50%")) + "", f=new qa(t, c, 0, 0, f, -1, y), f.b=t[c], f.plugin=h, Ca ? (k=z.zOrigin, l=l.split(" "), z.zOrigin=(l.length > 2&&(0===k||"0px"!==l[2]) ? parseFloat(l[2]):k)||0, f.xs0=f.e=l[0] + " " + (l[1]||"50%") + " 0px", f=new qa(z, "zOrigin", 0, 0, f, -1, f.n), f.b=k, f.xs0=f.e=z.zOrigin):f.xs0=f.e=l):ea(l + "", z)), n&&(d._transformType=z.svg&&xa||!m&&3!==this._transformType ? 2:3), f;
}, prefix: !0 }), va("boxShadow", { defaultValue: "0px 0px 0px 0px #999", prefix: !0, color: !0, multi: !0, keyword: "inset" }), va("borderRadius", { defaultValue: "0px", parser: function (a, b, c, f, g, h){
b=this.format(b);var i,
j,
k,
l,
m,
n,
o,
p,
q,
r,
s,
t,
u,
v,
w,
x,
y=["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"],
z=a.style;for (q=parseFloat(a.offsetWidth), r=parseFloat(a.offsetHeight), i=b.split(" "), j=0; j < y.length; j++){
this.p.indexOf("border")&&(y[j]=W(y[j])), m=l = Y(a, y[j], e, !1, "0px"), -1!==m.indexOf(" ")&&(l=m.split(" "), m=l[0], l=l[1]), n=k = i[j], o=parseFloat(m), t=m.substr((o + "").length), u="="===n.charAt(1), u ? (p=parseInt(n.charAt(0) + "1", 10), n=n.substr(2), p *=parseFloat(n), s=n.substr((p + "").length - (0 > p ? 1:0))||""):(p=parseFloat(n), s=n.substr((p + "").length)), ""===s&&(s=d[c]||t), s!==t&&(v=Z(a, "borderLeft", o, t), w=Z(a, "borderTop", o, t), "%"===s ? (m=v / q * 100 + "%", l=w / r * 100 + "%"):"em"===s ? (x=Z(a, "borderLeft", 1, "em"), m=v / x + "em", l=w / x + "em"):(m=v + "px", l=w + "px"), u&&(n=parseFloat(m) + p + s, k=parseFloat(l) + p + s)), g=sa(z, y[j], m + " " + l, n + " " + k, !1, "0px", g);
}return g;
}, prefix: !0, formatter: na("0px 0px 0px 0px", !1, !0) }), va("borderBottomLeftRadius,borderBottomRightRadius,borderTopLeftRadius,borderTopRightRadius", { defaultValue: "0px", parser: function (a, b, c, d, f, g){
return sa(a.style, c, this.format(Y(a, c, e, !1, "0px 0px")), this.format(b), !1, "0px", f);
}, prefix: !0, formatter: na("0px 0px", !1, !0) }), va("backgroundPosition", { defaultValue: "0 0", parser: function (a, b, c, d, f, g){
var h,
i,
j,
k,
l,
m,
n="background-position",
o=e||X(a, null),
q=this.format((o ? p ? o.getPropertyValue(n + "-x") + " " + o.getPropertyValue(n + "-y"):o.getPropertyValue(n):a.currentStyle.backgroundPositionX + " " + a.currentStyle.backgroundPositionY)||"0 0"),
r=this.format(b);if(-1!==q.indexOf("%")!=(-1!==r.indexOf("%"))&&r.split(",").length < 2&&(m=Y(a, "backgroundImage").replace(B, ""), m&&"none"!==m)){
for (h=q.split(" "), i=r.split(" "), O.setAttribute("src", m), j=2; --j > -1;){
q=h[j], k=-1!==q.indexOf("%"), k!==(-1!==i[j].indexOf("%"))&&(l=0===j ? a.offsetWidth - O.width:a.offsetHeight - O.height, h[j]=k ? parseFloat(q) / 100 * l + "px":parseFloat(q) / l * 100 + "%");
}q=h.join(" ");
}return this.parseComplex(a.style, q, r, f, g);
}, formatter: ea }), va("backgroundSize", { defaultValue: "0 0", formatter: ea }), va("perspective", { defaultValue: "0px", prefix: !0 }), va("perspectiveOrigin", { defaultValue: "50% 50%", prefix: !0 }), va("transformStyle", { prefix: !0 }), va("backfaceVisibility", { prefix: !0 }), va("userSelect", { prefix: !0 }), va("margin", { parser: oa("marginTop,marginRight,marginBottom,marginLeft") }), va("padding", { parser: oa("paddingTop,paddingRight,paddingBottom,paddingLeft") }), va("clip", { defaultValue: "rect(0px,0px,0px,0px)", parser: function (a, b, c, d, f, g){
var h, i, j;return 9 > p ? (i=a.currentStyle, j=8 > p ? " ":",", h="rect(" + i.clipTop + j + i.clipRight + j + i.clipBottom + j + i.clipLeft + ")", b=this.format(b).split(",").join(j)):(h=this.format(Y(a, this.p, e, !1, this.dflt)), b=this.format(b)), this.parseComplex(a.style, h, b, f, g);
}}), va("textShadow", { defaultValue: "0px 0px 0px #999", color: !0, multi: !0 }), va("autoRound,strictUnits", { parser: function (a, b, c, d, e){
return e;
}}), va("border", { defaultValue: "0px solid #000", parser: function (a, b, c, d, f, g){
var h=Y(a, "borderTopWidth", e, !1, "0px"),
i=this.format(b).split(" "),
j=i[0].replace(u, "");return "px"!==j&&(h=parseFloat(h) / Z(a, "borderTopWidth", 1, j) + j), this.parseComplex(a.style, this.format(h + " " + Y(a, "borderTopStyle", e, !1, "solid") + " " + Y(a, "borderTopColor", e, !1, "#000")), i.join(" "), f, g);
}, color: !0, formatter: function (a){
var b=a.split(" ");return b[0] + " " + (b[1]||"solid") + " " + (a.match(ma)||["#000"])[0];
}}), va("borderWidth", { parser: oa("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth") }), va("float,cssFloat,styleFloat", { parser: function (a, b, c, d, e, f){
var g=a.style,
h="cssFloat" in g ? "cssFloat":"styleFloat";return new qa(g, h, 0, 0, e, -1, c, !1, 0, g[h], b);
}});var Qa=function (a){
var b,
c=this.t,
d=c.filter||Y(this.data, "filter")||"",
e=this.s + this.c * a | 0;100===e&&(-1===d.indexOf("atrix(")&&-1===d.indexOf("radient(")&&-1===d.indexOf("oader(") ? (c.removeAttribute("filter"), b = !Y(this.data, "filter")):(c.filter=d.replace(x, ""), b = !0)), b||(this.xn1&&(c.filter=d = d||"alpha(opacity=" + e + ")"), -1===d.indexOf("pacity") ? 0===e&&this.xn1||(c.filter=d + " alpha(opacity=" + e + ")"):c.filter=d.replace(v, "opacity=" + e));
};va("opacity,alpha,autoAlpha", { defaultValue: "1", parser: function (a, b, c, d, f, g){
var h=parseFloat(Y(a, "opacity", e, !1, "1")),
i=a.style,
j="autoAlpha"===c;return "string"==typeof b&&"="===b.charAt(1)&&(b=("-"===b.charAt(0) ? -1:1) * parseFloat(b.substr(2)) + h), j&&1===h&&"hidden"===Y(a, "visibility", e)&&0!==b&&(h=0), R ? f=new qa(i, "opacity", h, b - h, f):(f=new qa(i, "opacity", 100 * h, 100 * (b - h), f), f.xn1=j ? 1:0, i.zoom=1, f.type=2, f.b="alpha(opacity=" + f.s + ")", f.e="alpha(opacity=" + (f.s + f.c) + ")", f.data=a, f.plugin=g, f.setRatio=Qa), j&&(f=new qa(i, "visibility", 0, 0, f, -1, null, !1, 0, 0!==h ? "inherit":"hidden", 0===b ? "hidden":"inherit"), f.xs0="inherit", d._overwriteProps.push(f.n), d._overwriteProps.push(c)), f;
}});var Ra=function (a, b){
b&&(a.removeProperty ? (("ms"===b.substr(0, 2)||"webkit"===b.substr(0, 6))&&(b="-" + b), a.removeProperty(b.replace(z, "-$1").toLowerCase())):a.removeAttribute(b));
},
Sa=function (a){
if(this.t._gsClassPT=this, 1===a||0===a){
this.t.setAttribute("class", 0===a ? this.b:this.e);for (var b=this.data, c=this.t.style; b;){
b.v ? c[b.p]=b.v:Ra(c, b.p), b=b._next;
}1===a&&this.t._gsClassPT===this&&(this.t._gsClassPT=null);
} else this.t.getAttribute("class")!==this.e&&this.t.setAttribute("class", this.e);
};va("className", { parser: function (a, b, d, f, g, h, i){
var j,
k,
l,
m,
n,
o=a.getAttribute("class")||"",
p=a.style.cssText;if(g=f._classNamePT=new qa(a, d, 0, 0, g, 2), g.setRatio=Sa, g.pr=-11, c = !0, g.b=o, k=_(a, e), l=a._gsClassPT){
for (m={}, n=l.data; n;){
m[n.p]=1, n=n._next;
}l.setRatio(1);
}return a._gsClassPT=g, g.e="="!==b.charAt(1) ? b:o.replace(new RegExp("(?:\\s|^)" + b.substr(2) + "(?![\\w-])"), "") + ("+"===b.charAt(0) ? " " + b.substr(2):""), a.setAttribute("class", g.e), j=aa(a, k, _(a), i, m), a.setAttribute("class", o), g.data=j.firstMPT, a.style.cssText=p, g=g.xfirst=f.parse(a, j.difs, g, h);
}});var Ta=function (a){
if((1===a||0===a)&&this.data._totalTime===this.data._totalDuration&&"isFromStart"!==this.data.data){
var b,
c,
d,
e,
f,
g=this.t.style,
h=i.transform.parse;if("all"===this.e) g.cssText="", e = !0;else for (b=this.e.split(" ").join("").split(","), d=b.length; --d > -1;){
c=b[d], i[c]&&(i[c].parse===h ? e = !0:c="transformOrigin"===c ? Ba:i[c].p), Ra(g, c);
}e&&(Ra(g, za), f=this.t._gsTransform, f&&(f.svg&&(this.t.removeAttribute("data-svg-origin"), this.t.removeAttribute("transform")), delete this.t._gsTransform));
}};for (va("clearProps", { parser: function (a, b, d, e, f){
return f=new qa(a, d, 0, 0, f, 2), f.setRatio=Ta, f.e=b, f.pr=-10, f.data=e._tween, c = !0, f;
}}), j="bezier,throwProps,physicsProps,physics2D".split(","), ta=j.length; ta--;){
wa(j[ta]);
}j=g.prototype, j._firstPT=j._lastParsedTransform=j._transform=null, j._onInitTween=function (a, b, h){
if(!a.nodeType) return !1;this._target=a, this._tween=h, this._vars=b, k=b.autoRound, c = !1, d=b.suffixMap||g.suffixMap, e=X(a, ""), f=this._overwriteProps;var j,
n,
p,
q,
r,
s,
t,
u,
v,
x=a.style;if(l&&""===x.zIndex&&(j=Y(a, "zIndex", e), ("auto"===j||""===j)&&this._addLazySet(x, "zIndex", 0)), "string"==typeof b&&(q=x.cssText, j=_(a, e), x.cssText=q + ";" + b, j=aa(a, j, _(a)).difs, !R&&w.test(b)&&(j.opacity=parseFloat(RegExp.$1)), b=j, x.cssText=q), b.className ? this._firstPT=n = i.className.parse(a, b.className, "className", this, null, null, b):this._firstPT=n = this.parse(a, b, null), this._transformType){
for (v=3===this._transformType, za ? m&&(l = !0, ""===x.zIndex&&(t=Y(a, "zIndex", e), ("auto"===t||""===t)&&this._addLazySet(x, "zIndex", 0)), o&&this._addLazySet(x, "WebkitBackfaceVisibility", this._vars.WebkitBackfaceVisibility||(v ? "visible":"hidden"))):x.zoom=1, p=n; p&&p._next;){
p=p._next;
}u=new qa(a, "transform", 0, 0, null, 2), this._linkCSSP(u, null, p), u.setRatio=za ? Pa:Oa, u.data=this._transform||Na(a, e, !0), u.tween=h, u.pr=-1, f.pop();
}if(c){
for (; n;){
for (s=n._next, p=q; p&&p.pr > n.pr;){
p=p._next;
}(n._prev=p ? p._prev:r) ? n._prev._next=n:q=n, (n._next=p) ? p._prev=n:r=n, n=s;
}this._firstPT=q;
}return !0;
}, j.parse=function (a, b, c, f){
var g,
h,
j,
l,
m,
n,
o,
p,
q,
r,
s=a.style;for (g in b){
n=b[g], h=i[g], h ? c=h.parse(a, n, g, this, c, f, b):(m=Y(a, g, e) + "", q="string"==typeof n, "color"===g||"fill"===g||"stroke"===g||-1!==g.indexOf("Color")||q&&y.test(n) ? (q||(n=ka(n), n=(n.length > 3 ? "rgba(":"rgb(") + n.join(",") + ")"), c=sa(s, g, m, n, !0, "transparent", c, 0, f)):q&&H.test(n) ? c=sa(s, g, m, n, !0, null, c, 0, f):(j=parseFloat(m), o=j||0===j ? m.substr((j + "").length):"", (""===m||"auto"===m)&&("width"===g||"height"===g ? (j=da(a, g, e), o="px"):"left"===g||"top"===g ? (j=$(a, g, e), o="px"):(j="opacity"!==g ? 0:1, o="")), r=q&&"="===n.charAt(1), r ? (l=parseInt(n.charAt(0) + "1", 10), n=n.substr(2), l *=parseFloat(n), p=n.replace(u, "")):(l=parseFloat(n), p=q ? n.replace(u, ""):""), ""===p&&(p=g in d ? d[g]:o), n=l||0===l ? (r ? l + j:l) + p:b[g], o!==p&&""!==p&&(l||0===l)&&j && (j=Z(a, g, j, o), "%"===p ? (j /=Z(a, g, 100, "%") / 100, b.strictUnits!==!0&&(m=j + "%")):"em"===p||"rem"===p||"vw"===p||"vh"===p ? j /=Z(a, g, 1, p):"px"!==p&&(l=Z(a, g, l, p), p="px"), r&&(l||0===l)&&(n=l + j + p)), r&&(l +=j), !j&&0!==j||!l&&0!==l ? void 0!==s[g]&&(n||n + ""!="NaN"&&null!=n) ? (c=new qa(s, g, l||j || 0, 0, c, -1, g, !1, 0, m, n), c.xs0="none"!==n||"display"!==g&&-1===g.indexOf("Style") ? n:m):T("invalid " + g + " tween value: " + b[g]):(c=new qa(s, g, j, l - j, c, 0, g, k!==!1&&("px"===p||"zIndex"===g), 0, m, n), c.xs0=p))), f&&c && !c.plugin&&(c.plugin=f);
}return c;
}, j.setRatio=function (a){
var b,
c,
d,
e=this._firstPT,
f=1e-6;if(1!==a||this._tween._time!==this._tween._duration&&0!==this._tween._time){
if(a||this._tween._time!==this._tween._duration&&0!==this._tween._time||this._tween._rawPrevTime===-1e-6) for (; e;){
if(b=e.c * a + e.s, e.r ? b=Math.round(b):f > b&&b > -f&&(b=0), e.type){
if(1===e.type){
if(d=e.l, 2===d) e.t[e.p]=e.xs0 + b + e.xs1 + e.xn1 + e.xs2;else if(3===d) e.t[e.p]=e.xs0 + b + e.xs1 + e.xn1 + e.xs2 + e.xn2 + e.xs3;else if(4===d) e.t[e.p]=e.xs0 + b + e.xs1 + e.xn1 + e.xs2 + e.xn2 + e.xs3 + e.xn3 + e.xs4;else if(5===d) e.t[e.p]=e.xs0 + b + e.xs1 + e.xn1 + e.xs2 + e.xn2 + e.xs3 + e.xn3 + e.xs4 + e.xn4 + e.xs5;else {
for (c=e.xs0 + b + e.xs1, d=1; d < e.l; d++){
c +=e["xn" + d] + e["xs" + (d + 1)];
}e.t[e.p]=c;
}} else -1===e.type ? e.t[e.p]=e.xs0:e.setRatio&&e.setRatio(a);
} else e.t[e.p]=b + e.xs0;e=e._next;
} else for (; e;){
2!==e.type ? e.t[e.p]=e.b:e.setRatio(a), e=e._next;
}} else for (; e;){
if(2!==e.type){
if(e.r&&-1!==e.type){
if(b=Math.round(e.s + e.c), e.type){
if(1===e.type){
for (d=e.l, c=e.xs0 + b + e.xs1, d=1; d < e.l; d++){
c +=e["xn" + d] + e["xs" + (d + 1)];
}e.t[e.p]=c;
}} else e.t[e.p]=b + e.xs0;
} else e.t[e.p]=e.e;
} else e.setRatio(a);e=e._next;
}}, j._enableTransforms=function (a){
this._transform=this._transform||Na(this._target, e, !0), this._transformType=this._transform.svg&&xa||!a&&3!==this._transformType ? 2:3;
};var Ua=function (a){
this.t[this.p]=this.e, this.data._linkCSSP(this, this._next, null, !0);
};j._addLazySet=function (a, b, c){
var d=this._firstPT=new qa(a, b, 0, 0, this._firstPT, 2);d.e=c, d.setRatio=Ua, d.data=this;
}, j._linkCSSP=function (a, b, c, d){
return a&&(b&&(b._prev=a), a._next&&(a._next._prev=a._prev), a._prev ? a._prev._next=a._next:this._firstPT===a&&(this._firstPT=a._next, d = !0), c ? c._next=a:d||null!==this._firstPT||(this._firstPT=a), a._next=b, a._prev=c), a;
}, j._kill=function (b){
var c,
d,
e,
f=b;if(b.autoAlpha||b.alpha){
f={};for (d in b){
f[d]=b[d];
}f.opacity=1, f.autoAlpha&&(f.visibility=1);
}return b.className&&(c=this._classNamePT)&&(e=c.xfirst, e&&e._prev ? this._linkCSSP(e._prev, c._next, e._prev._prev):e===this._firstPT&&(this._firstPT=c._next), c._next&&this._linkCSSP(c._next, c._next._next, e._prev), this._classNamePT=null), a.prototype._kill.call(this, f);
};var Va=function (a, b, c){
var d, e, f, g;if(a.slice) for (e=a.length; --e > -1;){
Va(a[e], b, c);
} else for (d=a.childNodes, e=d.length; --e > -1;){
f=d[e], g=f.type, f.style&&(b.push(_(f)), c&&c.push(f)), 1!==g&&9!==g&&11!==g||!f.childNodes.length||Va(f, b, c);
}};return g.cascadeTo=function (a, c, d){
var e,
f,
g,
h,
i=b.to(a, c, d),
j=[i],
k=[],
l=[],
m=[],
n=b._internals.reservedProps;for (a=i._targets||i.target, Va(a, k, m), i.render(c, !0, !0), Va(a, l), i.render(0, !0, !0), i._enabled(!0), e=m.length; --e > -1;){
if(f=aa(m[e], k[e], l[e]), f.firstMPT){
f=f.difs;for (g in d){
n[g]&&(f[g]=d[g]);
}h={};for (g in f){
h[g]=k[e][g];
}j.push(b.fromTo(m[e], c, h, f));
}}return j;
}, a.activate([g]), g;
}, !0), function (){
var a=_gsScope._gsDefine.plugin({ propName: "roundProps", version: "1.5", priority: -1, API: 2, init: function (a, b, c){
return this._tween=c, !0;
}}),
b=function (a){
for (; a;){
a.f||a.blob||(a.r=1), a=a._next;
}},
c=a.prototype;c._onInitAllProps=function (){
for (var a, c, d, e=this._tween, f=e.vars.roundProps.join ? e.vars.roundProps:e.vars.roundProps.split(","), g=f.length, h={}, i=e._propLookup.roundProps; --g > -1;){
h[f[g]]=1;
}for (g=f.length; --g > -1;){
for (a=f[g], c=e._firstPT; c;){
d=c._next, c.pg ? c.t._roundProps(h, !0):c.n===a&&(2===c.f&&c.t ? b(c.t._firstPT):(this._add(c.t, a, c.s, c.c), d&&(d._prev=c._prev), c._prev ? c._prev._next=d:e._firstPT===c&&(e._firstPT=d), c._next=c._prev=null, e._propLookup[a]=i)), c=d;
}}return !1;
}, c._add=function (a, b, c, d){
this._addTween(a, b, c, c + d, b, !0), this._overwriteProps.push(b);
};}(), function (){
_gsScope._gsDefine.plugin({ propName: "attr", API: 2, version: "0.5.0", init: function (a, b, c){
var d;if("function"!=typeof a.setAttribute) return !1;for (d in b){
this._addTween(a, "setAttribute", a.getAttribute(d) + "", b[d] + "", d, !1, d), this._overwriteProps.push(d);
}return !0;
}});
}(), _gsScope._gsDefine.plugin({ propName: "directionalRotation", version: "0.2.1", API: 2, init: function (a, b, c){
"object"!=typeof b&&(b={ rotation: b }), this.finals={};var d,
e,
f,
g,
h,
i,
j=b.useRadians===!0 ? 2 * Math.PI:360,
k=1e-6;for (d in b){
"useRadians"!==d&&(i=(b[d] + "").split("_"), e=i[0], f=parseFloat("function"!=typeof a[d] ? a[d]:a[d.indexOf("set")||"function"!=typeof a["get" + d.substr(3)] ? d:"get" + d.substr(3)]()), g=this.finals[d]="string"==typeof e&&"="===e.charAt(1) ? f + parseInt(e.charAt(0) + "1", 10) * Number(e.substr(2)):Number(e)||0, h=g - f, i.length&&(e=i.join("_"), -1!==e.indexOf("short")&&(h %=j, h!==h % (j / 2)&&(h=0 > h ? h + j:h - j)), -1!==e.indexOf("_cw")&&0 > h ? h=(h + 9999999999 * j) % j - (h / j | 0) * j:-1!==e.indexOf("ccw")&&h > 0&&(h=(h - 9999999999 * j) % j - (h / j | 0) * j)), (h > k||-k > h)&&(this._addTween(a, d, f, f + h, d), this._overwriteProps.push(d)));
}return !0;
}, set: function (a){
var b;if(1!==a) this._super.setRatio.call(this, a);else for (b=this._firstPT; b;){
b.f ? b.t[b.p](this.finals[b.p]):b.t[b.p]=this.finals[b.p], b=b._next;
}} })._autoCSS = !0, _gsScope._gsDefine("easing.Back", ["easing.Ease"], function (a){
var b,
c,
d,
e=_gsScope.GreenSockGlobals||_gsScope,
f=e.com.greensock,
g=2 * Math.PI,
h=Math.PI / 2,
i=f._class,
j=function (b, c){
var d=i("easing." + b, function (){}, !0),
e=d.prototype=new a();return e.constructor=d, e.getRatio=c, d;
},
k=a.register||function (){},
l=function (a, b, c, d, e){
var f=i("easing." + a, { easeOut: new b(), easeIn: new c(), easeInOut: new d() }, !0);return k(f, a), f;
},
m=function (a, b, c){
this.t=a, this.v=b, c&&(this.next=c, c.prev=this, this.c=c.v - b, this.gap=c.t - a);
},
n=function (b, c){
var d=i("easing." + b, function (a){
this._p1=a||0===a ? a:1.70158, this._p2=1.525 * this._p1;
}, !0),
e=d.prototype=new a();return e.constructor=d, e.getRatio=c, e.config=function (a){
return new d(a);
}, d;
},
o=l("Back", n("BackOut", function (a){
return (a -=1) * a * ((this._p1 + 1) * a + this._p1) + 1;
}), n("BackIn", function (a){
return a * a * ((this._p1 + 1) * a - this._p1);
}), n("BackInOut", function (a){
return (a *=2) < 1 ? .5 * a * a * ((this._p2 + 1) * a - this._p2) : .5 * ((a -=2) * a * ((this._p2 + 1) * a + this._p2) + 2);
})),
p=i("easing.SlowMo", function (a, b, c){
b=b||0===b ? b : .7, null==a ? a=.7:a > 1&&(a=1), this._p=1!==a ? b:0, this._p1=(1 - a) / 2, this._p2=a, this._p3=this._p1 + this._p2, this._calcEnd=c===!0;
}, !0),
q=p.prototype=new a();return q.constructor=p, q.getRatio=function (a){
var b=a + (.5 - a) * this._p;return a < this._p1 ? this._calcEnd ? 1 - (a=1 - a / this._p1) * a:b - (a=1 - a / this._p1) * a * a * a * b:a > this._p3 ? this._calcEnd ? 1 - (a=(a - this._p3) / this._p1) * a:b + (a - b) * (a=(a - this._p3) / this._p1) * a * a * a:this._calcEnd ? 1:b;
}, p.ease=new p(.7, .7), q.config=p.config=function (a, b, c){
return new p(a, b, c);
}, b=i("easing.SteppedEase", function (a){
a=a||1, this._p1=1 / a, this._p2=a + 1;
}, !0), q=b.prototype=new a(), q.constructor=b, q.getRatio=function (a){
return 0 > a ? a=0:a >=1&&(a=.999999999), (this._p2 * a >> 0) * this._p1;
}, q.config=b.config=function (a){
return new b(a);
}, c=i("easing.RoughEase", function (b){
b=b||{};for (var c, d, e, f, g, h, i=b.taper||"none", j=[], k=0, l=0 | (b.points||20), n=l, o=b.randomize!==!1, p=b.clamp===!0, q=b.template instanceof a ? b.template:null, r="number"==typeof b.strength ? .4 * b.strength : .4; --n > -1;){
c=o ? Math.random():1 / l * n, d=q ? q.getRatio(c):c, "none"===i ? e=r:"out"===i ? (f=1 - c, e=f * f * r):"in"===i ? e=c * c * r : .5 > c ? (f=2 * c, e=f * f * .5 * r):(f=2 * (1 - c), e=f * f * .5 * r), o ? d +=Math.random() * e - .5 * e:n % 2 ? d +=.5 * e:d -=.5 * e, p&&(d > 1 ? d=1:0 > d&&(d=0)), j[k++]={ x: c, y: d };}for (j.sort(function (a, b){
return a.x - b.x;
}), h=new m(1, 1, null), n=l; --n > -1;){
g=j[n], h=new m(g.x, g.y, h);
}this._prev=new m(0, 0, 0!==h.t ? h:h.next);
}, !0), q=c.prototype=new a(), q.constructor=c, q.getRatio=function (a){
var b=this._prev;if(a > b.t){
for (; b.next&&a >=b.t;){
b=b.next;
}b=b.prev;
} else for (; b.prev&&a <=b.t;){
b=b.prev;
}return this._prev=b, b.v + (a - b.t) / b.gap * b.c;
}, q.config=function (a){
return new c(a);
}, c.ease=new c(), l("Bounce", j("BounceOut", function (a){
return 1 / 2.75 > a ? 7.5625 * a * a:2 / 2.75 > a ? 7.5625 * (a -=1.5 / 2.75) * a + .75:2.5 / 2.75 > a ? 7.5625 * (a -=2.25 / 2.75) * a + .9375:7.5625 * (a -=2.625 / 2.75) * a + .984375;
}), j("BounceIn", function (a){
return (a=1 - a) < 1 / 2.75 ? 1 - 7.5625 * a * a:2 / 2.75 > a ? 1 - (7.5625 * (a -=1.5 / 2.75) * a + .75):2.5 / 2.75 > a ? 1 - (7.5625 * (a -=2.25 / 2.75) * a + .9375):1 - (7.5625 * (a -=2.625 / 2.75) * a + .984375);
}), j("BounceInOut", function (a){
var b=.5 > a;return a=b ? 1 - 2 * a:2 * a - 1, a=1 / 2.75 > a ? 7.5625 * a * a:2 / 2.75 > a ? 7.5625 * (a -=1.5 / 2.75) * a + .75:2.5 / 2.75 > a ? 7.5625 * (a -=2.25 / 2.75) * a + .9375:7.5625 * (a -=2.625 / 2.75) * a + .984375, b ? .5 * (1 - a) : .5 * a + .5;
})), l("Circ", j("CircOut", function (a){
return Math.sqrt(1 - (a -=1) * a);
}), j("CircIn", function (a){
return -(Math.sqrt(1 - a * a) - 1);
}), j("CircInOut", function (a){
return (a *=2) < 1 ? -.5 * (Math.sqrt(1 - a * a) - 1) : .5 * (Math.sqrt(1 - (a -=2) * a) + 1);
})), d=function (b, c, d){
var e=i("easing." + b, function (a, b){
this._p1=a >=1 ? a:1, this._p2=(b||d) / (1 > a ? a:1), this._p3=this._p2 / g * (Math.asin(1 / this._p1)||0), this._p2=g / this._p2;
}, !0),
f=e.prototype=new a();return f.constructor=e, f.getRatio=c, f.config=function (a, b){
return new e(a, b);
}, e;
}, l("Elastic", d("ElasticOut", function (a){
return this._p1 * Math.pow(2, -10 * a) * Math.sin((a - this._p3) * this._p2) + 1;
}, .3), d("ElasticIn", function (a){
return -(this._p1 * Math.pow(2, 10 * (a -=1)) * Math.sin((a - this._p3) * this._p2));
}, .3), d("ElasticInOut", function (a){
return (a *=2) < 1 ? -.5 * (this._p1 * Math.pow(2, 10 * (a -=1)) * Math.sin((a - this._p3) * this._p2)):this._p1 * Math.pow(2, -10 * (a -=1)) * Math.sin((a - this._p3) * this._p2) * .5 + 1;
}, .45)), l("Expo", j("ExpoOut", function (a){
return 1 - Math.pow(2, -10 * a);
}), j("ExpoIn", function (a){
return Math.pow(2, 10 * (a - 1)) - .001;
}), j("ExpoInOut", function (a){
return (a *=2) < 1 ? .5 * Math.pow(2, 10 * (a - 1)) : .5 * (2 - Math.pow(2, -10 * (a - 1)));
})), l("Sine", j("SineOut", function (a){
return Math.sin(a * h);
}), j("SineIn", function (a){
return -Math.cos(a * h) + 1;
}), j("SineInOut", function (a){
return -.5 * (Math.cos(Math.PI * a) - 1);
})), i("easing.EaseLookup", { find: function (b){
return a.map[b];
}}, !0), k(e.SlowMo, "SlowMo", "ease,"), k(c, "RoughEase", "ease,"), k(b, "SteppedEase", "ease,"), o;
}, !0);
}), _gsScope._gsDefine&&_gsScope._gsQueue.pop()(), function (a, b){
"use strict";
var c={},
d=a.GreenSockGlobals=a.GreenSockGlobals||a;if(!d.TweenLite){
var e,
f,
g,
h,
i,
j=function (a){
var b,
c=a.split("."),
e=d;for (b=0; b < c.length; b++){
e[c[b]]=e = e[c[b]]||{};}return e;
},
k=j("com.greensock"),
l=1e-10,
m=function (a){
var b,
c=[],
d=a.length;for (b=0; b!==d; c.push(a[b++])){}return c;
},
n=function (){},
o=function (){
var a=Object.prototype.toString,
b=a.call([]);return function (c){
return null!=c&&(c instanceof Array||"object"==typeof c&&!!c.push&&a.call(c)===b);
};}(),
p={},
q=function (e, f, g, h){
this.sc=p[e] ? p[e].sc:[], p[e]=this, this.gsClass=null, this.func=g;var i=[];this.check=function (k){
for (var l, m, n, o, r, s=f.length, t=s; --s > -1;){
(l=p[f[s]]||new q(f[s], [])).gsClass ? (i[s]=l.gsClass, t--):k&&l.sc.push(this);
}if(0===t&&g){
if(m=("com.greensock." + e).split("."), n=m.pop(), o=j(m.join("."))[n]=this.gsClass=g.apply(g, i), h) if(d[n]=o, r="undefined"!=typeof module&&module.exports, !r&&"function"==typeof define&&define.amd) define((a.GreenSockAMDPath ? a.GreenSockAMDPath + "/":"") + e.split(".").pop(), [], function (){
return o;
});else if(r) if(e===b){
module.exports=c[b]=o;for (s in c){
o[s]=c[s];
}} else c[b]&&(c[b][n]=o);for (s=0; s < this.sc.length; s++){
this.sc[s].check();
}}
}, this.check(!0);
},
r=a._gsDefine=function (a, b, c, d){
return new q(a, b, c, d);
},
s=k._class=function (a, b, c){
return b=b||function (){}, r(a, [], function (){
return b;
}, c), b;
};r.globals=d;var t=[0, 0, 1, 1],
u=[],
v=s("easing.Ease", function (a, b, c, d){
this._func=a, this._type=c||0, this._power=d||0, this._params=b ? t.concat(b):t;
}, !0),
w=v.map={},
x=v.register=function (a, b, c, d){
for (var e, f, g, h, i=b.split(","), j=i.length, l=(c||"easeIn,easeOut,easeInOut").split(","); --j > -1;){
for (f=i[j], e=d ? s("easing." + f, null, !0):k.easing[f]||{}, g=l.length; --g > -1;){
h=l[g], w[f + "." + h]=w[h + f]=e[h]=a.getRatio ? a:a[h]||new a();
}}
};for (g=v.prototype, g._calcEnd = !1, g.getRatio=function (a){
if(this._func) return this._params[0]=a, this._func.apply(null, this._params);var b=this._type,
c=this._power,
d=1===b ? 1 - a:2===b ? a : .5 > a ? 2 * a:2 * (1 - a);return 1===c ? d *=d:2===c ? d *=d * d:3===c ? d *=d * d * d:4===c&&(d *=d * d * d * d), 1===b ? 1 - d:2===b ? d : .5 > a ? d / 2:1 - d / 2;
}, e=["Linear", "Quad", "Cubic", "Quart", "Quint,Strong"], f=e.length; --f > -1;){
g=e[f] + ",Power" + f, x(new v(null, null, 1, f), g, "easeOut", !0), x(new v(null, null, 2, f), g, "easeIn" + (0===f ? ",easeNone":"")), x(new v(null, null, 3, f), g, "easeInOut");
}w.linear=k.easing.Linear.easeIn, w.swing=k.easing.Quad.easeInOut;var y=s("events.EventDispatcher", function (a){
this._listeners={}, this._eventTarget=a||this;
});g=y.prototype, g.addEventListener=function (a, b, c, d, e){
e=e||0;var f,
g,
j=this._listeners[a],
k=0;for (this!==h||i || h.wake(), null==j&&(this._listeners[a]=j = []), g=j.length; --g > -1;){
f=j[g], f.c===b&&f.s===c ? j.splice(g, 1):0===k&&f.pr < e&&(k=g + 1);
}j.splice(k, 0, { c: b, s: c, up: d, pr: e });
}, g.removeEventListener=function (a, b){
var c,
d=this._listeners[a];if(d) for (c=d.length; --c > -1;){
if(d[c].c===b) return void d.splice(c, 1);
}}, g.dispatchEvent=function (a){
var b,
c,
d,
e=this._listeners[a];if(e) for (b=e.length, c=this._eventTarget; --b > -1;){
d=e[b], d&&(d.up ? d.c.call(d.s||c, { type: a, target: c }):d.c.call(d.s||c));
}};var z=a.requestAnimationFrame,
A=a.cancelAnimationFrame,
B=Date.now||function (){
return new Date().getTime();
},
C=B();for (e=["ms", "moz", "webkit", "o"], f=e.length; --f > -1&&!z;){
z=a[e[f] + "RequestAnimationFrame"], A=a[e[f] + "CancelAnimationFrame"]||a[e[f] + "CancelRequestAnimationFrame"];
}s("Ticker", function (a, b){
var c,
d,
e,
f,
g,
j=this,
k=B(),
m=b!==!1&&z ? "auto":!1,
o=500,
p=33,
q="tick",
r=function (a){
var b,
h,
i=B() - C;i > o&&(k +=i - p), C +=i, j.time=(C - k) / 1e3, b=j.time - g, (!c||b > 0||a===!0)&&(j.frame++, g +=b + (b >=f ? .004:f - b), h = !0), a!==!0&&(e=d(r)), h&&j.dispatchEvent(q);
};y.call(j), j.time=j.frame=0, j.tick=function (){
r(!0);
}, j.lagSmoothing=function (a, b){
o=a||1 / l, p=Math.min(b, o, 0);
}, j.sleep=function (){
null!=e&&(m&&A ? A(e):clearTimeout(e), d=n, e=null, j===h&&(i = !1));
}, j.wake=function (a){
null!==e ? j.sleep():a ? k +=-C + (C=B()):j.frame > 10&&(C=B() - o + 5), d=0===c ? n:m&&z ? z:function (a){
return setTimeout(a, 1e3 * (g - j.time) + 1 | 0);
}, j===h&&(i = !0), r(2);
}, j.fps=function (a){
return arguments.length ? (c=a, f=1 / (c||60), g=this.time + f, void j.wake()):c;
}, j.useRAF=function (a){
return arguments.length ? (j.sleep(), m=a, void j.fps(c)):m;
}, j.fps(a), setTimeout(function (){
"auto"===m&&j.frame < 5&&"hidden"!==document.visibilityState&&j.useRAF(!1);
}, 1500);
}), g=k.Ticker.prototype=new k.events.EventDispatcher(), g.constructor=k.Ticker;var D=s("core.Animation", function (a, b){
if(this.vars=b = b||{}, this._duration=this._totalDuration=a||0, this._delay=Number(b.delay)||0, this._timeScale=1, this._active=b.immediateRender===!0, this.data=b.data, this._reversed=b.reversed===!0, W){
i||h.wake();var c=this.vars.useFrames ? V:W;c.add(this, c._time), this.vars.paused&&this.paused(!0);
}});h=D.ticker=new k.Ticker(), g=D.prototype, g._dirty=g._gc=g._initted=g._paused = !1, g._totalTime=g._time=0, g._rawPrevTime=-1, g._next=g._last=g._onUpdate=g._timeline=g.timeline=null, g._paused = !1;var E=function (){
i&&B() - C > 2e3&&h.wake(), setTimeout(E, 2e3);
};E(), g.play=function (a, b){
return null!=a&&this.seek(a, b), this.reversed(!1).paused(!1);
}, g.pause=function (a, b){
return null!=a&&this.seek(a, b), this.paused(!0);
}, g.resume=function (a, b){
return null!=a&&this.seek(a, b), this.paused(!1);
}, g.seek=function (a, b){
return this.totalTime(Number(a), b!==!1);
}, g.restart=function (a, b){
return this.reversed(!1).paused(!1).totalTime(a ? -this._delay:0, b!==!1, !0);
}, g.reverse=function (a, b){
return null!=a&&this.seek(a||this.totalDuration(), b), this.reversed(!0).paused(!1);
}, g.render=function (a, b, c){}, g.invalidate=function (){
return this._time=this._totalTime=0, this._initted=this._gc = !1, this._rawPrevTime=-1, (this._gc||!this.timeline)&&this._enabled(!0), this;
}, g.isActive=function (){
var a,
b=this._timeline,
c=this._startTime;return !b||!this._gc&&!this._paused&&b.isActive()&&(a=b.rawTime()) >=c&&a < c + this.totalDuration() / this._timeScale;
}, g._enabled=function (a, b){
return i||h.wake(), this._gc = !a, this._active=this.isActive(), b!==!0&&(a&&!this.timeline ? this._timeline.add(this, this._startTime - this._delay):!a&&this.timeline&&this._timeline._remove(this, !0)), !1;
}, g._kill=function (a, b){
return this._enabled(!1, !1);
}, g.kill=function (a, b){
return this._kill(a, b), this;
}, g._uncache=function (a){
for (var b=a ? this:this.timeline; b;){
b._dirty = !0, b=b.timeline;
}return this;
}, g._swapSelfInParams=function (a){
for (var b=a.length, c=a.concat(); --b > -1;){
"{self}"===a[b]&&(c[b]=this);
}return c;
}, g._callback=function (a){
var b=this.vars;b[a].apply(b[a + "Scope"]||b.callbackScope||this, b[a + "Params"]||u);
}, g.eventCallback=function (a, b, c, d){
if("on"===(a||"").substr(0, 2)){
var e=this.vars;if(1===arguments.length) return e[a];null==b ? delete e[a]:(e[a]=b, e[a + "Params"]=o(c)&&-1!==c.join("").indexOf("{self}") ? this._swapSelfInParams(c):c, e[a + "Scope"]=d), "onUpdate"===a&&(this._onUpdate=b);
}return this;
}, g.delay=function (a){
return arguments.length ? (this._timeline.smoothChildTiming&&this.startTime(this._startTime + a - this._delay), this._delay=a, this):this._delay;
}, g.duration=function (a){
return arguments.length ? (this._duration=this._totalDuration=a, this._uncache(!0), this._timeline.smoothChildTiming&&this._time > 0&&this._time < this._duration&&0!==a&&this.totalTime(this._totalTime * (a / this._duration), !0), this):(this._dirty = !1, this._duration);
}, g.totalDuration=function (a){
return this._dirty = !1, arguments.length ? this.duration(a):this._totalDuration;
}, g.time=function (a, b){
return arguments.length ? (this._dirty&&this.totalDuration(), this.totalTime(a > this._duration ? this._duration:a, b)):this._time;
}, g.totalTime=function (a, b, c){
if(i||h.wake(), !arguments.length) return this._totalTime;if(this._timeline){
if(0 > a&&!c&&(a +=this.totalDuration()), this._timeline.smoothChildTiming){
this._dirty&&this.totalDuration();var d=this._totalDuration,
e=this._timeline;if(a > d&&!c&&(a=d), this._startTime=(this._paused ? this._pauseTime:e._time) - (this._reversed ? d - a:a) / this._timeScale, e._dirty||this._uncache(!1), e._timeline) for (; e._timeline;){
e._timeline._time!==(e._startTime + e._totalTime) / e._timeScale&&e.totalTime(e._totalTime, !0), e=e._timeline;
}}this._gc&&this._enabled(!0, !1), (this._totalTime!==a||0===this._duration)&&(J.length&&Y(), this.render(a, b, !1), J.length&&Y());
}return this;
}, g.progress=g.totalProgress=function (a, b){
var c=this.duration();return arguments.length ? this.totalTime(c * a, b):c ? this._time / c:this.ratio;
}, g.startTime=function (a){
return arguments.length ? (a!==this._startTime&&(this._startTime=a, this.timeline&&this.timeline._sortChildren&&this.timeline.add(this, a - this._delay)), this):this._startTime;
}, g.endTime=function (a){
return this._startTime + (0!=a ? this.totalDuration():this.duration()) / this._timeScale;
}, g.timeScale=function (a){
if(!arguments.length) return this._timeScale;if(a=a||l, this._timeline&&this._timeline.smoothChildTiming){
var b=this._pauseTime,
c=b||0===b ? b:this._timeline.totalTime();this._startTime=c - (c - this._startTime) * this._timeScale / a;
}return this._timeScale=a, this._uncache(!1);
}, g.reversed=function (a){
return arguments.length ? (a!=this._reversed&&(this._reversed=a, this.totalTime(this._timeline&&!this._timeline.smoothChildTiming ? this.totalDuration() - this._totalTime:this._totalTime, !0)), this):this._reversed;
}, g.paused=function (a){
if(!arguments.length) return this._paused;var b,
c,
d=this._timeline;return a!=this._paused&&d && (i||a || h.wake(), b=d.rawTime(), c=b - this._pauseTime, !a&&d.smoothChildTiming&&(this._startTime +=c, this._uncache(!1)), this._pauseTime=a ? b:null, this._paused=a, this._active=this.isActive(), !a&&0!==c&&this._initted&&this.duration()&&(b=d.smoothChildTiming ? this._totalTime:(b - this._startTime) / this._timeScale, this.render(b, b===this._totalTime, !0))), this._gc&&!a&&this._enabled(!0, !1), this;
};var F=s("core.SimpleTimeline", function (a){
D.call(this, 0, a), this.autoRemoveChildren=this.smoothChildTiming = !0;
});g=F.prototype=new D(), g.constructor=F, g.kill()._gc = !1, g._first=g._last=g._recent=null, g._sortChildren = !1, g.add=g.insert=function (a, b, c, d){
var e, f;if(a._startTime=Number(b||0) + a._delay, a._paused&&this!==a._timeline&&(a._pauseTime=a._startTime + (this.rawTime() - a._startTime) / a._timeScale), a.timeline&&a.timeline._remove(a, !0), a.timeline=a._timeline=this, a._gc&&a._enabled(!0, !0), e=this._last, this._sortChildren) for (f=a._startTime; e&&e._startTime > f;){
e=e._prev;
}return e ? (a._next=e._next, e._next=a):(a._next=this._first, this._first=a), a._next ? a._next._prev=a:this._last=a, a._prev=e, this._recent=a, this._timeline&&this._uncache(!0), this;
}, g._remove=function (a, b){
return a.timeline===this&&(b||a._enabled(!1, !0), a._prev ? a._prev._next=a._next:this._first===a&&(this._first=a._next), a._next ? a._next._prev=a._prev:this._last===a&&(this._last=a._prev), a._next=a._prev=a.timeline=null, a===this._recent&&(this._recent=this._last), this._timeline&&this._uncache(!0)), this;
}, g.render=function (a, b, c){
var d,
e=this._first;for (this._totalTime=this._time=this._rawPrevTime=a; e;){
d=e._next, (e._active||a >=e._startTime&&!e._paused)&&(e._reversed ? e.render((e._dirty ? e.totalDuration():e._totalDuration) - (a - e._startTime) * e._timeScale, b, c):e.render((a - e._startTime) * e._timeScale, b, c)), e=d;
}}, g.rawTime=function (){
return i||h.wake(), this._totalTime;
};var G=s("TweenLite", function (b, c, d){
if(D.call(this, c, d), this.render=G.prototype.render, null==b) throw "Cannot tween a null target.";this.target=b = "string"!=typeof b ? b:G.selector(b)||b;var e,
f,
g,
h=b.jquery||b.length&&b!==a&&b[0]&&(b[0]===a||b[0].nodeType&&b[0].style&&!b.nodeType),
i=this.vars.overwrite;if(this._overwrite=i = null==i ? U[G.defaultOverwrite]:"number"==typeof i ? i >> 0:U[i], (h||b instanceof Array||b.push&&o(b))&&"number"!=typeof b[0]) for (this._targets=g = m(b), this._propLookup=[], this._siblings=[], e=0; e < g.length; e++){
f=g[e], f ? "string"!=typeof f ? f.length&&f!==a&&f[0]&&(f[0]===a||f[0].nodeType&&f[0].style&&!f.nodeType) ? (g.splice(e--, 1), this._targets=g = g.concat(m(f))):(this._siblings[e]=Z(f, this, !1), 1===i&&this._siblings[e].length > 1&&_(f, this, null, 1, this._siblings[e])):(f=g[e--]=G.selector(f), "string"==typeof f&&g.splice(e + 1, 1)):g.splice(e--, 1);
} else this._propLookup={}, this._siblings=Z(b, this, !1), 1===i&&this._siblings.length > 1&&_(b, this, null, 1, this._siblings);(this.vars.immediateRender||0===c&&0===this._delay&&this.vars.immediateRender!==!1)&&(this._time=-l, this.render(Math.min(0, -this._delay)));
}, !0),
H=function (b){
return b&&b.length&&b!==a&&b[0]&&(b[0]===a||b[0].nodeType&&b[0].style&&!b.nodeType);
},
I=function (a, b){
var c,
d={};for (c in a){
T[c]||c in b&&"transform"!==c&&"x"!==c&&"y"!==c&&"width"!==c&&"height"!==c&&"className"!==c&&"border"!==c||!(!Q[c]||Q[c]&&Q[c]._autoCSS)||(d[c]=a[c], delete a[c]);
}a.css=d;
};g=G.prototype=new D(), g.constructor=G, g.kill()._gc = !1, g.ratio=0, g._firstPT=g._targets=g._overwrittenProps=g._startAt=null, g._notifyPluginsOfEnabled=g._lazy = !1, G.version="1.18.5", G.defaultEase=g._ease=new v(null, null, 1, 1), G.defaultOverwrite="auto", G.ticker=h, G.autoSleep=120, G.lagSmoothing=function (a, b){
h.lagSmoothing(a, b);
}, G.selector=a.$||a.jQuery||function (b){
var c=a.$||a.jQuery;return c ? (G.selector=c, c(b)):"undefined"==typeof document ? b:document.querySelectorAll ? document.querySelectorAll(b):document.getElementById("#"===b.charAt(0) ? b.substr(1):b);
};var J=[],
K={},
L=/(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,
M=function (a){
for (var b, c=this._firstPT, d=1e-6; c;){
b=c.blob ? a ? this.join(""):this.start:c.c * a + c.s, c.r ? b=Math.round(b):d > b&&b > -d&&(b=0), c.f ? c.fp ? c.t[c.p](c.fp, b):c.t[c.p](b):c.t[c.p]=b, c=c._next;
}},
N=function (a, b, c, d){
var e,
f,
g,
h,
i,
j,
k,
l=[a, b],
m=0,
n="",
o=0;for (l.start=a, c&&(c(l), a=l[0], b=l[1]), l.length=0, e=a.match(L)||[], f=b.match(L)||[], d&&(d._next=null, d.blob=1, l._firstPT=d), i=f.length, h=0; i > h; h++){
k=f[h], j=b.substr(m, b.indexOf(k, m) - m), n +=j||!h ? j:",", m +=j.length, o ? o=(o + 1) % 5:"rgba("===j.substr(-5)&&(o=1), k===e[h]||e.length <=h ? n +=k:(n&&(l.push(n), n=""), g=parseFloat(e[h]), l.push(g), l._firstPT={ _next: l._firstPT, t: l, p: l.length - 1, s: g, c: ("="===k.charAt(1) ? parseInt(k.charAt(0) + "1", 10) * parseFloat(k.substr(2)):parseFloat(k) - g)||0, f: 0, r: o&&4 > o }), m +=k.length;
}return n +=b.substr(m), n&&l.push(n), l.setRatio=M, l;
},
O=function (a, b, c, d, e, f, g, h){
var i,
j,
k="get"===c ? a[b]:c,
l=typeof a[b],
m="string"==typeof d&&"="===d.charAt(1),
n={ t: a, p: b, s: k, f: "function"===l, pg: 0, n: e||b, r: f, pr: 0, c: m ? parseInt(d.charAt(0) + "1", 10) * parseFloat(d.substr(2)):parseFloat(d) - k||0 };return "number"!==l&&("function"===l&&"get"===c&&(j=b.indexOf("set")||"function"!=typeof a["get" + b.substr(3)] ? b:"get" + b.substr(3), n.s=k = g ? a[j](g):a[j]()), "string"==typeof k&&(g||isNaN(k)) ? (n.fp=g, i=N(k, d, h||G.defaultStringFilter, n), n={ t: i, p: "setRatio", s: 0, c: 1, f: 2, pg: 0, n: e||b, pr: 0 }):m||(n.s=parseFloat(k), n.c=parseFloat(d) - n.s||0)), n.c ? ((n._next=this._firstPT)&&(n._next._prev=n), this._firstPT=n, n):void 0;
},
P=G._internals={ isArray: o, isSelector: H, lazyTweens: J, blobDif: N },
Q=G._plugins={},
R=P.tweenLookup={},
S=0,
T=P.reservedProps={ ease: 1, delay: 1, overwrite: 1, onComplete: 1, onCompleteParams: 1, onCompleteScope: 1, useFrames: 1, runBackwards: 1, startAt: 1, onUpdate: 1, onUpdateParams: 1, onUpdateScope: 1, onStart: 1, onStartParams: 1, onStartScope: 1, onReverseComplete: 1, onReverseCompleteParams: 1, onReverseCompleteScope: 1, onRepeat: 1, onRepeatParams: 1, onRepeatScope: 1, easeParams: 1, yoyo: 1, immediateRender: 1, repeat: 1, repeatDelay: 1, data: 1, paused: 1, reversed: 1, autoCSS: 1, lazy: 1, onOverwrite: 1, callbackScope: 1, stringFilter: 1, id: 1 },
U={ none: 0, all: 1, auto: 2, concurrent: 3, allOnStart: 4, preexisting: 5, "true": 1, "false": 0 },
V=D._rootFramesTimeline=new F(),
W=D._rootTimeline=new F(),
X=30,
Y=P.lazyRender=function (){
var a,
b=J.length;for (K={}; --b > -1;){
a=J[b], a&&a._lazy!==!1&&(a.render(a._lazy[0], a._lazy[1], !0), a._lazy = !1);
}J.length=0;
};W._startTime=h.time, V._startTime=h.frame, W._active=V._active = !0, setTimeout(Y, 1), D._updateRoot=G.render=function (){
var a, b, c;if(J.length&&Y(), W.render((h.time - W._startTime) * W._timeScale, !1, !1), V.render((h.frame - V._startTime) * V._timeScale, !1, !1), J.length&&Y(), h.frame >=X){
X=h.frame + (parseInt(G.autoSleep, 10)||120);for (c in R){
for (b=R[c].tweens, a=b.length; --a > -1;){
b[a]._gc&&b.splice(a, 1);
}0===b.length&&delete R[c];
}if(c=W._first, (!c||c._paused)&&G.autoSleep&&!V._first&&1===h._listeners.tick.length){
for (; c&&c._paused;){
c=c._next;
}c||h.sleep();
}}
}, h.addEventListener("tick", D._updateRoot);var Z=function (a, b, c){
var d,
e,
f=a._gsTweenID;if(R[f||(a._gsTweenID=f = "t" + S++)]||(R[f]={ target: a, tweens: [] }), b&&(d=R[f].tweens, d[e=d.length]=b, c)) for (; --e > -1;){
d[e]===b&&d.splice(e, 1);
}return R[f].tweens;
},
$=function (a, b, c, d){
var e,
f,
g=a.vars.onOverwrite;return g&&(e=g(a, b, c, d)), g=G.onOverwrite, g&&(f=g(a, b, c, d)), e!==!1&&f!==!1;
},
_=function (a, b, c, d, e){
var f, g, h, i;if(1===d||d >=4){
for (i=e.length, f=0; i > f; f++){
if((h=e[f])!==b) h._gc||h._kill(null, a, b)&&(g = !0);else if(5===d) break;
}return g;
}var j,
k=b._startTime + l,
m=[],
n=0,
o=0===b._duration;for (f=e.length; --f > -1;){
(h=e[f])===b||h._gc||h._paused||(h._timeline!==b._timeline ? (j=j||aa(b, 0, o), 0===aa(h, j, o)&&(m[n++]=h)):h._startTime <=k&&h._startTime + h.totalDuration() / h._timeScale > k&&((o||!h._initted)&&k - h._startTime <=2e-10||(m[n++]=h)));
}for (f=n; --f > -1;){
if(h=m[f], 2===d&&h._kill(c, a, b)&&(g = !0), 2!==d||!h._firstPT&&h._initted){
if(2!==d&&!$(h, b)) continue;h._enabled(!1, !1)&&(g = !0);
}}return g;
},
aa=function (a, b, c){
for (var d=a._timeline, e=d._timeScale, f=a._startTime; d._timeline;){
if(f +=d._startTime, e *=d._timeScale, d._paused) return -100;d=d._timeline;
}return f /=e, f > b ? f - b:c&&f===b||!a._initted&&2 * l > f - b ? l:(f +=a.totalDuration() / a._timeScale / e) > b + l ? 0:f - b - l;
};g._init=function (){
var a,
b,
c,
d,
e,
f=this.vars,
g=this._overwrittenProps,
h=this._duration,
i = !!f.immediateRender,
j=f.ease;if(f.startAt){
this._startAt&&(this._startAt.render(-1, !0), this._startAt.kill()), e={};for (d in f.startAt){
e[d]=f.startAt[d];
}if(e.overwrite = !1, e.immediateRender = !0, e.lazy=i&&f.lazy!==!1, e.startAt=e.delay=null, this._startAt=G.to(this.target, 0, e), i) if(this._time > 0) this._startAt=null;else if(0!==h) return;
}else if(f.runBackwards&&0!==h) if(this._startAt) this._startAt.render(-1, !0), this._startAt.kill(), this._startAt=null;else {
0!==this._time&&(i = !1), c={};for (d in f){
T[d]&&"autoCSS"!==d||(c[d]=f[d]);
}if(c.overwrite=0, c.data="isFromStart", c.lazy=i&&f.lazy!==!1, c.immediateRender=i, this._startAt=G.to(this.target, 0, c), i){
if(0===this._time) return;
} else this._startAt._init(), this._startAt._enabled(!1), this.vars.immediateRender&&(this._startAt=null);
}if(this._ease=j = j ? j instanceof v ? j:"function"==typeof j ? new v(j, f.easeParams):w[j]||G.defaultEase:G.defaultEase, f.easeParams instanceof Array&&j.config&&(this._ease=j.config.apply(j, f.easeParams)), this._easeType=this._ease._type, this._easePower=this._ease._power, this._firstPT=null, this._targets) for (a=this._targets.length; --a > -1;){
this._initProps(this._targets[a], this._propLookup[a]={}, this._siblings[a], g ? g[a]:null)&&(b = !0);
} else b=this._initProps(this.target, this._propLookup, this._siblings, g);if(b&&G._onPluginEvent("_onInitAllProps", this), g&&(this._firstPT||"function"!=typeof this.target&&this._enabled(!1, !1)), f.runBackwards) for (c=this._firstPT; c;){
c.s +=c.c, c.c=-c.c, c=c._next;
}this._onUpdate=f.onUpdate, this._initted = !0;
}, g._initProps=function (b, c, d, e){
var f, g, h, i, j, k;if(null==b) return !1;K[b._gsTweenID]&&Y(), this.vars.css||b.style&&b!==a&&b.nodeType&&Q.css&&this.vars.autoCSS!==!1&&I(this.vars, b);for (f in this.vars){
if(k=this.vars[f], T[f]) k&&(k instanceof Array||k.push&&o(k))&&-1!==k.join("").indexOf("{self}")&&(this.vars[f]=k = this._swapSelfInParams(k, this));else if(Q[f]&&(i=new Q[f]())._onInitTween(b, this.vars[f], this)){
for (this._firstPT=j = { _next: this._firstPT, t: i, p: "setRatio", s: 0, c: 1, f: 1, n: f, pg: 1, pr: i._priority }, g=i._overwriteProps.length; --g > -1;){
c[i._overwriteProps[g]]=this._firstPT;
}(i._priority||i._onInitAllProps)&&(h = !0), (i._onDisable||i._onEnable)&&(this._notifyPluginsOfEnabled = !0), j._next&&(j._next._prev=j);
} else c[f]=O.call(this, b, f, "get", k, f, 0, null, this.vars.stringFilter);
}return e&&this._kill(e, b) ? this._initProps(b, c, d, e):this._overwrite > 1&&this._firstPT&&d.length > 1&&_(b, this, c, this._overwrite, d) ? (this._kill(c, b), this._initProps(b, c, d, e)):(this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration)&&(K[b._gsTweenID] = !0), h);
}, g.render=function (a, b, c){
var d,
e,
f,
g,
h=this._time,
i=this._duration,
j=this._rawPrevTime;if(a >=i - 1e-7) this._totalTime=this._time=i, this.ratio=this._ease._calcEnd ? this._ease.getRatio(1):1, this._reversed||(d = !0, e="onComplete", c=c||this._timeline.autoRemoveChildren), 0===i&&(this._initted||!this.vars.lazy||c)&&(this._startTime===this._timeline._duration&&(a=0), (0 > j||0 >=a&&a >=-1e-7||j===l&&"isPause"!==this.data)&&j!==a&&(c = !0, j > l&&(e="onReverseComplete")), this._rawPrevTime=g = !b||a || j===a ? a:l);else if(1e-7 > a) this._totalTime=this._time=0, this.ratio=this._ease._calcEnd ? this._ease.getRatio(0):0, (0!==h||0===i&&j > 0)&&(e="onReverseComplete", d=this._reversed), 0 > a&&(this._active = !1, 0===i&&(this._initted||!this.vars.lazy||c)&&(j >=0&&(j!==l||"isPause"!==this.data)&&(c = !0), this._rawPrevTime=g = !b||a || j===a ? a:l)), this._initted||(c = !0);else if(this._totalTime=this._time=a, this._easeType){
var k=a / i,
m=this._easeType,
n=this._easePower;(1===m||3===m&&k >=.5)&&(k=1 - k), 3===m&&(k *=2), 1===n ? k *=k:2===n ? k *=k * k:3===n ? k *=k * k * k:4===n&&(k *=k * k * k * k), 1===m ? this.ratio=1 - k:2===m ? this.ratio=k : .5 > a / i ? this.ratio=k / 2:this.ratio=1 - k / 2;
} else this.ratio=this._ease.getRatio(a / i);if(this._time!==h||c){
if(!this._initted){
if(this._init(), !this._initted||this._gc) return;if(!c&&this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration)) return this._time=this._totalTime=h, this._rawPrevTime=j, J.push(this), void (this._lazy=[a, b]);this._time&&!d ? this.ratio=this._ease.getRatio(this._time / i):d&&this._ease._calcEnd&&(this.ratio=this._ease.getRatio(0===this._time ? 0:1));
}for (this._lazy!==!1&&(this._lazy = !1), this._active||!this._paused&&this._time!==h&&a >=0&&(this._active = !0), 0===h&&(this._startAt&&(a >=0 ? this._startAt.render(a, b, c):e||(e="_dummyGS")), this.vars.onStart&&(0!==this._time||0===i)&&(b||this._callback("onStart"))), f=this._firstPT; f;){
f.f ? f.t[f.p](f.c * this.ratio + f.s):f.t[f.p]=f.c * this.ratio + f.s, f=f._next;
}this._onUpdate&&(0 > a&&this._startAt&&a!==-1e-4&&this._startAt.render(a, b, c), b||(this._time!==h||d || c)&&this._callback("onUpdate")), e&&(!this._gc||c)&&(0 > a&&this._startAt&&!this._onUpdate&&a!==-1e-4&&this._startAt.render(a, b, c), d&&(this._timeline.autoRemoveChildren&&this._enabled(!1, !1), this._active = !1), !b&&this.vars[e]&&this._callback(e), 0===i&&this._rawPrevTime===l&&g!==l&&(this._rawPrevTime=0));
}}, g._kill=function (a, b, c){
if("all"===a&&(a=null), null==a&&(null==b||b===this.target)) return this._lazy = !1, this._enabled(!1, !1);b="string"!=typeof b ? b||this._targets||this.target:G.selector(b)||b;var d,
e,
f,
g,
h,
i,
j,
k,
l,
m=c&&this._time&&c._startTime===this._startTime&&this._timeline===c._timeline;if((o(b)||H(b))&&"number"!=typeof b[0]) for (d=b.length; --d > -1;){
this._kill(a, b[d], c)&&(i = !0);
}else{
if(this._targets){
for (d=this._targets.length; --d > -1;){
if(b===this._targets[d]){
h=this._propLookup[d]||{}, this._overwrittenProps=this._overwrittenProps||[], e=this._overwrittenProps[d]=a ? this._overwrittenProps[d]||{}:"all";break;
}}
}else{
if(b!==this.target) return !1;h=this._propLookup, e=this._overwrittenProps=a ? this._overwrittenProps||{}:"all";
}if(h){
if(j=a||h, k=a!==e&&"all"!==e&&a!==h&&("object"!=typeof a||!a._tempKill), c&&(G.onOverwrite||this.vars.onOverwrite)){
for (f in j){
h[f]&&(l||(l=[]), l.push(f));
}if((l||!a)&&!$(this, c, b, l)) return !1;
}for (f in j){
(g=h[f])&&(m&&(g.f ? g.t[g.p](g.s):g.t[g.p]=g.s, i = !0), g.pg&&g.t._kill(j)&&(i = !0), g.pg&&0!==g.t._overwriteProps.length||(g._prev ? g._prev._next=g._next:g===this._firstPT&&(this._firstPT=g._next), g._next&&(g._next._prev=g._prev), g._next=g._prev=null), delete h[f]), k&&(e[f]=1);
}!this._firstPT&&this._initted&&this._enabled(!1, !1);
}}return i;
}, g.invalidate=function (){
return this._notifyPluginsOfEnabled&&G._onPluginEvent("_onDisable", this), this._firstPT=this._overwrittenProps=this._startAt=this._onUpdate=null, this._notifyPluginsOfEnabled=this._active=this._lazy = !1, this._propLookup=this._targets ? {}:[], D.prototype.invalidate.call(this), this.vars.immediateRender&&(this._time=-l, this.render(Math.min(0, -this._delay))), this;
}, g._enabled=function (a, b){
if(i||h.wake(), a&&this._gc){
var c,
d=this._targets;if(d) for (c=d.length; --c > -1;){
this._siblings[c]=Z(d[c], this, !0);
} else this._siblings=Z(this.target, this, !0);
}return D.prototype._enabled.call(this, a, b), this._notifyPluginsOfEnabled&&this._firstPT ? G._onPluginEvent(a ? "_onEnable":"_onDisable", this):!1;
}, G.to=function (a, b, c){
return new G(a, b, c);
}, G.from=function (a, b, c){
return c.runBackwards = !0, c.immediateRender=0!=c.immediateRender, new G(a, b, c);
}, G.fromTo=function (a, b, c, d){
return d.startAt=c, d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender, new G(a, b, d);
}, G.delayedCall=function (a, b, c, d, e){
return new G(b, 0, { delay: a, onComplete: b, onCompleteParams: c, callbackScope: d, onReverseComplete: b, onReverseCompleteParams: c, immediateRender: !1, lazy: !1, useFrames: e, overwrite: 0 });
}, G.set=function (a, b){
return new G(a, 0, b);
}, G.getTweensOf=function (a, b){
if(null==a) return [];a="string"!=typeof a ? a:G.selector(a)||a;var c, d, e, f;if((o(a)||H(a))&&"number"!=typeof a[0]){
for (c=a.length, d=[]; --c > -1;){
d=d.concat(G.getTweensOf(a[c], b));
}for (c=d.length; --c > -1;){
for (f=d[c], e=c; --e > -1;){
f===d[e]&&d.splice(c, 1);
}}
} else for (d=Z(a).concat(), c=d.length; --c > -1;){
(d[c]._gc||b&&!d[c].isActive())&&d.splice(c, 1);
}return d;
}, G.killTweensOf=G.killDelayedCallsTo=function (a, b, c){
"object"==typeof b&&(c=b, b = !1);for (var d=G.getTweensOf(a, b), e=d.length; --e > -1;){
d[e]._kill(c, a);
}};var ba=s("plugins.TweenPlugin", function (a, b){
this._overwriteProps=(a||"").split(","), this._propName=this._overwriteProps[0], this._priority=b||0, this._super=ba.prototype;
}, !0);if(g=ba.prototype, ba.version="1.18.0", ba.API=2, g._firstPT=null, g._addTween=O, g.setRatio=M, g._kill=function (a){
var b,
c=this._overwriteProps,
d=this._firstPT;if(null!=a[this._propName]) this._overwriteProps=[];else for (b=c.length; --b > -1;){
null!=a[c[b]]&&c.splice(b, 1);
}for (; d;){
null!=a[d.n]&&(d._next&&(d._next._prev=d._prev), d._prev ? (d._prev._next=d._next, d._prev=null):this._firstPT===d&&(this._firstPT=d._next)), d=d._next;
}return !1;
}, g._roundProps=function (a, b){
for (var c=this._firstPT; c;){
(a[this._propName]||null!=c.n&&a[c.n.split(this._propName + "_").join("")])&&(c.r=b), c=c._next;
}}, G._onPluginEvent=function (a, b){
var c,
d,
e,
f,
g,
h=b._firstPT;if("_onInitAllProps"===a){
for (; h;){
for (g=h._next, d=e; d&&d.pr > h.pr;){
d=d._next;
}(h._prev=d ? d._prev:f) ? h._prev._next=h:e=h, (h._next=d) ? d._prev=h:f=h, h=g;
}h=b._firstPT=e;
}for (; h;){
h.pg&&"function"==typeof h.t[a]&&h.t[a]()&&(c = !0), h=h._next;
}return c;
}, ba.activate=function (a){
for (var b=a.length; --b > -1;){
a[b].API===ba.API&&(Q[new a[b]()._propName]=a[b]);
}return !0;
}, r.plugin=function (a){
if(!(a&&a.propName&&a.init&&a.API)) throw "illegal plugin definition.";var b,
c=a.propName,
d=a.priority||0,
e=a.overwriteProps,
f={ init: "_onInitTween", set: "setRatio", kill: "_kill", round: "_roundProps", initAll: "_onInitAllProps" },
g=s("plugins." + c.charAt(0).toUpperCase() + c.substr(1) + "Plugin", function (){
ba.call(this, c, d), this._overwriteProps=e||[];
}, a.global===!0),
h=g.prototype=new ba(c);h.constructor=g, g.API=a.API;for (b in f){
"function"==typeof a[b]&&(h[f[b]]=a[b]);
}return g.version=a.version, ba.activate([g]), g;
}, e=a._gsQueue){
for (f=0; f < e.length; f++){
e[f]();
}for (g in p){
p[g].func||a.console.log("GSAP encountered missing dependency: com.greensock." + g);
}}i = !1;
}}("undefined"!=typeof module&&module.exports&&"undefined"!=typeof global ? global:this||window, "TweenMax");
;"use strict";
!function (e, n){
"function"==typeof define&&define.amd ? define(["ScrollMagic", "TweenMax", "TimelineMax"], n):"object"==typeof exports ? (require("gsap"), n(require("scrollmagic"), TweenMax, TimelineMax)):n(e.ScrollMagic||e.jQuery&&e.jQuery.ScrollMagic, e.TweenMax||e.TweenLite, e.TimelineMax||e.TimelineLite);
}(this, function (e, n, r){
"use strict";
e.Scene.addOption("tweenChanges", !1, function (e){
return !!e;
}), e.Scene.extend(function (){
var e,
t=this;t.on("progress.plugin_gsap", function (){
i();
}), t.on("destroy.plugin_gsap", function (e){
t.removeTween(e.reset);
});var i=function (){
if(e){
var n=t.progress(),
r=t.state();e.repeat&&-1===e.repeat() ? "DURING"===r&&e.paused() ? e.play():"DURING"===r||e.paused()||e.pause():n!=e.progress()&&(0===t.duration() ? n > 0 ? e.play():e.reverse():t.tweenChanges()&&e.tweenTo ? e.tweenTo(n * e.duration()):e.progress(n).pause());
}};t.setTween=function (o, a, s){
var u;arguments.length > 1&&(arguments.length < 3&&(s=a, a=1), o=n.to(o, a, s));try {
u=r ? new r({ smoothChildTiming: !0 }).add(o):o, u.pause();
} catch (p){
return t;
}return e&&t.removeTween(), e=u, o.repeat&&-1===o.repeat()&&(e.repeat(-1), e.yoyo(o.yoyo())), i(), t;
}, t.removeTween=function (n){
return e&&(n&&e.progress(0).pause(), e.kill(), e=void 0), t;
};});
});
;'use strict';
(function (window, $){
"use strict";
var counter=0,
$headCache=$('head'),
oldBigText=window.BigText,
oldjQueryMethod=$.fn.bigtext,
BigText={
DEBUG_MODE: false,
DEFAULT_MIN_FONT_SIZE_PX: null,
DEFAULT_MAX_FONT_SIZE_PX: 528,
GLOBAL_STYLE_ID: 'bigtext-style',
STYLE_ID: 'bigtext-id',
LINE_CLASS_PREFIX: 'bigtext-line',
EXEMPT_CLASS: 'bigtext-exempt',
noConflict: function (restore){
if(restore){
$.fn.bigtext=oldjQueryMethod;
window.BigText=oldBigText;
}
return BigText;
},
supports: {
wholeNumberFontSizeOnly: function (){
if(!('getComputedStyle' in window)){
return true;
}
var test=$('<div/>').css({
position: 'absolute',
'font-size': '14.1px'
}).insertBefore($('script').eq(0)),
computedStyle=window.getComputedStyle(test[0], null);
var ret=computedStyle&&computedStyle.getPropertyValue('font-size')==='14px';
test.remove();
return ret;
}()
},
init: function (){
if(!$('#' + BigText.GLOBAL_STYLE_ID).length){
$headCache.append(BigText.generateStyleTag(BigText.GLOBAL_STYLE_ID, ['.bigtext * { white-space: nowrap; } .bigtext > * { display: block; }', '.bigtext .' + BigText.EXEMPT_CLASS + ', .bigtext .' + BigText.EXEMPT_CLASS + ' * { white-space: normal; }']));
}},
bindResize: function (eventName, resizeFunction){
var timeoutId;
$(window).unbind(eventName).bind(eventName, function (){
if(timeoutId){
clearTimeout(timeoutId);
}
timeoutId=setTimeout(resizeFunction, 100);
});
},
getStyleId: function (id){
return BigText.STYLE_ID + '-' + id;
},
generateStyleTag: function (id, css){
return $('<style>' + css.join('\n') + '</style>').attr('id', id);
},
clearCss: function (id){
var styleId=BigText.getStyleId(id);
$('#' + styleId).remove();
},
generateCss: function (id, linesFontSizes, lineWordSpacings, minFontSizes){
var css=[];
BigText.clearCss(id);
for (var j=0, k=linesFontSizes.length; j < k; j++){
css.push('#' + id + ' .' + BigText.LINE_CLASS_PREFIX + j + ' {' + (minFontSizes[j] ? ' white-space: normal;':'') + (linesFontSizes[j] ? ' font-size: ' + linesFontSizes[j] + 'px;':'') + (lineWordSpacings[j] ? ' word-spacing: ' + lineWordSpacings[j] + 'px;':'') + '}');
}
return BigText.generateStyleTag(BigText.getStyleId(id), css);
},
jQueryMethod: function (options){
BigText.init();
options=$.extend({
minfontsize: BigText.DEFAULT_MIN_FONT_SIZE_PX,
maxfontsize: BigText.DEFAULT_MAX_FONT_SIZE_PX,
childSelector: '',
resize: true
}, options||{});
this.each(function (){
var $t=$(this).addClass('bigtext'),
maxWidth=$t.width(),
id=$t.attr('id'),
$children=options.childSelector ? $t.find(options.childSelector):$t.children();
if(!id){
id='bigtext-id' + counter++;
$t.attr('id', id);
}
if(options.resize){
BigText.bindResize('resize.bigtext-event-' + id, function (){
BigText.jQueryMethod.call($('#' + id), options);
});
}
BigText.clearCss(id);
$children.addClass(function (lineNumber, className){
return [className.replace(new RegExp('\\b' + BigText.LINE_CLASS_PREFIX + '\\d+\\b'), ''), BigText.LINE_CLASS_PREFIX + lineNumber].join(' ');
});
var sizes=BigText.calculateSizes($t, $children, maxWidth, options.maxfontsize, options.minfontsize);
$headCache.append(BigText.generateCss(id, sizes.fontSizes, sizes.wordSpacings, sizes.minFontSizes));
});
return this.trigger('bigtext:complete');
},
testLineDimensions: function ($line, maxWidth, property, size, interval, units, previousWidth){
var width;
previousWidth=typeof previousWidth==='number' ? previousWidth:0;
$line.css(property, size + units);
width=$line.width();
if(width >=maxWidth){
$line.css(property, '');
if(width===maxWidth){
return {
match: 'exact',
size: parseFloat((parseFloat(size) - 0.1).toFixed(3))
};}
var under=maxWidth - previousWidth,
over=width - maxWidth;
return {
match: 'estimate',
size: parseFloat((parseFloat(size) - (property==='word-spacing'&&previousWidth&&over < under ? 0:interval)).toFixed(3))
};}
return width;
},
calculateSizes: function ($t, $children, maxWidth, maxFontSize, minFontSize){
var $c=$t.clone(true).addClass('bigtext-cloned').css({
fontFamily: $t.css('font-family'),
textTransform: $t.css('text-transform'),
wordSpacing: $t.css('word-spacing'),
letterSpacing: $t.css('letter-spacing'),
position: 'absolute',
left: BigText.DEBUG_MODE ? 0:-9999,
top: BigText.DEBUG_MODE ? 0:-9999
}).appendTo(document.body);
var fontSizes=[],
wordSpacings=[],
minFontSizes=[],
ratios=[];
$children.css('float', 'left').each(function (){
var $line=$(this),
intervals=BigText.supports.wholeNumberFontSizeOnly ? [8, 4, 1]:[8, 4, 1, 0.1],
lineMax,
newFontSize;
if($line.hasClass(BigText.EXEMPT_CLASS)){
fontSizes.push(null);
ratios.push(null);
minFontSizes.push(false);
return;
}
var autoGuessSubtraction=32,
currentFontSize=parseFloat($line.css('font-size')),
ratio=($line.width() / currentFontSize).toFixed(6);
newFontSize=parseInt(maxWidth / ratio, 10) - autoGuessSubtraction;
outer: for (var m=0, n=intervals.length; m < n; m++){
inner: for (var j=1, k=10; j <=k; j++){
if(newFontSize + j * intervals[m] > maxFontSize){
newFontSize=maxFontSize;
break outer;
}
lineMax=BigText.testLineDimensions($line, maxWidth, 'font-size', newFontSize + j * intervals[m], intervals[m], 'px', lineMax);
if(typeof lineMax!=='number'){
newFontSize=lineMax.size;
if(lineMax.match==='exact'){
break outer;
}
break inner;
}}
}
ratios.push(maxWidth / newFontSize);
if(newFontSize > maxFontSize){
fontSizes.push(maxFontSize);
minFontSizes.push(false);
}else if(!!minFontSize&&newFontSize < minFontSize){
fontSizes.push(minFontSize);
minFontSizes.push(true);
}else{
fontSizes.push(newFontSize);
minFontSizes.push(false);
}}).each(function (lineNumber){
var $line=$(this),
wordSpacing=0,
interval=1,
maxWordSpacing;
if($line.hasClass(BigText.EXEMPT_CLASS)){
wordSpacings.push(null);
return;
}
$line.css('font-size', fontSizes[lineNumber] + 'px');
for (var m=1, n=3; m < n; m +=interval){
maxWordSpacing=BigText.testLineDimensions($line, maxWidth, 'word-spacing', m, interval, 'px', maxWordSpacing);
if(typeof maxWordSpacing!=='number'){
wordSpacing=maxWordSpacing.size;
break;
}}
$line.css('font-size', '');
wordSpacings.push(wordSpacing);
}).removeAttr('style');
if(!BigText.DEBUG_MODE){
$c.remove();
}else{
$c.css({
'background-color': 'rgba(255,255,255,.4)'
});
}
return {
fontSizes: fontSizes,
wordSpacings: wordSpacings,
ratios: ratios,
minFontSizes: minFontSizes
};}};
$.fn.bigtext=BigText.jQueryMethod;
window.BigText=BigText;
})(this, jQuery);
;"use strict";
!function (e, r){
"function"==typeof define&&define.amd ? define(["ScrollMagic"], r):r("object"==typeof exports ? require("scrollmagic"):e.ScrollMagic||e.jQuery&&e.jQuery.ScrollMagic);
}(this, function (e){
"use strict";
var r="0.85em",
t="9999",
i=15,
o=e._util,
n=0;e.Scene.extend(function (){
var e,
r=this;r.addIndicators=function (t){
if(!e){
var i={ name: "", indent: 0, parent: void 0, colorStart: "green", colorEnd: "red", colorTrigger: "blue" };t=o.extend({}, i, t), n++, e=new s(r, t), r.on("add.plugin_addIndicators", e.add), r.on("remove.plugin_addIndicators", e.remove), r.on("destroy.plugin_addIndicators", r.removeIndicators), r.controller()&&e.add();
}return r;
}, r.removeIndicators=function (){
return e&&(e.remove(), this.off("*.plugin_addIndicators"), e=void 0), r;
};}), e.Controller.addOption("addIndicators", !1), e.Controller.extend(function (){
var r=this,
t=r.info(),
n=t.container,
s=t.isDocument,
d=t.vertical,
a={ groups: [] };this._indicators=a;var g=function (){
a.updateBoundsPositions();
},
p=function (){
a.updateTriggerGroupPositions();
};return n.addEventListener("resize", p), s||(window.addEventListener("resize", p), window.addEventListener("scroll", p)), n.addEventListener("resize", g), n.addEventListener("scroll", g), this._indicators.updateBoundsPositions=function (e){
for (var r, t, s, g=e ? [o.extend({}, e.triggerGroup, { members: [e] })]:a.groups, p=g.length, u={}, c=d ? "left":"top", l=d ? "width":"height", f=d ? o.get.scrollLeft(n) + o.get.width(n) - i:o.get.scrollTop(n) + o.get.height(n) - i; p--;){
for (s=g[p], r=s.members.length, t=o.get[l](s.element.firstChild); r--;){
u[c]=f - t, o.css(s.members[r].bounds, u);
}}
}, this._indicators.updateTriggerGroupPositions=function (e){
for (var t, g, p, u, c, l=e ? [e]:a.groups, f=l.length, m=s ? document.body:n, h=s ? { top: 0, left: 0 }:o.get.offset(m, !0), v=d ? o.get.width(n) - i:o.get.height(n) - i, b=d ? "width":"height", G=d ? "Y":"X"; f--;){
t=l[f], g=t.element, p=t.triggerHook * r.info("size"), u=o.get[b](g.firstChild.firstChild), c=p > u ? "translate" + G + "(-100%)":"", o.css(g, { top: h.top + (d ? p:v - t.members[0].options.indent), left: h.left + (d ? v - t.members[0].options.indent:p) }), o.css(g.firstChild.firstChild, { "-ms-transform": c, "-webkit-transform": c, transform: c });
}}, this._indicators.updateTriggerGroupLabel=function (e){
var r="trigger" + (e.members.length > 1 ? "":" " + e.members[0].options.name),
t=e.element.firstChild.firstChild,
i=t.textContent!==r;i&&(t.textContent=r, d&&a.updateBoundsPositions());
}, this.addScene=function (t){
this._options.addIndicators&&t instanceof e.Scene&&t.controller()===r&&t.addIndicators(), this.$super.addScene.apply(this, arguments);
}, this.destroy=function (){
n.removeEventListener("resize", p), s||(window.removeEventListener("resize", p), window.removeEventListener("scroll", p)), n.removeEventListener("resize", g), n.removeEventListener("scroll", g), this.$super.destroy.apply(this, arguments);
}, r;
});var s=function (e, r){
var t,
i,
s=this,
a=d.bounds(),
g=d.start(r.colorStart),
p=d.end(r.colorEnd),
u=r.parent&&o.get.elements(r.parent)[0];r.name=r.name||n, g.firstChild.textContent +=" " + r.name, p.textContent +=" " + r.name, a.appendChild(g), a.appendChild(p), s.options=r, s.bounds=a, s.triggerGroup=void 0, this.add=function (){
i=e.controller(), t=i.info("vertical");var r=i.info("isDocument");u||(u=r ? document.body:i.info("container")), r||"static"!==o.css(u, "position")||o.css(u, { position: "relative" }), e.on("change.plugin_addIndicators", l), e.on("shift.plugin_addIndicators", c), G(), h(), setTimeout(function (){
i._indicators.updateBoundsPositions(s);
}, 0);
}, this.remove=function (){
if(s.triggerGroup){
if(e.off("change.plugin_addIndicators", l), e.off("shift.plugin_addIndicators", c), s.triggerGroup.members.length > 1){
var r=s.triggerGroup;r.members.splice(r.members.indexOf(s), 1), i._indicators.updateTriggerGroupLabel(r), i._indicators.updateTriggerGroupPositions(r), s.triggerGroup=void 0;
} else b();m();
}};var c=function (){
h();
},
l=function (e){
"triggerHook"===e.what&&G();
},
f=function (){
var e=i.info("vertical");o.css(g.firstChild, { "border-bottom-width": e ? 1:0, "border-right-width": e ? 0:1, bottom: e ? -1:r.indent, right: e ? r.indent:-1, padding: e ? "0 8px":"2px 4px" }), o.css(p, { "border-top-width": e ? 1:0, "border-left-width": e ? 0:1, top: e ? "100%":"", right: e ? r.indent:"", bottom: e ? "":r.indent, left: e ? "":"100%", padding: e ? "0 8px":"2px 4px" }), u.appendChild(a);
},
m=function (){
a.parentNode.removeChild(a);
},
h=function (){
a.parentNode!==u&&f();var r={};r[t ? "top":"left"]=e.triggerPosition(), r[t ? "height":"width"]=e.duration(), o.css(a, r), o.css(p, { display: e.duration() > 0 ? "":"none" });
},
v=function (){
var n=d.trigger(r.colorTrigger),
a={};a[t ? "right":"bottom"]=0, a[t ? "border-top-width":"border-left-width"]=1, o.css(n.firstChild, a), o.css(n.firstChild.firstChild, { padding: t ? "0 8px 3px 8px":"3px 4px" }), document.body.appendChild(n);var g={ triggerHook: e.triggerHook(), element: n, members: [s] };i._indicators.groups.push(g), s.triggerGroup=g, i._indicators.updateTriggerGroupLabel(g), i._indicators.updateTriggerGroupPositions(g);
},
b=function (){
i._indicators.groups.splice(i._indicators.groups.indexOf(s.triggerGroup), 1), s.triggerGroup.element.parentNode.removeChild(s.triggerGroup.element), s.triggerGroup=void 0;
},
G=function (){
var r=e.triggerHook(),
t=1e-4;if(!(s.triggerGroup&&Math.abs(s.triggerGroup.triggerHook - r) < t)){
for (var o, n=i._indicators.groups, d=n.length; d--;){
if(o=n[d], Math.abs(o.triggerHook - r) < t) return s.triggerGroup&&(1===s.triggerGroup.members.length ? b():(s.triggerGroup.members.splice(s.triggerGroup.members.indexOf(s), 1), i._indicators.updateTriggerGroupLabel(s.triggerGroup), i._indicators.updateTriggerGroupPositions(s.triggerGroup))), o.members.push(s), s.triggerGroup=o, void i._indicators.updateTriggerGroupLabel(o);
}if(s.triggerGroup){
if(1===s.triggerGroup.members.length) return s.triggerGroup.triggerHook=r, void i._indicators.updateTriggerGroupPositions(s.triggerGroup);s.triggerGroup.members.splice(s.triggerGroup.members.indexOf(s), 1), i._indicators.updateTriggerGroupLabel(s.triggerGroup), i._indicators.updateTriggerGroupPositions(s.triggerGroup), s.triggerGroup=void 0;
}v();
}};},
d={ start: function (e){
var r=document.createElement("div");r.textContent="start", o.css(r, { position: "absolute", overflow: "visible", "border-width": 0, "border-style": "solid", color: e, "border-color": e });var t=document.createElement("div");return o.css(t, { position: "absolute", overflow: "visible", width: 0, height: 0 }), t.appendChild(r), t;
}, end: function (e){
var r=document.createElement("div");return r.textContent="end", o.css(r, { position: "absolute", overflow: "visible", "border-width": 0, "border-style": "solid", color: e, "border-color": e }), r;
}, bounds: function (){
var e=document.createElement("div");return o.css(e, { position: "absolute", overflow: "visible", "white-space": "nowrap", "pointer-events": "none", "font-size": r }), e.style.zIndex=t, e;
}, trigger: function (e){
var i=document.createElement("div");i.textContent="trigger", o.css(i, { position: "relative" });var n=document.createElement("div");o.css(n, { position: "absolute", overflow: "visible", "border-width": 0, "border-style": "solid", color: e, "border-color": e }), n.appendChild(i);var s=document.createElement("div");return o.css(s, { position: "fixed", overflow: "visible", "white-space": "nowrap", "pointer-events": "none", "font-size": r }), s.style.zIndex=t, s.appendChild(n), s;
}};});
;"use strict";
jQuery(document).foundation();
;"use strict";
!function (e, n, t){
function o(e, n){
return typeof e===n;
}function s(){
var e, n, t, s, a, i, r;for (var l in c){
if(c.hasOwnProperty(l)){
if(e=[], n=c[l], n.name&&(e.push(n.name.toLowerCase()), n.options&&n.options.aliases&&n.options.aliases.length)) for (t=0; t < n.options.aliases.length; t++){
e.push(n.options.aliases[t].toLowerCase());
}for (s=o(n.fn, "function") ? n.fn():n.fn, a=0; a < e.length; a++){
i=e[a], r=i.split("."), 1===r.length ? Modernizr[r[0]]=s:(!Modernizr[r[0]]||Modernizr[r[0]] instanceof Boolean||(Modernizr[r[0]]=new Boolean(Modernizr[r[0]])), Modernizr[r[0]][r[1]]=s), f.push((s ? "":"no-") + r.join("-"));
}}
}}function a(e){
var n=u.className,
t=Modernizr._config.classPrefix||"";if(p&&(n=n.baseVal), Modernizr._config.enableJSClass){
var o=new RegExp("(^|\\s)" + t + "no-js(\\s|$)");n=n.replace(o, "$1" + t + "js$2");
}Modernizr._config.enableClasses&&(n +=" " + t + e.join(" " + t), p ? u.className.baseVal=n:u.className=n);
}function i(){
return "function"!=typeof n.createElement ? n.createElement(arguments[0]):p ? n.createElementNS.call(n, "http://www.w3.org/2000/svg", arguments[0]):n.createElement.apply(n, arguments);
}function r(){
var e=n.body;return e||(e=i(p ? "svg":"body"), e.fake = !0), e;
}function l(e, t, o, s){
var a,
l,
f,
c,
d="modernizr",
p=i("div"),
h=r();if(parseInt(o, 10)) for (; o--;){
f=i("div"), f.id=s ? s[o]:d + (o + 1), p.appendChild(f);
}return a=i("style"), a.type="text/css", a.id="s" + d, (h.fake ? h:p).appendChild(a), h.appendChild(p), a.styleSheet ? a.styleSheet.cssText=e:a.appendChild(n.createTextNode(e)), p.id=d, h.fake&&(h.style.background="", h.style.overflow="hidden", c=u.style.overflow, u.style.overflow="hidden", u.appendChild(h)), l=t(p, e), h.fake ? (h.parentNode.removeChild(h), u.style.overflow=c, u.offsetHeight):p.parentNode.removeChild(p), !!l;
}var f=[],
c=[],
d={ _version: "3.3.1", _config: { classPrefix: "", enableClasses: !0, enableJSClass: !0, usePrefixes: !0 }, _q: [], on: function (e, n){
var t=this;setTimeout(function (){
n(t[e]);
}, 0);
}, addTest: function (e, n, t){
c.push({ name: e, fn: n, options: t });
}, addAsyncTest: function (e){
c.push({ name: null, fn: e });
}},
Modernizr=function (){};Modernizr.prototype=d, Modernizr=new Modernizr();var u=n.documentElement,
p="svg"===u.nodeName.toLowerCase(),
h=d._config.usePrefixes ? " -webkit- -moz- -o- -ms- ".split(" "):["", ""];d._prefixes=h;var m=d.testStyles=l;Modernizr.addTest("touchevents", function (){
var t;if("ontouchstart" in e||e.DocumentTouch&&n instanceof DocumentTouch) t = !0;else {
var o=["@media (", h.join("touch-enabled),("), "heartz", ")", "{#modernizr{top:9px;position:absolute}}"].join("");m(o, function (e){
t=9===e.offsetTop;
});
}return t;
}), s(), a(f), delete d.addTest, delete d.addAsyncTest;for (var v=0; v < Modernizr._q.length; v++){
Modernizr._q[v]();
}e.Modernizr=Modernizr;
}(window, document);
;"use strict";
;'use strict';
$(document).ready(function (){
var videos=$('iframe[src*="vimeo.com"], iframe[src*="youtube.com"]');
videos.each(function (){
var el=$(this);
el.wrap('<div class="responsive-embed widescreen"/>');
});
});
;'use strict';
jQuery(document).ready(function ($){
$('.bigtext').bigtext({
maxfontsize: 60,
minfontsize: 12
});
$('.entry-title').bigtext({
maxfontsize: 90
});
$('.slideshow').slick();
$('.ref-slider').slick({
dots: true,
infinite: true,
speed: 300,
slidesToShow: 1,
centerMode: true,
variableWidth: true,
autoplay: true,
autoplaySpeed: 3500,
pauseOnHover: false
});
$('#gallery').magnificPopup({
delegate: 'a',
type: 'image',
gallery: {
enabled: true
}});
$('a.book-now').magnificPopup({
type: 'inline',
midClick: true
});
$('a.book-now-custom').magnificPopup({
type: 'inline',
midClick: true
});
});
jQuery(function ($){
$(window).bind("resize", function (){
var height=$(window).height();
var header=$('#masthead').height();
$('#featured-hero').height(height - header);
$('.video-header').height(height - header);
}).trigger("resize");
});
;'use strict';
$(window).bind(' load resize orientationChange ', function (){
var footer=$("#footer-container");
var pos=footer.position();
var height=$(window).height();
height=height - pos.top;
height=height - footer.height() - 1;
function stickyFooter(){
footer.css({
'margin-top': height + 'px'
});
}
if(height > 0){
stickyFooter();
}});
;'use strict';
!function (root, factory){
if(typeof define==='function'&&define.amd){
define(['jquery'], factory);
}else if(typeof exports==='object'){
factory(require('jquery'));
}else{
factory(root.jQuery);
}}(this, function ($){
'use strict';
var PLUGIN_NAME='vidbg';
var DEFAULTS={
volume: 1,
playbackRate: 1,
muted: true,
loop: true,
autoplay: true,
position: '50% 50%',
overlay: false,
overlayColor: '#000',
overlayAlpha: 0.3,
resizing: true
};
var NOT_IMPLEMENTED_MSG='Not implemented';
function parseOptions(str){
var obj={};
var delimiterIndex;
var option;
var prop;
var val;
var arr;
var len;
var i;
arr=str.replace(/\s*:\s*/g, ':').replace(/\s*,\s*/g, ',').split(',');
for (i=0, len=arr.length; i < len; i++){
option=arr[i];
if(option.search(/^(http|https|ftp):\/\//)!==-1||option.search(':')===-1){
break;
}
delimiterIndex=option.indexOf(':');
prop=option.substring(0, delimiterIndex);
val=option.substring(delimiterIndex + 1);
if(!val){
val=undefined;
}
if(typeof val==='string'){
val=val==='true'||(val==='false' ? false:val);
}
if(typeof val==='string'){
val = !isNaN(val) ? +val:val;
}
obj[prop]=val;
}
if(prop==null&&val==null){
return str;
}
return obj;
}
function parsePosition(str){
str='' + str;
var args=str.split(/\s+/);
var x='50%';
var y='50%';
var len;
var arg;
var i;
for (i=0, len=args.length; i < len; i++){
arg=args[i];
if(arg==='left'){
x='0%';
}else if(arg==='right'){
x='100%';
}else if(arg==='top'){
y='0%';
}else if(arg==='bottom'){
y='100%';
}else if(arg==='center'){
if(i===0){
x='50%';
}else{
y='50%';
}}else{
if(i===0){
x=arg;
}else{
y=arg;
}}
}
return { x: x, y: y };}
function hexToRgb(hex){
var shorthandRegex=/^#?([a-f\d])([a-f\d])([a-f\d])$/i;
hex=hex.replace(shorthandRegex, function (m, r, g, b){
return r + r + g + g + b + b;
});
var result=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
return result ? {
r: parseInt(result[1], 16),
g: parseInt(result[2], 16),
b: parseInt(result[3], 16)
}:null;
}
function Vidbg(element, path, options){
this.$element=$(element);
if(typeof path==='string'){
path=parseOptions(path);
}
if(!options){
options={};}else if(typeof options==='string'){
options=parseOptions(options);
}
this.settings=$.extend({}, DEFAULTS, options);
this.path=path;
try {
this.init();
} catch (e){
if(e.message!==NOT_IMPLEMENTED_MSG){
throw e;
}}
}
Vidbg.prototype.init=function (){
var vidbg=this;
var path=vidbg.path;
var poster=path;
var sources='';
var $element=vidbg.$element;
var settings=vidbg.settings;
var position=parsePosition(settings.position);
var $video;
var $wrapper;
var $overlay;
$wrapper=vidbg.$wrapper=$('<div class="vidbg-container">').css({
position: 'absolute',
'z-index': -1,
top: 0,
left: 0,
bottom: 0,
right: 0,
overflow: 'hidden',
'-webkit-background-size': 'cover',
'-moz-background-size': 'cover',
'-o-background-size': 'cover',
'background-size': 'cover',
'background-repeat': 'no-repeat',
'background-position': position.x + ' ' + position.y
});
if(typeof path==='object'){
if(path.poster){
poster=path.poster;
}else{
if(path.mp4){
poster=path.mp4;
}else if(path.webm){
poster=path.webm;
}}
}
$wrapper.css('background-image', 'url(' + poster + ')');
if($element.css('position')==='static'){
$element.css('position', 'relative');
}
$element.css('z-index', '1');
if($element.is("body")){
$wrapper.css({
position: 'fixed'
});
}
$element.prepend($wrapper);
if(typeof path==='object'){
if(path.mp4){
sources +='<source src="' + path.mp4 + '" type="video/mp4">';
}
if(path.webm){
sources +='<source src="' + path.webm + '" type="video/webm">';
}
$video=vidbg.$video=$('<video>' + sources + '</video>');
}else{
$video=vidbg.$video=$('<video>' + '<source src="' + path + '" type="video/mp4">' + '<source src="' + path + '" type="video/webm">' + '</video>');
}
try {
$video
.prop({
autoplay: settings.autoplay,
loop: settings.loop,
volume: settings.volume,
muted: settings.muted,
defaultMuted: settings.muted,
playbackRate: settings.playbackRate,
defaultPlaybackRate: settings.playbackRate
});
} catch (e){
throw new Error(NOT_IMPLEMENTED_MSG);
}
$video.css({
margin: 'auto',
position: 'absolute',
'z-index': -1,
top: position.y,
left: position.x,
'-webkit-transform': 'translate(-' + position.x + ', -' + position.y + ')',
'-ms-transform': 'translate(-' + position.x + ', -' + position.y + ')',
'-moz-transform': 'translate(-' + position.x + ', -' + position.y + ')',
transform: 'translate(-' + position.x + ', -' + position.y + ')',
'max-width': 'none',
visibility: 'hidden',
opacity: 0
})
.one('canplaythrough.' + PLUGIN_NAME, function (){
vidbg.resize();
})
.one('playing.' + PLUGIN_NAME, function (){
$video.css({
visibility: 'visible',
opacity: 1
});
$wrapper.css('background-image', 'none');
});
$element.on('resize.' + PLUGIN_NAME, function (){
if(settings.resizing){
vidbg.resize();
}});
$wrapper.append($video);
$overlay=vidbg.$overlay=$('<div class="vidbg-overlay">').css({
position: 'absolute',
top: 0,
left: 0,
right: 0,
bottom: 0,
background: 'rgba(' + hexToRgb(settings.overlayColor).r + ', ' + hexToRgb(settings.overlayColor).g + ', ' + hexToRgb(settings.overlayColor).b + ', ' + settings.overlayAlpha + ')'
});
if(settings.overlay){
$wrapper.append($overlay);
}};
Vidbg.prototype.getVideoObject=function (){
return this.$video[0];
};
Vidbg.prototype.resize=function (){
if(!this.$video){
return;
}
var $wrapper=this.$wrapper;
var $video=this.$video;
var video=$video[0];
var videoHeight=video.videoHeight;
var videoWidth=video.videoWidth;
var wrapperHeight=$wrapper.height();
var wrapperWidth=$wrapper.width();
if(wrapperWidth / videoWidth > wrapperHeight / videoHeight){
$video.css({
width: wrapperWidth + 2,
height: 'auto'
});
}else{
$video.css({
width: 'auto',
height: wrapperHeight + 2
});
}};
Vidbg.prototype.destroy=function (){
delete $[PLUGIN_NAME].lookup[this.index];
this.$video&&this.$video.off(PLUGIN_NAME);
this.$element.off(PLUGIN_NAME).removeData(PLUGIN_NAME);
this.$wrapper.remove();
};
$[PLUGIN_NAME]={
lookup: []
};
$.fn[PLUGIN_NAME]=function (path, options){
var instance;
this.each(function (){
instance=$.data(this, PLUGIN_NAME);
instance&&instance.destroy();
instance=new Vidbg(this, path, options);
instance.index=$[PLUGIN_NAME].lookup.push(instance) - 1;
$.data(this, PLUGIN_NAME, instance);
});
return this;
};
$(document).ready(function (){
var $window=$(window);
$window.on('resize.' + PLUGIN_NAME, function (){
for (var len=$[PLUGIN_NAME].lookup.length, i=0, instance; i < len; i++){
instance=$[PLUGIN_NAME].lookup[i];
if(instance&&instance.settings.resizing){
instance.resize();
}}
});
$window.on('unload.' + PLUGIN_NAME, function (){
return false;
});
$(document).find('[data-' + PLUGIN_NAME + '-bg]').each(function (i, element){
var $element=$(element);
var options=$element.data(PLUGIN_NAME + '-options');
var path=$element.data(PLUGIN_NAME + '-bg');
$element[PLUGIN_NAME](path, options);
});
});
});