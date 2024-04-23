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

  const notesTree = getDir(path, path).children!;
  return notesTree;
}
