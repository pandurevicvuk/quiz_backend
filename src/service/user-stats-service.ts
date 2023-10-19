import { db } from "../data/database";
import { UserStats } from "../data/models/user_stats/user-stats";
import { User } from "../data/models/users/users";
import { HttpException } from "../utils/http-exception";
import { Logger } from "../utils/logger";

const getById = async (userId: number): Promise<UserStats> => {
  const userStats = await db.UserStats.findOne({
    where: { id: userId },
  });
  if (!userStats) throw new HttpException(404, "User stats not found!");
  return userStats;
};

export default {
  getById,
};
