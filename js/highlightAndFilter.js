import HighlightingElement from './HighlightingElement.js';

const highlightingElement=new HighlightingElement(textDiv,true);

searchInput.addEventListener('input', onInput);
 
function onInput(e) {
    highlightingElement.highlight(e.target.value);
}
 