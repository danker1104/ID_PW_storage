export interface Account {
  rowId?: number; // Internal row reference for CRUD
  siteName: string;
  url: string;
  id: string; // This is the username/login ID
  password: string;
}

export type ActionType = 'create' | 'update' | 'delete';

export interface GASRequest extends Partial<Account> {
  action: ActionType;
}
