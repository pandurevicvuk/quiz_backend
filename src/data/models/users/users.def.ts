// import { Bank } from '../bank/bank';

export interface UserAttributes {
  id: number;
  active: boolean;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  googleId?: string;
  photo?: string;
  typeId: number;
}
