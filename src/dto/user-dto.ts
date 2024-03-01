import { InferType } from "yup";
import { googleRegisterScheme } from "../validation/user-validation";

export type GoogleRegisterDTO = InferType<typeof googleRegisterScheme>["body"];
