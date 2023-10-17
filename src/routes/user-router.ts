import { NextFunction, Request, Response, Router } from "express";
import { userService } from "../service";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.createGuest();
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as unknown as number;
    const user = await userService.getById(id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
