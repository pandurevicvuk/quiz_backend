import { number, object, string } from "yup";

const playerScheme = object({
  body: object({
    id: number().required(),
    name: string().required().trim().min(1),
    photo: string().required(),
  }),
});

export { playerScheme };
