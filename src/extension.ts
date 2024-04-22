import * as vscode from 'vscode';
import * as path from 'path';
import { getNotesTree } from './utils/getNoteTree';
import { NoteNodeType } from './types';
import { getNodeById } from './utils/getNodeById';
import * as fs from 'fs';

class TreeNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly type: NoteNodeType,
    public readonly id: string,
    public readonly command?: vscode.Command,
  ) {
    const { Collapsed, None } = vscode.TreeItemCollapsibleState;
    const isDir = type === 'directory';

    super(label, isDir ? Collapsed : None);

    if (!isDir) {
      this.iconPath = path.join(__dirname, '..', 'resources', 'md.svg');
    }

    this.tooltip = this.label;
  }
}

class TreeDataProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | null> =
    new vscode.EventEmitter<TreeNode | null>();

  readonly onDidChangeTreeData: vscode.Event<TreeNode | null> = this._onDidChangeTreeData.event;

  readonly notes = getNotesTree(path.join(__dirname, '..', 'resources', 'notes'));

  private treeNodes: TreeNode[] = this.notes.map(note => {
    if (note.type === 'file') {
      return new TreeNode(note.label, note.type, note.id, {
        command: 'openContent',
        title: 'Open Content',
      });
    } else {
      return new TreeNode(note.label, note.type, note.id);
    }
  });

  getTreeItem(element: TreeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element: TreeNode): vscode.ProviderResult<TreeNode[]> {
    if (!element) {
      return this.treeNodes;
    }
    return (
      getNodeById(this.notes, element.id)?.children?.map(note => {
        if (note.type === 'file') {
          return new TreeNode(note.label, note.type, note.id, {
            command: 'openContent',
            title: 'Open Content',
          });
        } else {
          return new TreeNode(note.label, note.type, note.id);
        }
      }) || []
    );
  }
}

const tempFile: { path?: string; data?: Buffer } = {};

export function activate(context: vscode.ExtensionContext) {
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

    const target = getNodeById(treeDataProvider.notes, selectedNode.id);
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
    event.waitUntil(
      new Promise(() => {
        const { path } = event.document.uri;
        const data = fs.readFileSync(path);
        tempFile.data = data;
        tempFile.path = path;
      }),
    );
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

export function deactivate() {}
