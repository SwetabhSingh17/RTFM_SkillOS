import { db } from "../db";
import { competencyDomains, competencyItems, igotCourses, users, userProfiles, userCompetencies, nsstaTrainings, learningMaterials } from "../../shared/schema";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function seed() {
  console.log("🌱 Seeding database for RTFM_SkillOS...\n");

  // 1. Seed Competency Domains
  console.log("📊 Seeding Competency Domains...");
  const domains = [
    { name: "Statistical Competencies", description: "Core statistical skills for official statistics", icon: "📊", order: 1 },
    { name: "Technical Competencies", description: "Technical and programming skills", icon: "💻", order: 2 },
    { name: "Digital Governance", description: "Digital infrastructure and governance", icon: "🏛️", order: 3 },
    { name: "Behavioural & Managerial", description: "Leadership and management skills", icon: "🎯", order: 4 },
  ];

  const domainMap: Record<string, number> = {};
  for (const d of domains) {
    const inserted = await db.insert(competencyDomains).values(d).returning();
    domainMap[d.name] = inserted[0].id;
  }

  // 2. Seed Competency Items (comprehensive per problem statement)
  console.log("📋 Seeding Competency Items...");
  const items = [
    // Statistical Competencies
    { domainId: domainMap["Statistical Competencies"], name: "Survey Design", category: "Data Collection", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Statistical Competencies"], name: "Sampling Methods", category: "Data Collection", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Statistical Competencies"], name: "National Accounts", category: "Economic Statistics", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Statistical Competencies"], name: "Price Statistics", category: "Economic Statistics", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Statistical Competencies"], name: "Labour Statistics", category: "Social Statistics", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Statistical Competencies"], name: "Agricultural Statistics", category: "Sectoral Statistics", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Statistical Competencies"], name: "SDG Indicators", category: "International Standards", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Statistical Competencies"], name: "Data Quality Frameworks", category: "Quality Assurance", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    // Technical Competencies
    { domainId: domainMap["Technical Competencies"], name: "Python Programming", category: "Programming", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Technical Competencies"], name: "R Programming", category: "Programming", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Technical Competencies"], name: "SQL & Databases", category: "Data Management", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Technical Competencies"], name: "Data Visualization", category: "Reporting", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Technical Competencies"], name: "AI & Machine Learning", category: "Advanced Analytics", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Technical Competencies"], name: "GIS & Spatial Data", category: "Geospatial", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Technical Competencies"], name: "Cloud Computing", category: "Infrastructure", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    // Digital Governance
    { domainId: domainMap["Digital Governance"], name: "Cybersecurity", category: "Security", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Digital Governance"], name: "Data Privacy", category: "Compliance", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Digital Governance"], name: "Digital Signatures", category: "Authentication", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Digital Governance"], name: "Government Cloud", category: "Infrastructure", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    // Behavioural & Managerial
    { domainId: domainMap["Behavioural & Managerial"], name: "Leadership", category: "Management", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Behavioural & Managerial"], name: "Communication", category: "Soft Skills", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Behavioural & Managerial"], name: "Project Management", category: "Management", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Behavioural & Managerial"], name: "Ethics & Integrity", category: "Values", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { domainId: domainMap["Behavioural & Managerial"], name: "Decision Making", category: "Management", proficiencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"] },
  ];

  const itemMap: Record<string, number> = {};
  for (const item of items) {
    const inserted = await db.insert(competencyItems).values(item).returning();
    itemMap[item.name] = inserted[0].id;
  }

  // 3. Seed iGOT Courses (expanded)
  console.log("📚 Seeding Mock iGOT Courses...");
  const courses = [
    {
      title: "Introduction to Official Statistics",
      description: "A comprehensive guide to India's statistical system covering the NSO framework, data collection methods, and key indicators.",
      provider: "NSSTA", duration: "4 hours", difficulty: "Beginner",
      competenciesCovered: [itemMap["Survey Design"], itemMap["Data Quality Frameworks"]],
      courseUrl: "https://igotkarmayogi.gov.in/course/1",
    },
    {
      title: "Data Science with Python for Government Officials",
      description: "Learn Python for data analysis and visualization including pandas, numpy, and matplotlib for statistical reporting.",
      provider: "DIID MoSPI", duration: "8 hours", difficulty: "Intermediate",
      competenciesCovered: [itemMap["Python Programming"], itemMap["Data Visualization"]],
      courseUrl: "https://igotkarmayogi.gov.in/course/2",
    },
    {
      title: "Cybersecurity Awareness for Government",
      description: "Best practices for data security, privacy compliance, and cyber hygiene in government operations.",
      provider: "MeitY", duration: "2 hours", difficulty: "Beginner",
      competenciesCovered: [itemMap["Cybersecurity"], itemMap["Data Privacy"]],
      courseUrl: "https://igotkarmayogi.gov.in/course/3",
    },
    {
      title: "National Accounts Statistics — Advanced",
      description: "Deep dive into GDP estimation, SNA 2008, supply-use tables, and macroeconomic indicators used in India's national accounts.",
      provider: "NSSTA", duration: "12 hours", difficulty: "Advanced",
      competenciesCovered: [itemMap["National Accounts"], itemMap["Price Statistics"]],
      courseUrl: "https://igotkarmayogi.gov.in/course/4",
    },
    {
      title: "SDG Indicator Framework & Monitoring",
      description: "Understanding the UN Sustainable Development Goals indicator framework and India's progress monitoring methodology.",
      provider: "NITI Aayog", duration: "6 hours", difficulty: "Intermediate",
      competenciesCovered: [itemMap["SDG Indicators"], itemMap["Data Quality Frameworks"]],
      courseUrl: "https://igotkarmayogi.gov.in/course/5",
    },
    {
      title: "Machine Learning for Statistical Applications",
      description: "Applying ML techniques to survey data, imputation, outlier detection, and predictive analytics for official statistics.",
      provider: "ISI Kolkata", duration: "16 hours", difficulty: "Advanced",
      competenciesCovered: [itemMap["AI & Machine Learning"], itemMap["Python Programming"]],
      courseUrl: "https://igotkarmayogi.gov.in/course/6",
    },
    {
      title: "Survey Sampling Techniques",
      description: "Covers SRS, stratified, cluster, multi-stage sampling with practical examples from NSSO rounds.",
      provider: "NSSTA", duration: "10 hours", difficulty: "Intermediate",
      competenciesCovered: [itemMap["Sampling Methods"], itemMap["Survey Design"]],
      courseUrl: "https://igotkarmayogi.gov.in/course/7",
    },
    {
      title: "GIS for Statistical Mapping",
      description: "Using GIS tools for statistical data mapping, spatial analysis, and thematic map generation.",
      provider: "NIC", duration: "8 hours", difficulty: "Intermediate",
      competenciesCovered: [itemMap["GIS & Spatial Data"], itemMap["Data Visualization"]],
      courseUrl: "https://igotkarmayogi.gov.in/course/8",
    },
    {
      title: "SQL & Database Management for Statisticians",
      description: "Relational databases, SQL queries, data warehousing concepts for managing statistical datasets.",
      provider: "DIID MoSPI", duration: "6 hours", difficulty: "Beginner",
      competenciesCovered: [itemMap["SQL & Databases"]],
      courseUrl: "https://igotkarmayogi.gov.in/course/9",
    },
    {
      title: "Leadership in Public Administration",
      description: "Leadership frameworks, team management, and strategic thinking for senior government officials.",
      provider: "LBSNAA", duration: "4 hours", difficulty: "Intermediate",
      competenciesCovered: [itemMap["Leadership"], itemMap["Decision Making"]],
      courseUrl: "https://igotkarmayogi.gov.in/course/10",
    },
    {
      title: "R for Statistical Computing",
      description: "Statistical analysis, hypothesis testing, and data visualization with R for government analysts.",
      provider: "ISI Delhi", duration: "10 hours", difficulty: "Intermediate",
      competenciesCovered: [itemMap["R Programming"], itemMap["Data Visualization"]],
      courseUrl: "https://igotkarmayogi.gov.in/course/11",
    },
    {
      title: "Data Privacy & DPDP Act 2023",
      description: "Understanding India's Digital Personal Data Protection Act and compliance requirements for government bodies.",
      provider: "MeitY", duration: "3 hours", difficulty: "Beginner",
      competenciesCovered: [itemMap["Data Privacy"], itemMap["Digital Signatures"]],
      courseUrl: "https://igotkarmayogi.gov.in/course/12",
    },
  ];

  for (const course of courses) {
    await db.insert(igotCourses).values(course).onConflictDoNothing();
  }

  // 4. Seed NSSTA Trainings
  console.log("🏫 Seeding NSSTA Trainings...");
  const trainings = [
    {
      title: "TPAC Refresher Course on Official Statistics",
      description: "Annual refresher programme covering latest developments in statistical methodology.",
      duration: "5 days", mode: "hybrid",
      targetRoles: ["Statistical Investigator", "Senior Statistical Officer"],
      competenciesCovered: [itemMap["Survey Design"], itemMap["National Accounts"]],
    },
    {
      title: "Workshop on AI/ML for Data Analytics",
      description: "Hands-on workshop on applying AI and ML techniques to government statistical data.",
      duration: "3 days", mode: "offline", location: "NSSTA Greater Noida",
      targetRoles: ["Data Analyst", "Statistical Officer"],
      competenciesCovered: [itemMap["AI & Machine Learning"], itemMap["Python Programming"]],
    },
  ];

  for (const training of trainings) {
    await db.insert(nsstaTrainings).values(training).onConflictDoNothing();
  }

  // 5. Seed Demo Users
  console.log("👤 Seeding Demo Users...");

  // Admin
  await db.insert(users).values({
    username: "admin",
    password: hashPassword("admin123"),
    role: "admin",
    name: "Dr. Priya Sharma",
    email: "priya.sharma@mospi.gov.in",
    organization: "MoSPI",
  }).onConflictDoNothing();

  // Coordinator
  await db.insert(users).values({
    username: "coordinator",
    password: hashPassword("coord123"),
    role: "coordinator",
    name: "Anil Verma",
    email: "anil.verma@mospi.gov.in",
    organization: "MoSPI",
  }).onConflictDoNothing();

  // Supervisor/Trainer
  await db.insert(users).values({
    username: "trainer",
    password: hashPassword("train123"),
    role: "supervisor",
    name: "Dr. Meena Iyer",
    email: "meena.iyer@nssta.gov.in",
    organization: "NSSTA",
  }).onConflictDoNothing();

  // Learner
  const learnerResult = await db.insert(users).values({
    username: "learner",
    password: hashPassword("learn123"),
    role: "student",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@mospi.gov.in",
    organization: "MoSPI",
  }).onConflictDoNothing().returning();

  // Create learner profile if user was inserted
  if (learnerResult.length > 0) {
    const learnerId = learnerResult[0].id;

    await db.insert(userProfiles).values({
      userId: learnerId,
      designation: "Statistical Investigator",
      department: "Data Informatics & Innovation Division",
      jobRole: "Field Data Collection & Processing",
      currentAssignment: "NSS 80th Round",
      educationalQualifications: "M.Sc. Statistics",
      workExperienceYears: 5,
      previousTrainings: ["Basic Statistics Course", "R Programming"],
      careerLevel: "Mid",
    }).onConflictDoNothing();

    // Seed some competency assessments for the learner
    const competencySeeds = [
      { competencyItemId: itemMap["Survey Design"], currentLevel: 72, targetLevel: 85, priority: "medium" },
      { competencyItemId: itemMap["Sampling Methods"], currentLevel: 65, targetLevel: 80, priority: "high" },
      { competencyItemId: itemMap["National Accounts"], currentLevel: 40, targetLevel: 75, priority: "high" },
      { competencyItemId: itemMap["Python Programming"], currentLevel: 35, targetLevel: 70, priority: "critical" },
      { competencyItemId: itemMap["Data Visualization"], currentLevel: 30, targetLevel: 80, priority: "critical" },
      { competencyItemId: itemMap["SDG Indicators"], currentLevel: 55, targetLevel: 75, priority: "medium" },
      { competencyItemId: itemMap["Cybersecurity"], currentLevel: 20, targetLevel: 60, priority: "medium" },
      { competencyItemId: itemMap["Data Privacy"], currentLevel: 45, targetLevel: 70, priority: "medium" },
      { competencyItemId: itemMap["Leadership"], currentLevel: 50, targetLevel: 65, priority: "low" },
      { competencyItemId: itemMap["SQL & Databases"], currentLevel: 55, targetLevel: 75, priority: "high" },
      { competencyItemId: itemMap["AI & Machine Learning"], currentLevel: 15, targetLevel: 60, priority: "high" },
      { competencyItemId: itemMap["R Programming"], currentLevel: 60, targetLevel: 75, priority: "medium" },
    ];

    for (const comp of competencySeeds) {
      await db.insert(userCompetencies).values({
        userId: learnerId,
        ...comp,
        lastAssessedAt: new Date(),
      }).onConflictDoNothing();
    }
  }

  // Seed a sample learning material
  console.log("📄 Seeding Sample Material...");
  await db.insert(learningMaterials).values({
    uploadedById: 1,
    title: "SDG Indicators Manual 2024",
    description: "Comprehensive manual covering all SDG indicators relevant to India's statistical system.",
    fileType: "pdf",
    fileUrl: "/uploads/sample-sdg-manual.pdf",
    fileSize: 2048000,
    extractedText: "Sustainable Development Goals (SDGs) are a collection of 17 global goals designed to be a blueprint for achieving a better and more sustainable future for all. India tracks 232 SDG indicators through the National Indicator Framework (NIF). Key indicators include poverty headcount ratio, undernourishment prevalence, maternal mortality ratio, school completion rates, gender parity index, clean water access, renewable energy share, GDP growth per capita, unemployment rate, industrial value added, Gini coefficient, urban air quality, protected marine areas, forest coverage, corruption perception, and global partnership metrics. Statistical methodology for SDG monitoring involves survey design, administrative data integration, big data analytics, and geospatial mapping. The Central Statistics Office (CSO) coordinates SDG indicator compilation across ministries.",
    processingStatus: "ready",
    processedAt: new Date(),
  }).onConflictDoNothing();

  console.log("\n✅ Seeding complete! Demo accounts created.\n");
  console.log("📋 Demo Credentials:");
  console.log("   Admin:       admin / admin123");
  console.log("   Coordinator: coordinator / coord123");
  console.log("   Trainer:     trainer / train123");
  console.log("   Learner:     learner / learn123\n");
}

seed().catch(console.error).finally(() => process.exit(0));
