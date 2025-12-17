import type { JobWhereInput } from "@/app/generated/prisma";

export const buildJobFilters = (
  searchParams: URLSearchParams
): JobWhereInput => {
  const title = searchParams.get("title");
  const requiredExperience = searchParams.get("requiredExperience");
  const minPay = searchParams.get("minPay");
  const maxPay = searchParams.get("maxPay");
  const tools = searchParams.get("tools");

  const where: JobWhereInput = {};

  if (title) {
    where.title = {
      contains: title,
      mode: "insensitive",
    };
  }

  if (requiredExperience) {
    where.requiredExperience = requiredExperience as any;
  }

  if (minPay || maxPay) {
    where.payPerHour = {};
    if (minPay) where.payPerHour.gte = Number(minPay);
    if (maxPay) where.payPerHour.lte = Number(maxPay);
  }

  if (tools) {
    where.tools = {
      hasSome: tools.split(","),
    };
  }

  return where;
};
