import {useState, createElement, Fragment, useRef} from "react";
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

function App() {
    const [doc, setDoc] = useState("");
    const [theme, setTheme] = useState(getTheme("githubDark"))
    const mouseIsOn = useRef(null);

    const defaultPlugin = () => (tree) => {
        treeData = tree; //treeData length corresponds to previewer's childNodes length
        return tree;
    };

    const markdownElem = document.getElementById("markdown");
    const previewElem = document.getElementById("preview");

    // const computeElemsOffsetTop = () => {
    //     let markdownChildNodesOffsetTopList = [];
    //     let previewChildNodesOffsetTopList = [];
    //
    //     treeData.children.forEach((child, index) => {
    //         if (child.type !== "element" || child.position === undefined) return;
    //
    //         const pos = child.position.start.offset;
    //         //const lineInfo = editorView.lineBlockAt(pos);
    //         const offsetTop = lineInfo.top;
    //         markdownChildNodesOffsetTopList.push(offsetTop);
    //         previewChildNodesOffsetTopList.push(
    //             previewElem.childNodes[index].offsetTop -
    //             previewElem.getBoundingClientRect().top //offsetTop from the top of preview
    //         );
    //     });
    //
    //     return [markdownChildNodesOffsetTopList, previewChildNodesOffsetTopList];
    // };
    // const handleMdScroll = () => {
    //     console.log(mouseIsOn.current);
    //     if (mouseIsOn.current !== "markdown") {
    //         return;
    //     }
    //     const [markdownChildNodesOffsetTopList, previewChildNodesOffsetTopList] =
    //         computeElemsOffsetTop();
    //     let scrollElemIndex;
    //     for (let i = 0; markdownChildNodesOffsetTopList.length > i; i++) {
    //         if (markdownElem.scrollTop < markdownChildNodesOffsetTopList[i]) {
    //             scrollElemIndex = i - 1;
    //             break;
    //         }
    //     }
    //
    //     if (
    //         markdownElem.scrollTop >=
    //         markdownElem.scrollHeight - markdownElem.clientHeight //true when scroll reached the bottom
    //     ) {
    //         previewElem.scrollTop =
    //             previewElem.scrollHeight - previewElem.clientHeight; //scroll to the bottom
    //         return;
    //     }
    //
    //     if (scrollElemIndex >= 0) {
    //         let ratio =
    //             (markdownElem.scrollTop -
    //                 markdownChildNodesOffsetTopList[scrollElemIndex]) /
    //             (markdownChildNodesOffsetTopList[scrollElemIndex + 1] -
    //                 markdownChildNodesOffsetTopList[scrollElemIndex]);
    //         previewElem.scrollTop =
    //             ratio *
    //             (previewChildNodesOffsetTopList[scrollElemIndex + 1] -
    //                 previewChildNodesOffsetTopList[scrollElemIndex]) +
    //             previewChildNodesOffsetTopList[scrollElemIndex];
    //     }
    // };
    //
    // const handlePreviewScroll = () => {
    //     if (mouseIsOn.current !== "preview") {
    //         return;
    //     }
    //     const [markdownChildNodesOffsetTopList, previewChildNodesOffsetTopList] =
    //         computeElemsOffsetTop();
    //     let scrollElemIndex;
    //     for (let i = 0; previewChildNodesOffsetTopList.length > i; i++) {
    //         if (previewElem.scrollTop < previewChildNodesOffsetTopList[i]) {
    //             scrollElemIndex = i - 1;
    //             break;
    //         }
    //     }
    //
    //     if (scrollElemIndex >= 0) {
    //         let ratio =
    //             (previewElem.scrollTop -
    //                 previewChildNodesOffsetTopList[scrollElemIndex]) /
    //             (previewChildNodesOffsetTopList[scrollElemIndex + 1] -
    //                 previewChildNodesOffsetTopList[scrollElemIndex]);
    //         markdownElem.scrollTop =
    //             ratio *
    //             (markdownChildNodesOffsetTopList[scrollElemIndex + 1] -
    //                 markdownChildNodesOffsetTopList[scrollElemIndex]) +
    //             markdownChildNodesOffsetTopList[scrollElemIndex];
    //     }
    // };
    //
    // const md = unified()
    //     .use(remarkParse)
    //     .use(remarkGfm)
    //     .use(remarkMath)
    //     .use(remarkRehype)
    //     .use(defaultPlugin)
    //     .use(rehypeMathJaxSvg)
    //     .use(rehypeReact, {createElement, Fragment})
    //     .processSync(doc).result;

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
            //
            <div id="editor-wrapper" >

                <ReactCodeMirror extensions={extensions} theme={theme}/>
                <div
                    id="preview"
                    className="markdown-body"
                    // onScroll={handlePreviewScroll}
                    onMouseEnter={() => (mouseIsOn.current = "preview")}
                >
                    {/*{md}*/}
                </div>
            </div>


        </>
    );
}

export default App;
