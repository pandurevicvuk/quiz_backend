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
    firstName: string().trim().min(1),
    lastName: string().trim().min(1),
    password: string().trim().min(8),
  }),
  params: object({
    id: number().required(),
  }),
});

const userIdScheme = object({
  params: object({
    id: number().required(),
  }),
});

const googleRegisterScheme = object({
  body: object({
    firstName: string(),
    lastName: string(),
    email: string().required(),
    token: string().required(),
    googleId: string().required(),
  }),
});

export {
  userSignUpScheme,
  userUpdateScheme,
  userIdScheme,
  googleRegisterScheme,
};
