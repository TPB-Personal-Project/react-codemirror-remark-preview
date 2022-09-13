import React, {createRef, ForwardedRef, Ref, RefObject} from "react";
import * as IncrementalDOM from 'incremental-dom'
import MarkdownIt from 'markdown-it'
//@ts-ignore
import * as tm from 'markdown-it-texmath'
import * as katex from 'katex'
//@ts-ignore
import MarkdownItIncrementalDOM from 'markdown-it-incremental-dom'
import './css/github-markdown.css'


export type IncrementalPreviewProps = {
    source: string
}

type IncrementalPreviewState = {}

export default class IncrementalPreview extends React.Component<IncrementalPreviewProps, IncrementalPreviewState> {

    private md: MarkdownIt
    private readonly ref: RefObject<HTMLDivElement>

    constructor(props: IncrementalPreviewProps) {
        super(props);

        this.md = new MarkdownIt({
            html: true,
            linkify: true,
            typographer: true
        }).use(MarkdownItIncrementalDOM, IncrementalDOM).use(tm, { engine: require('katex'),
                             delimiters: 'dollars',
                             katexOptions: { output: 'mathml', macros: {"\\RR": "\\mathbb{R}"} } });
        this.ref = createRef();


        console.log(require('katex').renderToString("\int_0^\\infty \\frac 1 e^x"))
    }


    render() {
        if (this.ref.current) {
            const func =      //@ts-ignore
                this.md.renderToIncrementalDOM(this.props.source);
            IncrementalDOM.patch(this.ref.current, func)
            //console.log("Func output " + func());
        }


        return <div id={"inc-container"} className={"markdown-body"} ref={this.ref}></div>;
    }
}