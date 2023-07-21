import { PrismaClient, User } from "@prisma/client";
import { UserSignUpDTO, UserUpdateDTO } from "../dto/user-dto";
import { HttpException } from "../utils/http-exception";

const prisma = new PrismaClient();

const createUser = async (dto: UserSignUpDTO): Promise<User> => {
  const existingUser = await prisma.user.findFirst({
    where: {
      email: dto.email,
    },
  });

  if (existingUser) {
    throw new HttpException(409, `User with email:${dto.email} already exist!`);
  }

  var user = await prisma.user.create({ data: dto });
  return user;
};

const getById = async (id: number): Promise<User> => {
  var user = await prisma.user.findUnique({ where: { id: id } });
  if (!user) throw new HttpException(404, `User with id:${id} not found!`);
  return user;
};

const getAll = async (): Promise<User[]> => {
  var users = await prisma.user.findMany();
  return users;
};

const deleteUser = async (id: number): Promise<any> => {
  try {
    var user = await prisma.user.delete({ where: { id: id } });
    return user;
  } catch (error) {
    throw new HttpException(404, `User with id:${id} not found!`);
  }
};

const updateUser = async (id: number, dto: UserUpdateDTO): Promise<User> => {
  try {
    var user = await prisma.user.update({ where: { id: id }, data: dto });
    return user;
  } catch (error) {
    throw new HttpException(404, `User with id:${id} not found!`);
  }
};

export default {
  createUser,
  getById,
  getAll,
  deleteUser,
  updateUser,
};
