import { NoteNode } from '../types';
import * as nodePath from 'path';

export function getNodeByPath(notesTree: NoteNode[], path: any) {
  let target: NoteNode | null = null;

  const loop = (nodes: NoteNode[]) => {
    for (let i = 0; i < nodes.length; i++) {
      if (target) {
        break;
      }

      const commonPath = nodes[i].path.split(/[\\\/]/).join(nodePath.posix.sep);

      if (`/${commonPath}` === path) {
        target = nodes[i];
      }
      nodes[i].children && loop(nodes[i].children!);
    }
  };

  loop(notesTree);

  return target as NoteNode | null;
}
