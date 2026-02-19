import { addDays, differenceInCalendarDays } from "date-fns";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "@/env";

const CONNECTION_STRING = env.DATABASE_URL;
const prismaAdapter = new PrismaPg({ connectionString: CONNECTION_STRING });

const createPrismaClient = () => new PrismaClient({ adapter: prismaAdapter });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

const PROGRAM_START = new Date(2025, 12, 1); // Nov 1 2025
const MONTHS_TO_GENERATE = 6;
const CAPACITY_PER_DAY = 10;

const MODULES: string[] = [
  "Introduction to OSCE",
  "Assessment",
  "Planning",
  "Implementation",
  "Evaluation",
  "Clinical Skills",
  "Professional Values & Review",
];

async function seedModules() {
  for (let i = 0; i < MODULES.length; i++) {
    await db.module.upsert({
      where: { order: i + 1 },
      update: {},
      create: {
        name: MODULES[i] as string,
        order: i + 1,
        durationHours: 1,
      },
    });
  }
}

async function seedTrainingDays() {
  const endDate = new Date(PROGRAM_START);
  endDate.setMonth(endDate.getMonth() + MONTHS_TO_GENERATE);

  let current = new Date(PROGRAM_START);

  while (current < endDate) {
    const diff = differenceInCalendarDays(current, PROGRAM_START);
    const cycleIndex = ((diff % 9) + 9) % 9;

    const isGapDay = cycleIndex >= 7;
    const moduleOrder = (cycleIndex % 7) + 1;

    const existing = await db.trainingDay.findUnique({
      where: { date: current },
      select: { id: true },
    });

    if (!existing) {
      await db.trainingDay.create({
        data: {
          date: new Date(current),
          moduleId: isGapDay
            ? null
            : (
                await db.module.findUnique({
                  where: { order: moduleOrder },
                  select: { id: true },
                })
              )?.id,
          isGapDay,
          capacity: CAPACITY_PER_DAY,
          isActive: true,
        },
      });
    }

    current = addDays(current, 1);
  }
}

async function main() {
  console.log("🌱 Seeding modules...");
  await seedModules();

  console.log("🌱 Seeding training days...");
  await seedTrainingDays();

  console.log("✅ Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
