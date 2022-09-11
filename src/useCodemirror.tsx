import {useRef, useState, useEffect} from "react";
import {EditorState, Extension, StateEffect} from "@codemirror/state";
import {
    EditorView,
    lineNumbers,
    highlightActiveLine,
    highlightActiveLineGutter, keymap,
} from "@codemirror/view";
import {markdown, markdownLanguage} from "@codemirror/lang-markdown";
import {HighlightStyle, indentUnit, syntaxHighlighting} from "@codemirror/language";
import {indentWithTab} from "@codemirror/commands"
import {languages} from '@codemirror/language-data'
import {getTheme, Theme} from "./codemirror/extensions/theme";


export type CodeMirrorProps = {
    initialDoc: string
    setDoc: (value: string) => void
    plugins: Extension[]
    live: CodeMirrorLiveProps
}

export type CodeMirrorLiveProps = {
    theme: Theme
}

function useCodemirror(props: CodeMirrorProps) {
    const ref = useRef(null);
    const [view, setView] = useState<EditorView | null>(null);
    let config = props.live;



    function setConfig(newConfig: Partial<CodeMirrorLiveProps>) {
        // console.log("Setting config to " + JSON.stringify(newConfig));
        // console.log("Comparing " + newConfig.theme + " to " + config.theme)
        // if(newConfig.theme) {
        //     console.log("Changing to " + newConfig.theme)
        //
        // }
        // config = {...config, ...newConfig};
    }

    const extensions = [
        keymap.of([indentWithTab]),
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        markdown({
            base: markdownLanguage, //Support GFM
            codeLanguages: languages
        }),
        getTheme(config.theme),
        indentUnit.of("    "),
        ...props.plugins,
        EditorView.lineWrapping,
        // EditorView.updateListener.of((update) => {
        //     if (update.docChanged) {
        //         const str = update.state.doc.toJSON().join("\n");
        //         if (str.includes("//theme")) {
        //             update.view.dispatch({effects: StateEffect.reconfigure.of([...extensions, getTheme('githubDark')])})
        //         } else {
        //             update.view.dispatch({effects: StateEffect.reconfigure.of([...extensions, getTheme('githubLight')])})
        //         }
        //         console.log("Content " + update.state.doc.toJSON());
        //         //if (update.state.doc.toJSON())
        //         //setDoc(update.state.doc.toString());
        //     }
        // }),
    ]

    if(view) {
        view?.dispatch({effects: StateEffect.reconfigure.of([...extensions, getTheme(config.theme)])});
    }

    useEffect(() => {
        if (!ref.current) return;
        const startState = EditorState.create({
            doc: props.initialDoc,
            //contentHeight: "100%",
            extensions
        });

        const view = new EditorView({
            state: startState,
            parent: ref.current,
        });

        //@ts-ignore //FIXME
        setView(view);
    }, [ref]);
    return [ref, view, setConfig];
}

export default useCodemirror;
