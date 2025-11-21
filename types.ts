export enum Position {
  KETUA = 'Ketua',
  SEKRETARIS = 'Sekretaris',
  BENDAHARA = 'Bendahara'
}

export interface Candidate {
  id: string;
  name: string;
  position: Position;
  photoUrl: string;
  vision: string;
  mission: string[];
}

export interface VoteCount {
  candidateId: string;
  count: number;
}

export type ViewMode = 'home' | 'voting' | 'results';
