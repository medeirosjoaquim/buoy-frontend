import { LoginApiService } from "./api";

// Create an expired JWT token for testing (exp in the past)
function createExpiredToken(): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      sub: "test-user",
    })
  );
  const signature = btoa("fake-signature");
  return `${header}.${payload}.${signature}`;
}

// Create a valid JWT token for testing (exp in the future)
function createValidToken(): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      sub: "test-user",
    })
  );
  const signature = btoa("fake-signature");
  return `${header}.${payload}.${signature}`;
}

describe("LoginApiService", () => {
  let service: LoginApiService;
  let fetchPostSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    service = new LoginApiService();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Problem #1: Duplicate refresh prevention", () => {
    it("should only call /refresh once when multiple parallel requests are made with expired token", async () => {
      // Setup: Store an expired token in localStorage
      const expiredToken = {
        access: createExpiredToken(),
        refresh: "test-refresh-token",
      };
      localStorage.setItem("loginData", JSON.stringify(expiredToken));

      // Mock fetchPost to simulate a slow refresh call
      const refreshedToken = {
        access: createValidToken(),
        refresh: "new-refresh-token",
      };

      let refreshCallCount = 0;
      fetchPostSpy = vi
        .spyOn(service as any, "fetchPost")
        .mockImplementation(async (...args: unknown[]) => {
          const url = args[0] as string;
          if (url === "/refresh/") {
            refreshCallCount++;
            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 100));
            return refreshedToken;
          }
          return null;
        });

      // Act: Make 5 parallel calls to getValidToken (simulating parallel API requests)
      const parallelCalls = [
        service.getValidToken(),
        service.getValidToken(),
        service.getValidToken(),
        service.getValidToken(),
        service.getValidToken(),
      ];

      await Promise.all(parallelCalls);

      // Assert: Only ONE refresh call should have been made
      expect(refreshCallCount).toBe(1);
      expect(fetchPostSpy).toHaveBeenCalledTimes(1);
      expect(fetchPostSpy).toHaveBeenCalledWith(
        "/refresh/",
        { method: "POST" },
        { refresh: "test-refresh-token" }
      );
    });

    it("should return valid token for all parallel callers after single refresh", async () => {
      // Setup: Store an expired token
      const expiredToken = {
        access: createExpiredToken(),
        refresh: "test-refresh-token",
      };
      localStorage.setItem("loginData", JSON.stringify(expiredToken));

      // Mock refresh to return a new valid token
      const refreshedToken = {
        access: createValidToken(),
        refresh: "new-refresh-token",
      };

      vi.spyOn(service as any, "fetchPost").mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return refreshedToken;
      });

      // Act: Make parallel calls
      const results = await Promise.all([
        service.getValidToken(),
        service.getValidToken(),
        service.getValidToken(),
      ]);

      // Assert: All callers should receive the refreshed token
      results.forEach((result) => {
        expect(result).not.toBeNull();
        expect(result?.access).toBe(refreshedToken.access);
        expect(result?.refresh).toBe(refreshedToken.refresh);
      });
    });

    it("should not call refresh when token is still valid", async () => {
      // Setup: Store a valid (non-expired) token
      const validToken = {
        access: createValidToken(),
        refresh: "test-refresh-token",
      };
      localStorage.setItem("loginData", JSON.stringify(validToken));

      fetchPostSpy = vi.spyOn(service as any, "fetchPost");

      // Act: Call getValidToken
      const result = await service.getValidToken();

      // Assert: No refresh call should be made
      expect(fetchPostSpy).not.toHaveBeenCalled();
      expect(result?.access).toBe(validToken.access);
    });

    it("should allow new refresh after previous refresh completes", async () => {
      // Setup: Store an expired token
      const expiredToken = {
        access: createExpiredToken(),
        refresh: "test-refresh-token",
      };
      localStorage.setItem("loginData", JSON.stringify(expiredToken));

      let refreshCallCount = 0;
      vi.spyOn(service as any, "fetchPost").mockImplementation(async () => {
        refreshCallCount++;
        await new Promise((resolve) => setTimeout(resolve, 10));
        // Return a token that's still expired to trigger refresh on next call
        return {
          access: createExpiredToken(),
          refresh: `refresh-token-${refreshCallCount}`,
        };
      });

      // Act: First batch of parallel calls
      await Promise.all([service.getValidToken(), service.getValidToken()]);

      // Second batch of parallel calls (after first refresh completed)
      await Promise.all([service.getValidToken(), service.getValidToken()]);

      // Assert: Should have 2 refresh calls (one per batch)
      expect(refreshCallCount).toBe(2);
    });
  });
});
