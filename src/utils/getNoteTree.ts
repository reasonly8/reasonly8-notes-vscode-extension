import * as fs from 'fs';
import { genId } from './genId';
import * as nodePath from 'path';
import { NoteNode } from '../types';

export function getNotesTree(path: string) {
  function getDir(path: string, fullPath: string): NoteNode {
    const item: NoteNode = {
      id: genId(),
      label: path,
      path: fullPath,
      type: 'unknown',
    };

    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      item.type = 'directory';
    } else if (stats.isFile()) {
      item.type = 'file';
      item.originText = fs.readFileSync(fullPath, { encoding: 'utf-8' });
    }

    if (item.type !== 'directory') {
      return item;
    }
    const chidlPathList = fs.readdirSync(fullPath);

    item.children = chidlPathList.map(path => getDir(path, nodePath.join(fullPath, path)));
    return item;
  }

  const notesTree = getDir(path, path).children;
  if (Array.isArray(notesTree)) {
    // 返回前先过滤掉 .github 中的内容
    return notesTree
      .filter(note => note.label === '.github')
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return 0;
      });
  } else {
    return [];
  }
}
