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
        return {
            ...element,
            // command: {
            //   command: 'example.showMarkdown',
            //   title: 'Show Markdown Content',
            //   arguments: [element],
            // },
        };
    }
    getChildren(element) {
        if (!element) {
            return this.treeNodes;
        }
        // 当元素是父节点时，返回子节点
        return [
            new TreeNode(`${element.label} -> Child1`, vscode.TreeItemCollapsibleState.None),
            new TreeNode(`${element.label} -> Child3`, vscode.TreeItemCollapsibleState.None),
        ];
    }
}
function activate(context) {
    const treeDataProvider = new TreeDataProvider();
    vscode.window.registerTreeDataProvider('notesTree', treeDataProvider);
    const treeView = vscode.window.createTreeView('notesTree', {
        treeDataProvider,
    });
    // 注册 TreeView 的点击事件处理程序
    treeView.onDidChangeSelection(event => {
        const selectedNode = event.selection[0];
        if (selectedNode && selectedNode.label.indexOf('Child') !== -1) {
            // // 获取点击的节点信息
            // const markdownContent = `# Test\n\nHello, World!`;
            // // 在 Editor Area 中显示 Markdown 内容
            // vscode.workspace
            //   .openTextDocument({ content: markdownContent, language: 'markdown' })
            //   .then(doc => {
            //     vscode.window.showTextDocument(doc, { preview: false });
            //   });
            const markdownContent = `# Test\n\nHello, World!`;
            showMarkdownContent(markdownContent);
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
// 显示 Markdown 内容
function showMarkdownContent(content) {
    const panel = vscode.window.createWebviewPanel('markdownPreview', 'Markdown Preview', vscode.ViewColumn.Active, {
        enableScripts: true,
        retainContextWhenHidden: true,
    });
    panel.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Markdown Preview</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
              }
              textarea {
                  width: 100%;
                  height: 100%;
                  border: none;
                  resize: none;
                  pointer-events: none;
              }
          </style>
      </head>
      <body>
          <textarea readonly>${content}</textarea>
      </body>
      </html>
  `;
}
//# sourceMappingURL=extension.js.map