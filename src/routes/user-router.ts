import userService from "../service/user-service";
import validate from "../middleware/validation-middleware";
import { NextFunction, Request, Response, Router } from "express";
import { UserSignUpDTO, UserUpdateDTO } from "../dto/user-dto";
import {
  userIdScheme,
  userSignUpScheme,
  userUpdateScheme,
} from "../validation/user-validation";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAll();
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  validate(userSignUpScheme),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userUpdateDto = req.body as unknown as UserSignUpDTO;
      const user = await userService.createUser(userUpdateDto);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id",
  validate(userIdScheme),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id as unknown as number;
      const user = await userService.getById(userId);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  validate(userUpdateScheme),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bodyDto = req.body as unknown as UserUpdateDTO;
      const userId = req.params.id as unknown as number;
      const user = await userService.updateUser(userId, bodyDto);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  validate(userIdScheme),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id as unknown as number;
      const user = await userService.deleteUser(userId);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
