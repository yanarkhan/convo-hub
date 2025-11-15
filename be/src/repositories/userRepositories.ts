import { RoleType } from "../generated/prisma/enums";
import prisma from "../utils/prisma";
import { SignUpValues } from "../types/user.types";
import crypto from "node:crypto";

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
      role: {
        select: {
          role: true,
        },
      },
    },
  });
};

export const createPasswordReset = async (email: string) => {
  const user = await findUserByEmail(email);
  if (!user) {
    return null;
  }

  await prisma.passwordReset.deleteMany({
    where: {
      user_id: user.id,
      expires_at: {
        gt: new Date(),
      },
    },
  });

  const token = crypto.randomBytes(32).toString("hex");

  // ini se-jam dari sekarang
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  return await prisma.passwordReset.create({
    data: {
      user_id: user.id,
      token,
      expires_at: expiresAt,
    },
  });
};

export const cleanupExpiredTokens = async () => {
  const result = await prisma.passwordReset.deleteMany({
    where: {
      expires_at: {
        lt: new Date(),
      },
    },
  });

  return result.count;
};

export const findResetDataByToken = async (token: string) => {
  return await prisma.passwordReset.findFirst({
    where: {
      token,
      expires_at: {
        gt: new Date(),
      },
    },
    include: {
      users: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
};

export const updateUserPassword = async (userId: string, password: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { password },
  });
};

export const deletePasswordResetById = async (id: string) => {
  return await prisma.passwordReset.delete({
    where: { id },
  });
};
