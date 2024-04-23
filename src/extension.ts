import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getNotesTree } from './utils/getNoteTree';
import { NoteNodeType } from './types';
import { getNodeById } from './utils/getNodeById';
import { getNodeByPath } from './utils/getNodeByPath';

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

  const disposable3 = vscode.workspace.onDidSaveTextDocument(event => {
    const { path } = event.uri;
    if (path.indexOf('reasonly8-notes') === -1) {
      return;
    }

    const target = getNodeByPath(treeDataProvider.notes, path);
    if (!target) {
      return;
    }

    if (target.originText === undefined) {
      return;
    }

    vscode.window.showInformationMessage('This file is read-only.');

    setTimeout(() => {
      fs.writeFileSync(target.path, target.originText!);
    });
  });
  context.subscriptions.push(disposable3);
}

export function deactivate() {}
