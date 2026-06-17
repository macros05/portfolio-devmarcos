export interface LabExperiment {
  id: 'curl' | 'sdf' | 'lattice' | 'feedback';
  kind: string;
}

export const LAB_EXPERIMENTS: LabExperiment[] = [
  { id: 'curl',     kind: 'curl' },
  { id: 'sdf',      kind: 'sdf' },
  { id: 'lattice',  kind: 'lattice' },
  { id: 'feedback', kind: 'feedback' },
];
