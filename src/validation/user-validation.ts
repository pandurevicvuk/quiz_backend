import { number, object, string } from "yup";

const userSignUpScheme = object({
  body: object({
    firstName: string().required().trim().min(1),
    lastName: string().required().trim().min(1),
    email: string().required().trim().email(),
    password: string().required().trim().min(8),
  }),
});

const userUpdateScheme = object({
  body: object({
    firstName: string().required().trim().min(1),
    lastName: string().required().trim().min(1),
    password: string().required().trim().min(8),
  }),
  parameters: object({
    id: number().required(),
  }),
});

const userIdScheme = object({
  parameters: object({
    id: number().required(),
  }),
});

export { userSignUpScheme, userUpdateScheme, userIdScheme };
