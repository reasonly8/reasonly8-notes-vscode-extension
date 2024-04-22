"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const getNoteTree_1 = require("./utils/getNoteTree");
const getNodeById_1 = require("./utils/getNodeById");
const fs = __importStar(require("fs"));
class TreeNode extends vscode.TreeItem {
    label;
    type;
    id;
    command;
    constructor(label, type, id, command) {
        const { Collapsed, None } = vscode.TreeItemCollapsibleState;
        const isDir = type === 'directory';
        super(label, isDir ? Collapsed : None);
        this.label = label;
        this.type = type;
        this.id = id;
        this.command = command;
        if (!isDir) {
            this.iconPath = path.join(__dirname, '..', 'resources', 'md.svg');
        }
        this.tooltip = this.label;
    }
}
class TreeDataProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    notes = (0, getNoteTree_1.getNotesTree)(path.join(__dirname, '..', 'resources', 'notes'));
    treeNodes = this.notes.map(note => {
        if (note.type === 'file') {
            return new TreeNode(note.label, note.type, note.id, {
                command: 'openContent',
                title: 'Open Content',
            });
        }
        else {
            return new TreeNode(note.label, note.type, note.id);
        }
    });
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return this.treeNodes;
        }
        return ((0, getNodeById_1.getNodeById)(this.notes, element.id)?.children?.map(note => {
            if (note.type === 'file') {
                return new TreeNode(note.label, note.type, note.id, {
                    command: 'openContent',
                    title: 'Open Content',
                });
            }
            else {
                return new TreeNode(note.label, note.type, note.id);
            }
        }) || []);
    }
}
const tempFile = {};
function activate(context) {
    const treeDataProvider = new TreeDataProvider();
    vscode.window.registerTreeDataProvider('notesTree', treeDataProvider);
    const treeView = vscode.window.createTreeView('notesTree', {
        treeDataProvider,
    });
    const disposable1 = vscode.commands.registerCommand('openNotes', () => {
        vscode.commands.executeCommand('workbench.view.extension.activitybar-extension');
    });
    context.subscriptions.push(disposable1);
    const disposable2 = vscode.commands.registerCommand('openContent', async () => {
        const selectedNode = treeView.selection[0];
        if (!selectedNode) {
            return;
        }
        const target = (0, getNodeById_1.getNodeById)(treeDataProvider.notes, selectedNode.id);
        if (!target) {
            return;
        }
        if (target.type !== 'file') {
            return;
        }
        const filePath = target.path;
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
        vscode.window.showTextDocument(doc, { preview: true, preserveFocus: true });
    });
    context.subscriptions.push(disposable2);
    const disposable3 = vscode.workspace.onWillSaveTextDocument(event => {
        event.waitUntil(new Promise(() => {
            const { path } = event.document.uri;
            const data = fs.readFileSync(path);
            tempFile.data = data;
            tempFile.path = path;
        }));
    });
    context.subscriptions.push(disposable3);
    const disposable4 = vscode.workspace.onDidChangeTextDocument(event => {
        console.log(event.document.uri.path, tempFile.path);
        if (event.document.uri.path === tempFile.path && tempFile.data) {
            fs.writeFileSync(tempFile.path, tempFile.data);
        }
    });
    context.subscriptions.push(disposable4);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map