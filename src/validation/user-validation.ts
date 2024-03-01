import { number, object, string } from "yup";

const googleRegisterScheme = object({
  body: object({
    idToken: string().required(),
  }),
});

export { googleRegisterScheme };
