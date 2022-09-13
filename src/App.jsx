import {useState, createElement, Fragment, useRef, Suspense, useEffect} from "react";
import "./App.css";
import {unified} from "unified";
import remarkParse from "remark-parse/lib";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeReact from "rehype-react/lib";
import useCodemirror from "./useCodemirror";
import "github-markdown-css/github-markdown-light.css";
import remarkMath from "remark-math";
import rehypeMathJaxSvg from "rehype-mathjax";

import * as sdb from 'sharedb/lib/client'
import * as json1 from 'ot-json1'
import {Connection} from "sharedb/lib/client";
import ReconnectingWebSocket from "reconnecting-websocket";
import {createJSON1SyncPlugin} from "./codemirror/ShareDBPlugin";
import Select from "react-select";
import ReactCodeMirror from "@uiw/react-codemirror";
import {EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers} from "@codemirror/view";
import {indentWithTab} from "@codemirror/commands";
import {markdown, markdownLanguage} from "@codemirror/lang-markdown";
import {languages} from "@codemirror/language-data";
import {getTheme} from "./codemirror/extensions/theme";
import {indentUnit} from "@codemirror/language";
import {colorPicker} from "./codemirror/extensions/color-picker";
import {hyperLink} from "@uiw/codemirror-extensions-hyper-link";
import MarkdownEditor from "@uiw/react-markdown-editor";
import IncrementalPreview from "./preview/IncrementalPreview";

sdb.types.register(json1.type);

const socket = new ReconnectingWebSocket("ws://127.0.0.1:8080")

const conn = new Connection(socket);

const doc = conn.get("examples", "textarea");

const syncPlugin = createJSON1SyncPlugin(doc, ["content"])


const extensions = [
    keymap.of([indentWithTab]),
    lineNumbers(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    markdown({
        base: markdownLanguage, //Support GFM
        codeLanguages: languages
    }),
    indentUnit.of("    "),
    EditorView.lineWrapping,
    syncPlugin,
    colorPicker,
    hyperLink,
]

let treeData;


function RenderPreview(props) {
    const [curProps, setCurProps] = useState(null);

    useEffect(() => {

    })

    return <Suspense fallback={<div><h1>Rendering</h1></div>}>
        <MarkdownEditor.Markdown props={props} onScroll={() => console.log("Preview scroll detected")}/>
    </Suspense>

}

function App() {
    const [doc, setDoc] = useState("");
    const [theme, setTheme] = useState(getTheme("githubDark"))


    function changeTheme(value) {
        console.log("Changing theme");
        const theme = value.value;
        setTheme(getTheme(theme));
    }

    return (
        <>
            <Select onChange={changeTheme} options={[
                {value: 'githubLight', label: 'Github Light'},
                {value: 'githubDark', label: 'Github Dark'},
                {value: 'darcula', label: 'Darcula'},
                {value: 'eclipse', label: 'Eclipse'},
                {value: 'xcodeLight', label: 'XCode Light'},
                {value: 'xcodeDark', label: 'XCode Dark'},
                {value: 'bbedit', label: 'BBEdit'}
            ]
            }/>

            <div id="editor-wrapper" >

                <MarkdownEditor reExtensions={extensions} theme={theme} renderPreview={(props) => <IncrementalPreview source={props.source}/> } />

            </div>



        </>
    );
}

export default App;
