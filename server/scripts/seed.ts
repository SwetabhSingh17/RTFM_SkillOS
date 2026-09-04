import "dotenv/config";
import { db } from "../db";
import { 
  users, 
  competencyDomains, 
  competencyItems, 
  userCompetencies, 
  learningPaths, 
  igotCourses, 
  igotEnrollments 
} from "../../shared/schema";

/**
 * MoSPI & NSSTA Mock Data Seeder
 * This populates the database with realistic Hackathon data conforming to the problem statement.
 */
async function seed() {
  console.log("🌱 Starting Database Seed for MoSPI/NSSTA TPAC...");

  try {
    // 1. Seed Users (Roles: admin, hr, trainer, learner)
    console.log("Seeding Users...");
    const insertedUsers = await db.insert(users).values([
      {
        email: "admin@mospi.gov.in",
        passwordHash: "mock-hash",
        fullName: "Dr. A. K. Sharma",
        role: "admin",
        designation: "Director General",
        department: "NSSTA",
        experienceYears: 25,
      },
      {
        email: "trainer@mospi.gov.in",
        passwordHash: "mock-hash",
        fullName: "Priya Patel",
        role: "trainer",
        designation: "Joint Director",
        department: "Data Informatics & Innovation Division (DIID)",
        experienceYears: 12,
      },
      {
        email: "learner1@mospi.gov.in",
        passwordHash: "mock-hash",
        fullName: "Rahul Verma",
        role: "learner",
        designation: "Junior Statistical Officer (JSO)",
        department: "Field Operations Division (FOD)",
        experienceYears: 2,
      },
      {
        email: "learner2@mospi.gov.in",
        passwordHash: "mock-hash",
        fullName: "Sneha Iyer",
        role: "learner",
        designation: "Senior Statistical Officer (SSO)",
        department: "National Accounts Division",
        experienceYears: 6,
      }
    ]).returning();

    const [admin, trainer, jso, sso] = insertedUsers;

    // 2. Seed Competency Domains (From Problem Statement)
    console.log("Seeding Competency Domains...");
    const domains = await db.insert(competencyDomains).values([
      { name: "Statistical Competencies", description: "Core statistical methodologies and frameworks" },
      { name: "Technical Competencies", description: "Software, programming, and data analysis tools" },
      { name: "Digital Governance", description: "Policies, cybersecurity, and digital public infrastructure" },
      { name: "Behavioural and Managerial", description: "Leadership, communication, and project management" }
    ]).returning();

    const [statDomain, techDomain, govDomain, behaveDomain] = domains;

    // 3. Seed Competency Items
    console.log("Seeding Competency Items...");
    const items = await db.insert(competencyItems).values([
      // Statistical
      { domainId: statDomain.id, name: "Survey Design", description: "Designing national surveys" },
      { domainId: statDomain.id, name: "National Accounts", description: "GDP and macroeconomic aggregates" },
      { domainId: statDomain.id, name: "SDG Indicators", description: "Tracking Sustainable Development Goals" },
      
      // Technical
      { domainId: techDomain.id, name: "Python for Data Science", description: "Pandas, NumPy, Scikit-learn" },
      { domainId: techDomain.id, name: "R Programming", description: "Statistical computing in R" },
      { domainId: techDomain.id, name: "GIS Spatial Analysis", description: "Geographic Information Systems mapping" },
      { domainId: techDomain.id, name: "AI/ML Fundamentals", description: "Basic machine learning models" },
      
      // Digital Governance
      { domainId: govDomain.id, name: "Data Privacy", description: "Handling sensitive PII and anonymization" },
      { domainId: govDomain.id, name: "Government Cloud", description: "MeghRaj and AWS Gov deployment" },
      
      // Behavioural
      { domainId: behaveDomain.id, name: "Project Management", description: "Managing large scale data collections" }
    ]).returning();

    // 4. Seed User Competencies (to populate Radar Charts)
    console.log("Seeding User Competencies (Skill Gaps)...");
    
    // Rahul (JSO) - High Target, Low Baseline (Needs Training)
    await db.insert(userCompetencies).values(items.map(item => ({
      userId: jso.id,
      competencyItemId: item.id,
      currentLevel: Math.floor(Math.random() * 3) + 1, // 1 to 3
      targetLevel: 4, // JSO target is 4
      priority: "high"
    })));

    // Sneha (SSO) - Higher Baseline
    await db.insert(userCompetencies).values(items.map(item => ({
      userId: sso.id,
      competencyItemId: item.id,
      currentLevel: Math.floor(Math.random() * 2) + 3, // 3 to 4
      targetLevel: 5, // SSO target is 5
      priority: "medium"
    })));

    // 5. Seed NSSTA TPAC & iGOT Courses
    console.log("Seeding NSSTA TPAC & iGOT Courses...");
    const courses = await db.insert(igotCourses).values([
      {
        courseId: "igot_py_101",
        title: "Python for Official Statistics (NSSTA TPAC)",
        provider: "NSSTA",
        description: "Official training on using Python for data imputation and analysis.",
        durationHours: 15,
        skillsCovered: ["Python for Data Science", "Data Cleaning"]
      },
      {
        courseId: "igot_sdg_202",
        title: "National Indicator Framework (NIF) for SDGs",
        provider: "MoSPI",
        description: "Deep dive into tracking SDG indicators.",
        durationHours: 8,
        skillsCovered: ["SDG Indicators", "National Accounts"]
      },
      {
        courseId: "igot_gis_intro",
        title: "Introduction to GIS for Enumerators",
        provider: "iGOT Karmayogi",
        description: "Mapping households using digital infrastructure.",
        durationHours: 5,
        skillsCovered: ["GIS Spatial Analysis", "Survey Design"]
      }
    ]).returning();

    // 6. Seed Learning Paths
    console.log("Seeding Learning Paths...");
    await db.insert(learningPaths).values([
      {
        userId: jso.id,
        title: "JSO Induction Pathway",
        description: "Required TPAC courses for newly inducted Junior Statistical Officers.",
        status: "active",
        progress: 20
      }
    ]);

    // 7. Seed Enrollments
    await db.insert(igotEnrollments).values([
      {
        userId: jso.id,
        courseId: courses[0].id,
        status: "in_progress",
        completionPercentage: 20
      },
      {
        userId: sso.id,
        courseId: courses[1].id,
        status: "completed",
        completionPercentage: 100
      }
    ]);

    console.log("✅ Seed completed successfully! Your Hackathon Demo data is ready.");
    process.exit(0);

  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
