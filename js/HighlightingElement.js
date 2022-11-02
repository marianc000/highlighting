const HIGHLIGHT_NAME = 'match';

function mapNodes(container) {
    const nodes = textNodes(container);
    console.log(nodes.filter((n, i) => i < 20).map(n => "|" + n.nodeValue + "|").join('\n'));
    let c = 0;
    return nodes.map((node, i) => {
        let text = node.nodeValue;
        if (!node.parentElement.closest('pre')) {
            text = node.nodeValue.replace(/\n+ +/g, ' ');
            node.nodeValue = text;
        }
 
        let start = c;
        c += text.length;
        let end = c;
        return {
            start, end, text, node
        }
    });
}

function textNodes(parent) {
    return [...parent.childNodes].flatMap(node => {
        switch (node.nodeType) {
            case Node.TEXT_NODE:
                return node;
            case Node.ELEMENT_NODE:
                return textNodes(node);
            default:
                console.log(node.type, node.nodeValue)
                parent.removeChild(node);
        }
    }).filter(n => n);
}

function escape(str) {
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}


export default class HighlightingElement {

    constructor(container, hideMismatches) {
        this.nodes = mapNodes(container);
        this.text = container.textContent;
        this.container = container;
        this.hidableElements = [...container.children];
        this.hideMismatches = hideMismatches;
        console.log(this.text.substr(0, 100));
        console.log(this.nodes.map(n => n.text).join('').substr(0, 100));
    }

    findHidableParentIndex(el) {
        while (el.parentElement !== this.container) {
            el = el.parentElement;
        }
        return this.hidableElements.indexOf(el)
    }

    hideNotMatchingElements(ranges) {

        this.hidableElements.forEach(el => el.style.display = 'none');

        ranges.forEach(r => {
            const start = this.findHidableParentIndex(r.startContainer);
            const end = this.findHidableParentIndex(r.endContainer);
            for (let i = start; i <= end; i++) {
                this.hidableElements[i].style.display = '';
            }
        });
    }

    getBoundaryPoint(pos) {
        const node = this.nodes.find(n => n.start <= pos && n.end > pos);
        const offset = pos - node.start;
        return [node.node, offset];
    }

    highlight(str) {
        if (!str) {
            this.hidableElements.forEach(el => el.style.display = '');
            return CSS.highlights.delete(HIGHLIGHT_NAME);
        }

        const matches = [...this.text.matchAll(new RegExp(escape(str), 'ig'))];

        const ranges = matches.map(match => {

            const start = match.index;
            const end = start + match[0].length;

            const [startContainer, startOffset] = this.getBoundaryPoint(start);
            const [endContainer, endOffset] = this.getBoundaryPoint(end);

            return new StaticRange({ startContainer, startOffset, endContainer, endOffset });
        });

        if (this.hideMismatches) this.hideNotMatchingElements(ranges);
        CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(...ranges));
    }
}
