'use strict';
var I = Object.create;
var u = Object.defineProperty;
var P = Object.getOwnPropertyDescriptor;
var S = Object.getOwnPropertyNames;
var k = Object.getPrototypeOf,
  E = Object.prototype.hasOwnProperty;
var _ = (o, e) => {
    for (var t in e) u(o, t, { get: e[t], enumerable: !0 });
  },
  v = (o, e, t, s) => {
    if ((e && typeof e == 'object') || typeof e == 'function')
      for (let r of S(e))
        !E.call(o, r) &&
          r !== t &&
          u(o, r, { get: () => e[r], enumerable: !(s = P(e, r)) || s.enumerable });
    return o;
  };
var l = (o, e, t) => (
    (t = o != null ? I(k(o)) : {}),
    v(e || !o || !o.__esModule ? u(t, 'default', { value: o, enumerable: !0 }) : t, o)
  ),
  j = o => v(u({}, '__esModule', { value: !0 }), o);
var O = {};
_(O, { activate: () => B, deactivate: () => F });
module.exports = j(O);
var i = l(require('vscode')),
  h = l(require('path')),
  C = l(require('fs'));
var p = l(require('fs'));
var g = require('crypto');
function y() {
  function o() {
    let t = [];
    for (let s = 0; s < 4; s++) t.push((0, g.randomBytes)(4).toString('hex'));
    return t.join('-');
  }
  return o();
}
var T = l(require('path'));
function w(o) {
  function e(s, r) {
    let n = { id: y(), label: s, path: r, type: 'unknown' },
      c = p.statSync(r);
    if (
      (c.isDirectory()
        ? (n.type = 'directory')
        : c.isFile() &&
          ((n.type = 'file'), (n.originText = p.readFileSync(r, { encoding: 'utf-8' }))),
      n.type !== 'directory')
    )
      return n;
    let a = p.readdirSync(r);
    return (n.children = a.map(d => e(d, T.join(r, d)))), n;
  }
  return e(o, o).children;
}
function f(o, e) {
  let t = null,
    s = r => {
      for (let n = 0; n < r.length && !t; n++)
        r[n].id === e && (t = r[n]), r[n].children && s(r[n].children);
    };
  return s(o), t;
}
var b = l(require('path'));
function x(o, e) {
  let t = null,
    s = r => {
      for (let n = 0; n < r.length && !t; n++)
        `/${r[n].path.split(/[\\\/]/).join(b.posix.sep)}` === e && (t = r[n]),
          r[n].children && s(r[n].children);
    };
  return s(o), t;
}
var m = class extends i.TreeItem {
    constructor(t, s, r, n) {
      let { Collapsed: c, None: a } = i.TreeItemCollapsibleState,
        d = s === 'directory';
      super(t, d ? c : a);
      this.label = t;
      this.type = s;
      this.id = r;
      this.command = n;
      d || (this.iconPath = h.join(__dirname, '..', 'resources', 'md.png')),
        (this.tooltip = this.label);
    }
  },
  N = class {
    _onDidChangeTreeData = new i.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    notes = w(h.join(__dirname, '..', 'resources', 'notes'));
    treeNodes = this.notes.map(e =>
      e.type === 'file'
        ? new m(e.label, e.type, e.id, { command: 'openContent', title: 'Open Content' })
        : new m(e.label, e.type, e.id),
    );
    getTreeItem(e) {
      return e;
    }
    getChildren(e) {
      return e
        ? f(this.notes, e.id)?.children?.map(t =>
            t.type === 'file'
              ? new m(t.label, t.type, t.id, { command: 'openContent', title: 'Open Content' })
              : new m(t.label, t.type, t.id),
          ) || []
        : this.treeNodes;
    }
  };
function B(o) {
  let e = new N();
  i.window.registerTreeDataProvider('notesTree', e);
  let t = i.window.createTreeView('notesTree', { treeDataProvider: e }),
    s = i.commands.registerCommand('openNotes', () => {
      i.commands.executeCommand('workbench.view.extension.activitybar-extension');
    });
  o.subscriptions.push(s);
  let r = i.commands.registerCommand('openContent', async () => {
    let c = t.selection[0];
    if (!c) return;
    let a = f(e.notes, c.id);
    if (!a || a.type !== 'file') return;
    let d = a.path,
      D = await i.workspace.openTextDocument(i.Uri.file(d));
    i.window.showTextDocument(D, { preview: !0, preserveFocus: !0 });
  });
  o.subscriptions.push(r);
  let n = i.workspace.onDidSaveTextDocument(c => {
    let { path: a } = c.uri;
    if (a.indexOf('reasonly8-notes') === -1) return;
    let d = x(e.notes, a);
    d &&
      d.originText !== void 0 &&
      (i.window.showInformationMessage('This file is read-only.'),
      setTimeout(() => {
        C.writeFileSync(d.path, d.originText);
      }));
  });
  o.subscriptions.push(n);
}
function F() {}
0 && (module.exports = { activate, deactivate });
