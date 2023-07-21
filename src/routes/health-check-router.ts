import healthCheck from "../service/health-check-service";
import { Request, Response, Router } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    var dbStatus = await healthCheck.checkDatabaseConnection();
    res.status(200).send({
      serverStatus: "SERVER UP",
      uptime: healthCheck.getUpTime(),
      timestamp: new Date(),
      databaseStatus: dbStatus,
    });
  } catch (error) {
    res.status(503).send();
  }
});

export default router;
