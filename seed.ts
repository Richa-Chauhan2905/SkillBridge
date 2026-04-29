import { db } from "./src/db";
import {
  users,
  clientProfiles,
  freelancerProfiles,
  jobs,
  applications,
  chats,
  chatParticipants,
  messages,
  notifications,
  savedJobs,
} from "./src/db/schema";

import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding started...");

  // =========================
  // 1. USERS
  // =========================
  const hashedPassword = await bcrypt.hash("123456", 10);

  const insertedUsers = await db
    .insert(users)
    .values([
      // CLIENTS
      {
        firstName: "Richa",
        lastName: "Chauhan",
        email: "richa@client.com",
        password: hashedPassword,
        role: "CLIENT",
        image: "https://i.pravatar.cc/150?img=1",
      },
      {
        firstName: "Amit",
        lastName: "Sharma",
        email: "amit@startup.com",
        password: hashedPassword,
        role: "CLIENT",
        image: "https://i.pravatar.cc/150?img=2",
      },

      // FREELANCERS
      {
        firstName: "John",
        lastName: "Doe",
        email: "john@dev.com",
        password: hashedPassword,
        role: "FREELANCER",
        image: "https://i.pravatar.cc/150?img=3",
      },
      {
        firstName: "Priya",
        lastName: "Mehta",
        email: "priya@design.com",
        password: hashedPassword,
        role: "FREELANCER",
        image: "https://i.pravatar.cc/150?img=4",
      },
      {
        firstName: "Rahul",
        lastName: "Verma",
        email: "rahul@backend.com",
        password: hashedPassword,
        role: "FREELANCER",
        image: "https://i.pravatar.cc/150?img=5",
      },
    ])
    .returning();

  const client1 = insertedUsers[0];
  const client2 = insertedUsers[1];
  const freelancer1 = insertedUsers[2];
  const freelancer2 = insertedUsers[3];
  const freelancer3 = insertedUsers[4];

  console.log("✅ Users inserted");

  // =========================
  // 2. PROFILES
  // =========================
  await db.insert(clientProfiles).values([
    {
      userId: client1.id,
      industry: "IT",
      companyName: "SkillBridge Labs",
      companyWebsite: "https://skillbridge.dev",
      linkedInProfile: "https://linkedin.com/company/skillbridge",
    },
    {
      userId: client2.id,
      industry: "E_COMMERCE",
      companyName: "ShopNova",
      companyWebsite: "https://shopnova.com",
      linkedInProfile: "https://linkedin.com/company/shopnova",
    },
  ]);

  await db.insert(freelancerProfiles).values([
    {
      userId: freelancer1.id,
      industry: "IT",
      skills: ["React", "Node.js", "MongoDB"],
      experience: "INTERMEDIATE",
      education: "B.Tech IT",
      languages: ["English", "Hindi"],
      bio: "Full-stack developer who builds scalable apps.",
      ratePerHour: 20,
      city: "Surat",
      state: "Gujarat",
      pincode: 395006,
      contact: "9999999999",
    },
    {
      userId: freelancer2.id,
      industry: "MEDIA",
      skills: ["UI/UX", "Figma", "Photoshop"],
      experience: "EXPERT",
      education: "Design Diploma",
      languages: ["English"],
      bio: "UI/UX designer crafting modern interfaces.",
      ratePerHour: 30,
      city: "Mumbai",
      state: "Maharashtra",
      pincode: 400001,
      contact: "8888888888",
    },
    {
      userId: freelancer3.id,
      industry: "IT",
      skills: ["Java", "Spring Boot", "PostgreSQL"],
      experience: "EXPERT",
      education: "B.E Computer Engineering",
      languages: ["English", "Hindi"],
      bio: "Backend engineer building APIs and systems.",
      ratePerHour: 25,
      city: "Bangalore",
      state: "Karnataka",
      pincode: 560001,
      contact: "7777777777",
    },
  ]);

  console.log("✅ Profiles inserted");

  // =========================
  // 3. JOBS (feed realistic)
  // =========================
  const insertedJobs = await db
    .insert(jobs)
    .values([
      {
        clientId: client1.id,
        title: "Build a MERN Stack Job Portal",
        description:
          "Need a full-stack developer to build a freelancer/job platform like Upwork.",
        requiredExperience: "INTERMEDIATE",
        payPerHour: 25,
        mandatorySkills: ["React", "Node.js"],
        niceToHaveSkills: ["Next.js", "Docker"],
        tools: ["Git", "VS Code"],
        preferredLocation: "Remote",
        clientLocation: "India",
      },
      {
        clientId: client1.id,
        title: "Fix Next.js Authentication Bugs",
        description: "Fix JWT session issues in Next.js app.",
        requiredExperience: "BEGINNER",
        payPerHour: 15,
        mandatorySkills: ["Next.js", "Auth"],
        niceToHaveSkills: ["Drizzle ORM"],
        tools: ["Git"],
        preferredLocation: "Remote",
        clientLocation: "India",
      },
      {
        clientId: client2.id,
        title: "E-commerce UI Design",
        description: "Need modern UI/UX for shopping platform.",
        requiredExperience: "EXPERT",
        payPerHour: 35,
        mandatorySkills: ["Figma"],
        niceToHaveSkills: ["Adobe XD"],
        tools: ["Figma"],
        preferredLocation: "Remote",
        clientLocation: "India",
      },
      {
        clientId: client2.id,
        title: "Backend API for Inventory System",
        description: "Build scalable backend APIs in Node.js.",
        requiredExperience: "INTERMEDIATE",
        payPerHour: 28,
        mandatorySkills: ["Node.js", "PostgreSQL"],
        niceToHaveSkills: ["Redis"],
        tools: ["Docker", "Git"],
        preferredLocation: "Remote",
        clientLocation: "India",
      },
    ])
    .returning();

  console.log("✅ Jobs inserted");

  // =========================
  // 4. APPLICATIONS
  // =========================
  await db.insert(applications).values([
    {
      jobId: insertedJobs[0].id,
      freelancerId: freelancer1.id,
      coverLetter: "I can build full MERN stack apps efficiently.",
      resume: "https://resume.dev/john",
    },
    {
      jobId: insertedJobs[2].id,
      freelancerId: freelancer2.id,
      coverLetter: "Expert UI/UX designer available.",
      resume: "https://resume.dev/priya",
    },
  ]);

  console.log("✅ Applications inserted");

  // =========================
  // 5. CHAT SAMPLE
  // =========================
  const [chat] = await db.insert(chats).values({}).returning();

  await db.insert(chatParticipants).values([
    { chatId: chat.id, userId: client1.id },
    { chatId: chat.id, userId: freelancer1.id },
  ]);

  await db.insert(messages).values([
    {
      chatId: chat.id,
      senderId: client1.id,
      content: "Hey, are you available for the project?",
    },
    {
      chatId: chat.id,
      senderId: freelancer1.id,
      content: "Yes, I can start immediately!",
    },
  ]);

  console.log("💬 Chat inserted");

  // =========================
  // 6. NOTIFICATIONS
  // =========================
  await db.insert(notifications).values([
    {
      userId: client1.id,
      type: "JOB",
      title: "New Application Received",
      description: "A freelancer applied to your job",
    },
    {
      userId: freelancer1.id,
      type: "JOB",
      title: "New Job Match",
      description: "A new React job matches your skills",
    },
  ]);

  console.log("🔔 Notifications inserted");

  // =========================
  // 7. SAVED JOBS
  // =========================
  await db.insert(savedJobs).values([
    {
      userId: freelancer1.id,
      jobId: insertedJobs[0].id,
    },
    {
      userId: freelancer2.id,
      jobId: insertedJobs[2].id,
    },
  ]);

  console.log("⭐ Saved jobs inserted");

  console.log("🎉 SEED COMPLETE!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  });
