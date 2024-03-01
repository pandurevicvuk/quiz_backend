import axios from "axios";
import { db } from "../data/database";
import { User } from "../data/models/users/users";
import { HttpException } from "../utils/http-exception";
import { GoogleRegisterDTO } from "../dto/user-dto";

const getById = async (userId: number): Promise<User> => {
  const user = await db.User.findOne({
    where: { id: userId },
  });
  if (!user) throw new HttpException(404, "User not found!");
  return user;
};

const validateGoogleToken = async (dto: GoogleRegisterDTO): Promise<User> => {
  try {
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${dto.idToken}`
    );
    const { given_name, family_name, email, sub, picture } = response.data;

    //ALREADY CREATED
    const alreadyCreatedUser = await db.User.findOne({
      where: { googleId: sub },
    });
    if (alreadyCreatedUser) return alreadyCreatedUser;

    //CREATE NEW

    const user = await db.User.create({
      email: email,
      googleId: sub,
      photo: picture,
      firstName: given_name,
      lastName: family_name,
    });

    return user;
  } catch (err: any) {
    console.log(err);
    throw new HttpException(400, err.response.data);
  }
};

export default {
  getById,

  validateGoogleToken,
};
