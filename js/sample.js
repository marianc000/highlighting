const bs=textDiv.querySelectorAll('b');
const startContainer=bs[0].childNodes[0], startOffset=9,endContainer=bs[1].childNodes[0], endOffset=4;

const range= new StaticRange({ startContainer, startOffset, endContainer, endOffset });

const highlight=new Highlight( range );
CSS.highlights.set('match', highlight);