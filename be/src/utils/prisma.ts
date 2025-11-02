import { PrismaClient } from "../generated/prisma/client";

const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  }).$extends({
    result: {
      user: {
        photo_url: {
          needs: { photo: true },
          compute(data) {
            if (!data.photo) return null;
            const baseUrl =
              process.env.URL_ASSET_PHOTO ??
              "http://localhost:5000/assets/uploads/photos";
            return `${baseUrl}/${data.photo}`;
          },
        },
      },
    },
  });
};

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
