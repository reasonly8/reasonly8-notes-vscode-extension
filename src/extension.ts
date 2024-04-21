import * as vscode from 'vscode';

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
    return {
      ...element,
      // command: {
      //   command: 'example.showMarkdown',
      //   title: 'Show Markdown Content',
      //   arguments: [element],
      // },
    };
  }

  getChildren(element?: TreeNode): vscode.ProviderResult<TreeNode[]> {
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

export function activate(context: vscode.ExtensionContext) {
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

// 当扩展被禁用时，这个方法会被调用
export function deactivate() {}

// 显示 Markdown 内容
function showMarkdownContent(content: string) {
  const panel = vscode.window.createWebviewPanel(
    'markdownPreview',
    'Markdown Preview',
    vscode.ViewColumn.Active,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  );

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
