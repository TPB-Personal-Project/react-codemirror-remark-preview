import {Doc, Path, Error} from "sharedb/lib/client";
import {EditorView, ViewPlugin, ViewUpdate} from '@codemirror/view';
//@ts-ignore
import {canOpAffectPath, changesToOpJSON1, opToChangesJSON1} from './ot'
import {EditorState} from "@codemirror/state";


export const createJSON1SyncPlugin = (doc: Doc, path: Path) => {
    return ViewPlugin.fromClass(
        class {

            private lock: boolean = false;

            constructor(private view: EditorView) {
                // FIXME
                doc.subscribe(this.docSubscription)
            }

            private docSubscription = (err: Error) => {
                if (!err) {
                    const currentState = this.view.state;
                    // this.view.setState(EditorState.create({
                    //         //...currentState,
                    //         doc: doc.data.content
                    //     }
                    // ))
                    this.performLockedOp(() => {
                        this.view.dispatch({changes: {from: 0, insert: doc.data.content}})
                    })

                    doc.on('op', this.handleOp)
                }
            }

            private performLockedOp = (op: () => void) => {
                this.lock = true;
                op();
                this.lock = false;
            }

            // FIXME: type
            private handleOp = (op: any) => {
                // Ignore ops fired as a result of a change from `update` (this.lock).
                // Ignore ops that have different, irrelevant, paths (canOpAffectPath).
                if (!this.lock && canOpAffectPath(op, path)) {
                    this.performLockedOp(() => {
                        this.view.dispatch({changes: opToChangesJSON1(op)});
                    })

                }
            }

            update = (update: ViewUpdate) => {
                // Ignore updates fired as a result of an op from `handleOp` (this.lock).
                // Ignore updates that do not change the doc (update.docChanged).
                console.log(`View update. Lock ${this.lock} Change ${update.docChanged}`)
                if (!this.lock && update.docChanged) {
                    console.log("Submitting op")
                    this.performLockedOp(() => {
                        doc.submitOp(
                            changesToOpJSON1(path, update.changes, update.startState.doc)
                        );
                    })
                    console.log("Submitted op")
                }
            }

            destroy = () => {
                doc.unsubscribe(this.docSubscription)
                doc.off('op', this.handleOp);
            }
        }
    )
}