import { User, UsersResponse } from "services/users/interface";

// First names and last names for generating mock data
const firstNames = [
  "John", "Jane", "Alice", "Miles", "Bob", "Carol", "David", "Eva",
  "Frank", "Grace", "Henry", "Ivy", "Jack", "Kate", "Leo", "Mia",
  "Noah", "Olivia", "Paul", "Quinn", "Ryan", "Sara", "Tom", "Uma",
  "Victor", "Wendy", "Xavier", "Yara", "Zach", "Anna"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Cummerata", "Brown", "Davis", "Miller", "Wilson",
  "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
  "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee",
  "Walker", "Hall", "Allen", "Young", "King", "Wright"
];

export const mockUsers: User[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  firstName: firstNames[i],
  lastName: lastNames[i],
  email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@example.com`,
  image: `https://robohash.org/${i + 1}`,
}));

// Verify ID=4 has the expected values for acceptance criteria
// ID=4 should have firstName="Miles", lastName="Cummerata"
if (mockUsers[3].id !== 4 || mockUsers[3].firstName !== "Miles" || mockUsers[3].lastName !== "Cummerata") {
  throw new Error("Mock data does not match acceptance criteria: ID=4 should be Miles Cummerata");
}

export const mockUsersResponse: UsersResponse = {
  users: mockUsers,
  total: mockUsers.length,
  skip: 0,
  limit: mockUsers.length,
};
