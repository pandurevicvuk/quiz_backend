import { PrismaClient, User } from "@prisma/client";
import { UserSignUpDTO, UserUpdateDTO } from "../dto/user-dto";

const prisma = new PrismaClient();

const createUser = async (dto: UserSignUpDTO): Promise<User> => {
  var user = await prisma.user.create({ data: dto });
  return user;
};

const getById = async (id: number): Promise<User | null> => {
  var user = await prisma.user.findUnique({ where: { id: id } });
  return user;
};

const getAll = async (id: number): Promise<User[]> => {
  var users = await prisma.user.findMany();
  return users;
};

const deleteUser = async (id: number): Promise<User> => {
  var user = await prisma.user.delete({ where: { id: id } });
  return user;
};

const updateUser = async (id: number, dto: UserUpdateDTO): Promise<User> => {
  var user = await prisma.user.update({ where: { id: id }, data: dto });
  return user;
};

export default {
  createUser,
  getById,
  getAll,
  deleteUser,
  updateUser,
};
