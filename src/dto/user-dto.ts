import { InferType } from "yup";
import {
  userSignUpScheme,
  userUpdateScheme,
} from "../validation/user-validation";

export type UserSignUpDTO = InferType<typeof userSignUpScheme>["body"];
export type UserUpdateDTO = InferType<typeof userUpdateScheme>["body"];
