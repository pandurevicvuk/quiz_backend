import { NextFunction, Request, Response, Router } from "express";
import { userService } from "../service";
import { GoogleRegisterDTO } from "../dto/user-dto";
import { googleRegisterScheme } from "../validation/user-validation";
import validate from "../middleware/validation-middleware";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.createGuest();
    res.status(201).json(user);
  } catch (error) {
    console.log("ERROR: ", error);
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

router.post(
  "/google-register",
  validate(googleRegisterScheme),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as unknown as GoogleRegisterDTO;
      const user = await userService.validateGoogleToken(dto);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
