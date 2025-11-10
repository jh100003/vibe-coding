
export enum Role {
  USER = 'user',
  MODEL = 'model',
  ERROR = 'error',
}

export interface Message {
  id: string;
  role: Role;
  parts: string;
}
