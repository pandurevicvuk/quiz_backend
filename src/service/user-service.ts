import { db } from "../data/database";
import { User } from "../data/models/users/users";
import { HttpException } from "../utils/http-exception";
import { Logger } from "../utils/logger";

const getById = async (userId: number): Promise<User> => {
  const user = await db.User.findOne({
    where: { id: userId },
  });
  if (!user) throw new HttpException(404, "User not found!");
  return user;
};

const createGuest = async (): Promise<any> => {
  const maxRetries = 10;
  var retries = 0;

  while (retries < maxRetries) {
    try {
      const count = await db.User.count();

      const { id, firstName, lastName, username, photo } = await db.User.create(
        {
          active: true,
          firstName: `Guest`,
          lastName: `Guest`,
          username: `guest#${count + 1}`,
          photo: "",
          typeId: 1,
        }
      );

      return { id, firstName, lastName, username, photo };
    } catch (error) {
      retries++;
    }
  }

  throw new HttpException(400, "Failed to create guest user!");
};

export default {
  getById,
  createGuest,
};
