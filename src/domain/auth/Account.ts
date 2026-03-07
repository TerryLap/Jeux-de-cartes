export type AuthMode = 'signin' | 'signup';

export interface Account {
  nickname: string;
  email: string;
  password: string;
}
