import { PrismaClient } from "@prisma/client";

const getUpTime = (): string => {
  var uptime = process.uptime();
  var hours = `${Math.floor(uptime / 3600)}h`;
  var minutes = `${Math.floor((uptime % 3600) / 60)}m`;
  var seconds = `${Math.floor(uptime % 60)}s`;
  return `${hours}:${minutes}:${seconds}`;
};

const checkDatabaseConnection = async (): Promise<any> => {
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
    return "CONNECTED";
  } catch (error) {
    return "CONNECTION FAILED";
  }
};

export default { getUpTime, checkDatabaseConnection };
