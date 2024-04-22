import * as vscode from 'vscode';
import * as path from 'path';

// 定义一个节点类来表示树中的每个元素
class TreeNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}`;
    this.description = '';
  }
}

// 实现 TreeDataProvider 接口来提供数据
class TreeDataProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | null> =
    new vscode.EventEmitter<TreeNode | null>();
  readonly onDidChangeTreeData: vscode.Event<TreeNode | null> = this._onDidChangeTreeData.event;

  // 树中的数据
  private treeNodes: TreeNode[] = [
    new TreeNode('Parent1', vscode.TreeItemCollapsibleState.Collapsed),
    new TreeNode('Parent2', vscode.TreeItemCollapsibleState.Collapsed),
  ];

  getTreeItem(element: TreeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: TreeNode): vscode.ProviderResult<TreeNode[]> {
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
      console.log(selectedNode.label);

      const name = selectedNode.label.indexOf('Child1') !== -1 ? 'sample1.md' : 'sample2.md';
      const filePath = path.join(context.extensionPath, name);
      console.log(filePath);

      vscode.workspace.openTextDocument(vscode.Uri.file(filePath)).then(
        doc => {
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
                  } else {
                    vscode.window.showErrorMessage(
                      'Failed to open Markdown file in read-only mode.',
                    );
                  }
                });
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
