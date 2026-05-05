import "dotenv/config";
import { PrismaClient, ResourceStatus, ResourceType, RoadmapStepType, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo123456";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  await prisma.user.deleteMany();

  const [admin, mentorUser, learner] = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@entreskill.demo",
        name: "Admin User",
        passwordHash,
        role: Role.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        email: "mentor@entreskill.demo",
        name: "Samira Rahman",
        passwordHash,
        role: Role.MENTOR,
      },
    }),
    prisma.user.create({
      data: {
        email: "learner@entreskill.demo",
        name: "Jamal Hossain",
        passwordHash,
        role: Role.LEARNER,
      },
    }),
  ]);

  const skills = await prisma.$transaction([
    prisma.skill.create({ data: { name: "Tailoring", category: "Craft" } }),
    prisma.skill.create({ data: { name: "Handicrafts", category: "Craft" } }),
    prisma.skill.create({ data: { name: "Food preparation", category: "Food" } }),
    prisma.skill.create({ data: { name: "Small appliance repair", category: "Services" } }),
    prisma.skill.create({ data: { name: "Digital literacy", category: "Digital" } }),
    prisma.skill.create({ data: { name: "Social media", category: "Digital" } }),
  ]);

  const interests = await prisma.$transaction([
    prisma.interest.create({ data: { name: "Working from home" } }),
    prisma.interest.create({ data: { name: "Low startup cost" } }),
    prisma.interest.create({ data: { name: "Serving my community" } }),
    prisma.interest.create({ data: { name: "Selling online" } }),
  ]);

  await prisma.mentorProfile.create({
    data: {
      userId: mentorUser.id,
      headline: "Small business coach · 12 years",
      verified: true,
      bio: "I help first-time entrepreneurs in tailoring and crafts turn skills into steady income. Focus on pricing, local marketing, and simple record-keeping.",
      experience: "Ran a home-based alterations shop; mentored 40+ micro-businesses through local cooperatives.",
      expertise: { connect: [{ id: skills[0].id }, { id: skills[1].id }] },
    },
  });

  const ideaTailoring = await prisma.businessIdea.create({
    data: {
      slug: "home-alterations-studio",
      title: "Home-based alterations & tailoring studio",
      description:
        "Offer measurement, repairs, and custom adjustments for neighbors and small retailers. Start with a basic machine and grow through referrals and school uniform seasons.",
      skills: { create: [{ skillId: skills[0].id }] },
      interests: {
        create: [{ interestId: interests[0].id }, { interestId: interests[1].id }],
      },
      steps: {
        create: [
          {
            order: 1,
            title: "Validate demand",
            stepType: RoadmapStepType.VALIDATION,
            body: "Talk to 10–15 people in your area about common alteration needs. Note peak seasons (Eid, weddings, school start).",
          },
          {
            order: 2,
            title: "Tools & workspace",
            stepType: RoadmapStepType.TOOLS,
            body: "Secure a reliable sewing machine, iron, measuring tools, and a well-lit corner. List consumables: thread, zippers, elastic.",
          },
          {
            order: 3,
            title: "Registration & permits",
            stepType: RoadmapStepType.LEGAL,
            body: "Check local requirements for home-based businesses. Register a business name if needed; keep receipts for tax records.",
          },
          {
            order: 4,
            title: "Startup cost estimate",
            stepType: RoadmapStepType.COST,
            body: "Budget machine (new or used), initial fabric/notions, marketing flyers, and 2–3 months of personal buffer.",
          },
          {
            order: 5,
            title: "Marketing basics",
            stepType: RoadmapStepType.MARKETING,
            body: "Word of mouth, WhatsApp status, before/after photos (with permission), partnership with local clothing shops.",
          },
        ],
      },
    },
    include: { steps: true },
  });

  const ideaFood = await prisma.businessIdea.create({
    data: {
      slug: "home-catering-snacks",
      title: "Small-batch home catering & snacks",
      description:
        "Prepare trusted local snacks, lunch boxes, or event platters. Start with orders from friends and repeat customers while you standardize recipes and packaging.",
      skills: { create: [{ skillId: skills[2].id }] },
      interests: {
        create: [
          { interestId: interests[0].id },
          { interestId: interests[2].id },
          { interestId: interests[3].id },
        ],
      },
      steps: {
        create: [
          {
            order: 1,
            title: "Validate with samples",
            stepType: RoadmapStepType.VALIDATION,
            body: "Offer a small menu (2–3 items). Collect feedback on taste, price, and delivery expectations.",
          },
          {
            order: 2,
            title: "Kitchen & food safety",
            stepType: RoadmapStepType.TOOLS,
            body: "Organize prep zones, storage, and labeling. Learn basic hygiene checklist for your context.",
          },
          {
            order: 3,
            title: "Licenses",
            stepType: RoadmapStepType.LEGAL,
            body: "Confirm if a food handler or home-kitchen permit applies in your area before scaling.",
          },
          {
            order: 4,
            title: "Costing",
            stepType: RoadmapStepType.COST,
            body: "Price per portion = ingredients + packaging + your time + small profit margin. Track simple weekly totals.",
          },
          {
            order: 5,
            title: "Get repeat orders",
            stepType: RoadmapStepType.MARKETING,
            body: "Weekly menu post, referral discount, corporate lunch outreach, and photo proof of clean prep.",
          },
        ],
      },
    },
    include: { steps: true },
  });

  await prisma.businessIdea.create({
    data: {
      slug: "neighborhood-repair-desk",
      title: "Neighborhood phone & small appliance repair",
      description:
        "Fix phones, kettles, and small electronics for your community. Low rent footprint; growth through trust and quick turnaround.",
      skills: { create: [{ skillId: skills[3].id }] },
      interests: {
        create: [{ interestId: interests[1].id }, { interestId: interests[2].id }],
      },
      steps: {
        create: [
          {
            order: 1,
            title: "Skill check",
            stepType: RoadmapStepType.VALIDATION,
            body: "List devices you can repair confidently. Partner with a parts supplier or experienced technician for edge cases.",
          },
          {
            order: 2,
            title: "Bench & diagnostics",
            stepType: RoadmapStepType.TOOLS,
            body: "Basic toolkit, multimeter, ESD mat, labeling for customer devices, and ticketing notebook or app.",
          },
          {
            order: 3,
            title: "Business registration",
            stepType: RoadmapStepType.LEGAL,
            body: "Simple sole proprietorship if required; clarify warranty disclaimers verbally and on receipts.",
          },
          {
            order: 4,
            title: "Pricing",
            stepType: RoadmapStepType.COST,
            body: "Standard diagnostic fee; parts billed separately with customer approval before ordering.",
          },
          {
            order: 5,
            title: "Local visibility",
            stepType: RoadmapStepType.MARKETING,
            body: "Shop-front poster, mosque/community board, school parent groups; honest turnaround times.",
          },
        ],
      },
    },
  });

  await prisma.businessIdea.create({
    data: {
      slug: "freelance-digital-helper",
      title: "Freelance digital helper for shops",
      description:
        "Help small shops digitize menus, spreadsheets, WhatsApp catalogs, and simple ads. Fits strong digital literacy and social media Interest.",
      skills: {
        create: [{ skillId: skills[4].id }, { skillId: skills[5].id }],
      },
      interests: {
        create: [{ interestId: interests[3].id }, { interestId: interests[1].id }],
      },
      steps: {
        create: [
          {
            order: 1,
            title: "Pick a niche",
            stepType: RoadmapStepType.VALIDATION,
            body: "Choose one: restaurant menus, tailor order tracking, or retail catalog on WhatsApp. Interview 5 shop owners.",
          },
          {
            order: 2,
            title: "Toolkit",
            stepType: RoadmapStepType.TOOLS,
            body: "Templates, free design tools, cloud sheet for orders, simple invoice format.",
          },
          {
            order: 3,
            title: "Contracts",
            stepType: RoadmapStepType.LEGAL,
            body: "Simple scope note: deliverables, revision rounds, payment schedule; avoid promising platform ad results.",
          },
          {
            order: 4,
            title: "Rates",
            stepType: RoadmapStepType.COST,
            body: "Package pricing (setup + monthly retainer) vs hourly for training sessions.",
          },
          {
            order: 5,
            title: "Find clients",
            stepType: RoadmapStepType.MARKETING,
            body: "Walk local markets with before/after samples; offer one free menu cleanup for a testimonial.",
          },
        ],
      },
    },
  });

  const resVideo = await prisma.learningResource.create({
    data: {
      title: "Pricing your craft for profit",
      description: "15-minute overview of cost-plus pricing for home-based makers.",
      type: ResourceType.VIDEO,
      url: "https://www.youtube.com/watch?v=z6gsMTV8JNU",
      status: ResourceStatus.APPROVED,
      authorId: mentorUser.id,
    },
  });

  const resArticle = await prisma.learningResource.create({
    data: {
      title: "One-page business startup checklist",
      description: "Printable checklist: registration, banking, and record-keeping.",
      type: ResourceType.ARTICLE,
      url: "https://www.sba.gov/business-guide/10-steps-start-your-business",
      status: ResourceStatus.APPROVED,
    },
  });

  const resPending = await prisma.learningResource.create({
    data: {
      title: "Mentor draft: record-keeping for tailors",
      type: ResourceType.CHECKLIST,
      url: null,
      description: "Pending admin approval — sample row for workflow testing.",
      status: ResourceStatus.PENDING,
      authorId: mentorUser.id,
    },
  });

  await prisma.resourceIdeaLink.createMany({
    data: [
      { resourceId: resVideo.id, ideaId: ideaTailoring.id },
      { resourceId: resArticle.id, ideaId: ideaTailoring.id },
      { resourceId: resArticle.id, ideaId: ideaFood.id },
      { resourceId: resPending.id, ideaId: ideaTailoring.id },
    ],
  });

  await prisma.userSkill.createMany({
    data: [
      { userId: learner.id, skillId: skills[0].id },
      { userId: learner.id, skillId: skills[2].id },
    ],
  });

  await prisma.userInterest.createMany({
    data: [
      { userId: learner.id, interestId: interests[0].id },
      { userId: learner.id, interestId: interests[1].id },
    ],
  });

  const firstStep = ideaTailoring.steps.sort((a, b) => a.order - b.order)[0];
  await prisma.userProgress.create({
    data: { userId: learner.id, stepId: firstStep.id },
  });

  await prisma.bookmark.create({
    data: { userId: learner.id, ideaId: ideaFood.id },
  });

  await prisma.feedback.create({
    data: { userId: learner.id, rating: 5, comment: "Roadmaps are very clear." },
  });

  console.log("Seed complete.");
  console.log("Demo logins (password for all):", DEMO_PASSWORD);
  console.log({
    admin: admin.email,
    mentor: mentorUser.email,
    learner: learner.email,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
