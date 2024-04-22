import { NoteNode } from '../types';

export function getNodeById(notesTree: NoteNode[], id: string) {
  let target: NoteNode | null = null;

  const loop = (nodes: NoteNode[]) => {
    for (let i = 0; i < nodes.length; i++) {
      if (target) {
        break;
      }
      if (nodes[i].id === id) {
        target = nodes[i];
      }
      nodes[i].children && loop(nodes[i].children!);
    }
  };

  loop(notesTree);

  return target as NoteNode | null;
}
