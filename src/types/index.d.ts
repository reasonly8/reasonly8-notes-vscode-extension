export type NoteNodeType = 'directory' | 'file' | 'unknown';

export type NoteNode = {
  label: string;
  type: NoteNodeType;
  id: string;
  path: string;
  children?: NoteNode[];
};
