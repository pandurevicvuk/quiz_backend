import { InferType } from "yup";
import {
  userIdScheme,
  userSignUpScheme,
  userUpdateScheme,
} from "../validation/user-validation";

export type UserSignUpDTO = InferType<typeof userSignUpScheme>["body"];
export type UserUpdateDTO = InferType<typeof userUpdateScheme>["body"];
export type UserIdDTO = InferType<typeof userIdScheme>["params"];
export type UserDTO = {
  firstName: string;
  lastName: string;
  email: string;
  id: number;
};
