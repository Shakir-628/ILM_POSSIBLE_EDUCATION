import bcrypt from "bcrypt";

const hashPassword = (password) => bcrypt.hashSync(password, 10);

export const users = [
  // Admin users
  {
    name: "Admin User",
    email: "admin@ilmpossible.com",
    password: hashPassword("admin123"),
    role: "admin",
    phone: "+92-300-1234567",
    address: "Admin Office, ILM Possible Education",
    isActive: true,
  },
  {
    name: "Super Admin",
    email: "superadmin@ilmpossible.com",
    password: hashPassword("admin123"),
    role: "admin",
    phone: "+92-300-1234568",
    isActive: true,
  },

  // Teacher users
  {
    name: "Ahmed Ali",
    email: "teacher1@ilmpossible.com",
    password: hashPassword("teacher123"),
    role: "teacher",
    phone: "+92-301-1111111",
    isActive: true,
  },
  {
    name: "Fatima Khan",
    email: "teacher2@ilmpossible.com",
    password: hashPassword("teacher123"),
    role: "teacher",
    phone: "+92-301-2222222",
    isActive: true,
  },
  {
    name: "Hassan Mahmood",
    email: "teacher3@ilmpossible.com",
    password: hashPassword("teacher123"),
    role: "teacher",
    phone: "+92-301-3333333",
    isActive: true,
  },
  {
    name: "Ayesha Siddiqui",
    email: "teacher4@ilmpossible.com",
    password: hashPassword("teacher123"),
    role: "teacher",
    phone: "+92-301-4444444",
    isActive: true,
  },
  {
    name: "Usman Tariq",
    email: "teacher5@ilmpossible.com",
    password: hashPassword("teacher123"),
    role: "teacher",
    phone: "+92-301-5555555",
    isActive: true,
  },

  // Student users
  {
    name: "Ali Raza",
    email: "student1@ilmpossible.com",
    password: hashPassword("student123"),
    role: "student",
    phone: "+92-302-1111111",
    isActive: true,
  },
  {
    name: "Sara Ahmed",
    email: "student2@ilmpossible.com",
    password: hashPassword("student123"),
    role: "student",
    phone: "+92-302-2222222",
    isActive: true,
  },
  {
    name: "Muhammad Bilal",
    email: "student3@ilmpossible.com",
    password: hashPassword("student123"),
    role: "student",
    phone: "+92-302-3333333",
    isActive: true,
  },
  {
    name: "Zainab Malik",
    email: "student4@ilmpossible.com",
    password: hashPassword("student123"),
    role: "student",
    phone: "+92-302-4444444",
    isActive: true,
  },
  {
    name: "Omar Farooq",
    email: "student5@ilmpossible.com",
    password: hashPassword("student123"),
    role: "student",
    phone: "+92-302-5555555",
    isActive: true,
  },
  {
    name: "Hira Shahid",
    email: "student6@ilmpossible.com",
    password: hashPassword("student123"),
    role: "student",
    phone: "+92-302-6666666",
    isActive: true,
  },
  {
    name: "Kamran Haider",
    email: "student7@ilmpossible.com",
    password: hashPassword("student123"),
    role: "student",
    phone: "+92-302-7777777",
    isActive: true,
  },
  {
    name: "Nida Hussain",
    email: "student8@ilmpossible.com",
    password: hashPassword("student123"),
    role: "student",
    phone: "+92-302-8888888",
    isActive: true,
  },
  {
    name: "Fahad Iqbal",
    email: "student9@ilmpossible.com",
    password: hashPassword("student123"),
    role: "student",
    phone: "+92-302-9999999",
    isActive: true,
  },
  {
    name: "Aisha Noor",
    email: "student10@ilmpossible.com",
    password: hashPassword("student123"),
    role: "student",
    phone: "+92-303-1111111",
    isActive: true,
  },
];

