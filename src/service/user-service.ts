import { db } from "../data/database";
import { User } from "../data/models/users/users";
import { HttpException } from "../utils/http-exception";

const getById = async (userId: number): Promise<User> => {
  const user = await db.User.findOne({
    attributes: {
      exclude: ["google_token", "type_id", "active", "last_name", "email"],
    },
    where: { id: userId },
  });
  if (!user) throw new HttpException(404, "User not found!");
  return user;
};

export default {
  getById,
};
