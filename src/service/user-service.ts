import { PrismaClient, User } from "@prisma/client";
import { UserDTO, UserSignUpDTO, UserUpdateDTO } from "../dto/user-dto";
import { HttpException } from "../utils/http-exception";
import { prismaExclude } from "../utils/prisma-exclude";

const prisma = new PrismaClient();

const createUser = async (dto: UserSignUpDTO): Promise<User> => {
  const existingUser = await prisma.user.findFirst({
    where: {
      email: dto.email,
    },
  });

  if (existingUser) {
    throw new HttpException(
      403,
      `User with email:'${dto.email}' already exists!`
    );
  }

  var user = await prisma.user.create({ data: dto });
  return user;
};

const getById = async (id: number): Promise<UserDTO | null> => {
  return await prisma.user.findUnique({
    where: { id: id },
    select: prismaExclude("User", ["password"]),
  });
};

const getAll = async (): Promise<UserDTO[]> => {
  return await prisma.user.findMany({
    select: prismaExclude("User", ["password"]),
  });
};

const deleteUser = async (id: number): Promise<void> => {
  const user = await getById(id);
  if (!user) throw new HttpException(404, `User not found`);
  await prisma.user.delete({ where: { id: id } });
};

const updateUser = async (id: number, dto: UserUpdateDTO): Promise<User> => {
  const user = await getById(id);
  if (!user) throw new HttpException(404, `User not found`);
  return await prisma.user.update({ where: { id: id }, data: dto });
};

export default {
  createUser,
  getById,
  getAll,
  deleteUser,
  updateUser,
};
