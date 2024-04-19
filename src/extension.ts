import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('reasonly8-notes.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from Reasonly8 Notes!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
