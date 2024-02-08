import axios from "axios";
import { db } from "../data/database";
import { User } from "../data/models/users/users";
import { HttpException } from "../utils/http-exception";
import { Logger } from "../utils/logger";
import { GoogleRegisterDTO } from "../dto/user-dto";

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
      await db.UserStats.create({ id: id });

      return { id, firstName, lastName, username, photo };
    } catch (error) {
      retries++;
    }
  }

  throw new HttpException(400, "Failed to create guest user!");
};

const validateGoogleToken = async (dto: GoogleRegisterDTO): Promise<User> => {
  try {
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${dto.token}`
    );

    const hasError = response.data.error_description;

    if (hasError) throw new HttpException(401, "Google Validation failed!");

    const user = await db.User.create({
      active: true,
      firstName: dto.firstName || "",
      lastName: dto.lastName || "",
      email: dto.email,
      googleId: dto.googleId,
      typeId: 1,
      username: `user#${dto.googleId}`,
    });
    return user;
  } catch (err: any) {
    throw new HttpException(400, err.response?.data);
  }
};

export default {
  getById,
  createGuest,
  validateGoogleToken,
};
