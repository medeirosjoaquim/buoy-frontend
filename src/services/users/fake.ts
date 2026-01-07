import { UsersService, UsersResponse, User } from "./interface";

const fakeUsers: User[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  firstName: `FirstName${i + 1}`,
  lastName: `LastName${i + 1}`,
  email: `user${i + 1}@example.com`,
  image: `https://robohash.org/${i + 1}`,
}));

export class UsersFakeService implements UsersService {
  private latencyDuration: number;

  constructor(latencyDuration = 0, _errorProbability = 0) {
    this.latencyDuration = latencyDuration;
  }

  async getAll(): Promise<UsersResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          users: fakeUsers,
          total: fakeUsers.length,
          skip: 0,
          limit: fakeUsers.length,
        });
      }, this.latencyDuration);
    });
  }
}
