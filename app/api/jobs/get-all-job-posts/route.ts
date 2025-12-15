// import { prisma } from "@/app";
// import { NextResponse, NextRequest } from "next/server";
// import { getServerSession, User } from "next-auth";
// import { authOptions } from "../../auth/[...nextauth]/options";

// const ITEMS_PER_PAGE = 10;

// export const GET = async (req: NextRequest) => {
//   const session = await getServerSession(authOptions);
//   const user: User = session?.user;

//   if (!session || !session.user || !user.email) {
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Unauthorized",
//       },
//       {
//         status: 401,
//       }
//     );
//   }

//   try {
//     const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);

//     const totalJobs = await prisma.job.count();

//     const jobs = await prisma.job.findMany({
//       skip: (page - 1) * ITEMS_PER_PAGE,
//       take: ITEMS_PER_PAGE,
//       orderBy: {
//         createdAt: "desc",
//       },
//       include: {
//         createdBy: {
//           client
//         }
//       }
//     })


//   } catch (error) {}
// };
