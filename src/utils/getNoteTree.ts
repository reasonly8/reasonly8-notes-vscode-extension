import * as fs from 'fs';
import { genId } from './genId';
import * as nodePath from 'path';

export type NodeType = 'directory' | 'file' | 'unknown';

type Node = {
  label: string;
  type: NodeType;
  id: string;
  children?: Node[];
};

export function getNotesTree(path: string) {
  function getDir(path: string, fullPath: string): Node {
    const item: Node = {
      id: genId(),
      label: path,
      type: 'unknown',
    };

    console.log(fullPath);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      item.type = 'directory';
    } else if (stats.isFile()) {
      item.type === 'file';
    }

    if (item.type !== 'directory') {
      return item;
    }
    const chidlPathList = fs.readdirSync(fullPath);

    item.children = chidlPathList.map(path => getDir(path, nodePath.join(fullPath, path)));
    return item;
  }

  const notesTree = getDir(path, path).children!;
  console.log(notesTree);
  return notesTree;
}
