import { object, string } from "yup";

export const userSignUpScheme = object({
  body: object({
    firstName: string().required().trim().min(1),
    lastName: string().required().trim().min(1),
    email: string().required().trim().email(),
    password: string().required().trim().min(8),
  }),
});

export const userUpdateScheme = object({
  body: object({
    firstName: string().required().trim().min(1),
    lastName: string().required().trim().min(1),
    password: string().required().trim().min(8),
  }),
});
