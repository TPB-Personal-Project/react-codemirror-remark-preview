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
    updateDebounce: number
}

type IncrementalPreviewState = {}


const katexMacros = {"\\RR": "\\mathbb{R}", "\\f": "#1f(#2)"}

export default class IncrementalPreview extends React.Component<IncrementalPreviewProps, IncrementalPreviewState> {

    private md: MarkdownIt
    private readonly ref: RefObject<HTMLDivElement>
    private timer: NodeJS.Timeout | null = null;

    constructor(props: IncrementalPreviewProps) {
        super(props);

        this.md = new MarkdownIt({
            html: true,
            linkify: true,
            typographer: true
        }).use(MarkdownItIncrementalDOM, IncrementalDOM).use(tm, {
            engine: require('katex'),
            delimiters: 'dollars',
            katexOptions: {output: 'mathml', macros: katexMacros}
        });
        this.ref = createRef();
    }

    debounce(func: () => void, timeout = 300) {
        if (timeout > 0) {
            if (this.timer) clearTimeout(this.timer);
            this.timer = setTimeout(func, timeout);
        } else {
            func();
        }

    }


    render() {
        this.debounce(() => {
            if (this.ref.current) {
                //@ts-ignore
                const func = this.md.renderToIncrementalDOM(this.props.source);
                IncrementalDOM.patch(this.ref.current, func)
                //console.log("Func output " + func());
            }
        })


        return <div id={"inc-container"} className={"markdown-body"} ref={this.ref}></div>;
    }

    public static defaultProps: Partial<IncrementalPreviewProps> = {
        updateDebounce: 300
    }

}

