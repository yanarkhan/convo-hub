import { RoleType } from "../generated/prisma/enums";
import prisma from "../utils/prisma";
import { SignUpValues } from "../types/user.types";

export const isEmailExist = async (email: string): Promise<boolean> => {
  const count = await prisma.user.count({
    where: { email },
  });
  return count > 0;
};

export const findRoleByType = async (roleType: RoleType) => {
  return await prisma.role.findUniqueOrThrow({
    where: { role: roleType },
    select: { id: true, role: true },
  });
};

export const createUser = async (
  data: SignUpValues & { password: string },
  photoFilename: string
) => {
  const role = await findRoleByType("USER");

  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
      photo: photoFilename,
      role_id: role.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      photo_url: true,
      role: {
        select: {
          role: true,
        },
      },
    },
  });
};

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email: email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      photo_url: true,
    },
  });
};
