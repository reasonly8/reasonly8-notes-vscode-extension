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
// 定义一个节点类来表示树中的每个元素
class TreeNode extends vscode.TreeItem {
    label;
    collapsibleState;
    command;
    constructor(label, collapsibleState, command) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.tooltip = `${this.label}`;
        this.description = '';
    }
}
// 实现 TreeDataProvider 接口来提供数据
class TreeDataProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    // 树中的数据
    treeNodes = [
        new TreeNode('Parent1', vscode.TreeItemCollapsibleState.Collapsed),
        new TreeNode('Parent2', vscode.TreeItemCollapsibleState.Collapsed),
    ];
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return this.treeNodes;
        }
        // 当元素是父节点时，返回子节点
        return [
            new TreeNode(`${element.label} -> Child1`, vscode.TreeItemCollapsibleState.None),
            new TreeNode(`${element.label} -> Child2`, vscode.TreeItemCollapsibleState.None),
        ];
    }
}
function activate(context) {
    const treeDataProvider = new TreeDataProvider();
    vscode.window.registerTreeDataProvider('notesTree', treeDataProvider);
    const treeView = vscode.window.createTreeView('notesTree', {
        treeDataProvider,
    });
    const markdownContent = `# Sample Markdown\n\nThis is a sample Markdown file.`;
    const filePath = path.join(context.extensionPath, 'sample.md');
    // Write Markdown content to file
    // fs.writeFile(filePath, markdownContent, err => {
    //   if (err) {
    //     vscode.window.showErrorMessage('Failed to write Markdown file.');
    //     return console.error(err);
    //   }
    //   vscode.window.showInformationMessage('Markdown file saved successfully!');
    // });
    // 注册 TreeView 的点击事件处理程序
    treeView.onDidChangeSelection(event => {
        const selectedNode = event.selection[0];
        if (selectedNode && selectedNode.label.indexOf('Child') !== -1) {
            console.log(selectedNode.label);
            const name = selectedNode.label.indexOf('Child1') !== -1 ? 'sample1.md' : 'sample2.md';
            const filePath = path.join(context.extensionPath, name);
            console.log(filePath);
            vscode.workspace.openTextDocument(vscode.Uri.file(filePath)).then(doc => {
                vscode.window
                    .showTextDocument(doc, {
                    preview: true,
                    preserveFocus: true,
                })
                    .then(editor => {
                    editor
                        .edit(editBuilder => {
                        // Do nothing, as we don't want to make any changes
                    })
                        .then(success => {
                        if (success) {
                            vscode.window.showInformationMessage('Markdown file opened in read-only mode.');
                        }
                        else {
                            vscode.window.showErrorMessage('Failed to open Markdown file in read-only mode.');
                        }
                    });
                });
            }, error => {
                vscode.window.showErrorMessage('Failed to open Markdown file in editor.');
                console.error(error);
            });
        }
    });
    const disposable = vscode.commands.registerCommand('openNotes', () => {
        vscode.commands.executeCommand('workbench.view.extension.activitybar-extension');
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// 当扩展被禁用时，这个方法会被调用
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map