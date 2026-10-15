import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSIONS = [
  { code: "VERIFY_VENDORS", description: "Review and approve or reject vendors" },
  { code: "MANAGE_VENDORS", description: "Suspend, edit, or reactivate vendors" },
  { code: "MANAGE_CUSTOMERS", description: "View and block customers" },
  { code: "MANAGE_APPOINTMENTS", description: "View and manage all appointments" },
  { code: "MANAGE_REFUNDS", description: "Approve and process refunds" },
  { code: "VIEW_REPORTS", description: "View reports and analytics" },
  { code: "MANAGE_POLICIES", description: "Edit cancellation and refund policies" },
];

const SPECIALTIES = [
  "General Physician", "Cardiologist", "Dermatologist", "Pediatrician",
  "Gynecologist", "Orthopedic", "Neurologist", "ENT Specialist",
  "Dentist", "Psychiatrist", "Ophthalmologist", "Urologist",
];

async function main() {
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { description: p.description },
      create: p,
    });
  }

  for (const name of SPECIALTIES) {
    await prisma.specialty.upsert({ where: { name }, update: {}, create: { name } });
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");

  const existing = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (existing) {
    console.log("Admin already exists, skipping:", existing.email);
  } else {
    await prisma.user.create({
      data: {
        role: Role.ADMIN,
        name: process.env.ADMIN_NAME ?? "Super Admin",
        email,
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
    console.log("Admin created:", email);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
