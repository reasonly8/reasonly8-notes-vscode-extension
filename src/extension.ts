import * as vscode from 'vscode';
import * as path from 'path';
import { getNotesTree, NodeType } from './utils/getNoteTree';

// 定义一个节点类来表示树中的每个元素
class TreeNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly type: NodeType,
    public readonly id: string,
  ) {
    const { Collapsed, None } = vscode.TreeItemCollapsibleState;
    const isDir = type === 'directory';

    super(label, isDir ? Collapsed : None);

    if (!isDir) {
      this.iconPath = path.join(__dirname, '..', 'resources', 'md.svg');
    }

    this.tooltip = `${this.label}`;
  }
}

// 实现 TreeDataProvider 接口来提供数据
class TreeDataProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | null> =
    new vscode.EventEmitter<TreeNode | null>();

  readonly onDidChangeTreeData: vscode.Event<TreeNode | null> = this._onDidChangeTreeData.event;

  readonly notes = getNotesTree(path.join(__dirname, '..', 'resources', 'notes'));

  private treeNodes: TreeNode[] = this.notes.map(note => {
    return new TreeNode(note.label, note.type, note.id);
  });

  getTreeItem(element: TreeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element: TreeNode): vscode.ProviderResult<TreeNode[]> {
    if (!element) {
      return this.treeNodes;
    }
    return this.notes
      .find(note => note.id === element.id)!
      .children!.map(note => {
        return new TreeNode(note.label, note.type, note.id);
      });
  }
}

export function activate(context: vscode.ExtensionContext) {
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
      const name = selectedNode.label.indexOf('Child1') !== -1 ? 'sample1.md' : 'sample2.md';
      const filePath = path.join(context.extensionPath, name);

      vscode.workspace.openTextDocument(vscode.Uri.file(filePath)).then(
        doc => {
          vscode.window.showTextDocument(doc, {
            preview: true,
            preserveFocus: true,
          });
        },
        error => {
          vscode.window.showErrorMessage('Failed to open Markdown file in editor.');
          console.error(error);
        },
      );
    }
  });

  const disposable = vscode.commands.registerCommand('openNotes', () => {
    vscode.commands.executeCommand('workbench.view.extension.activitybar-extension');
  });

  context.subscriptions.push(disposable);
}

// 当扩展被禁用时，这个方法会被调用
export function deactivate() {}
