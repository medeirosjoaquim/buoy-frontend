import { LoginService, LoginRequestData, LoginResponseData } from "./interface";

export class LoginApiService extends LoginService {
  // Promise lock to prevent duplicate refresh calls
  private refreshPromise: Promise<LoginResponseData> | null = null;

  public async login(payload: LoginRequestData): Promise<LoginResponseData> {
    const response: LoginResponseData = await this.fetchPost(
      "/login/",
      { method: "POST" },
      payload
    );

    this.storeInLocalStorage(response);

    return response;
  }

  public logout() {
    this.removeFromLocalStorage();
  }

  public async getCurrentToken(): Promise<LoginResponseData | null> {
    return this.retrieveFromLocalStorage();
  }

  public async getValidToken(): Promise<LoginResponseData | null> {
    const token = await this.getCurrentToken();
    if (!token || !token.access) {
      this.logout();
      return null;
    }

    try {
      const parsedToken = this.parseJwt(token?.access);
      const isExpired = new Date().getTime() / 1000 > parsedToken.exp;

      if (isExpired) {
        // If a refresh is already in progress, wait for it instead of triggering another
        if (this.refreshPromise) {
          await this.refreshPromise;
          return this.retrieveFromLocalStorage();
        }

        // Start refresh and store the promise so concurrent calls can await it
        this.refreshPromise = this.fetchPost(
          "/refresh/",
          { method: "POST" },
          { refresh: token.refresh }
        );

        try {
          const response = await this.refreshPromise;
          this.storeInLocalStorage(response);
        } finally {
          // Clear the lock so future refreshes can proceed
          this.refreshPromise = null;
        }
      }
      return this.retrieveFromLocalStorage();
    } catch (e) {
      console.log(e);
      this.refreshPromise = null;
      this.logout();
    }
    return null;
  }

  private loginDataKey = "loginData";

  private storeInLocalStorage = (payload: LoginResponseData) => {
    localStorage.setItem(this.loginDataKey, JSON.stringify(payload));
  };

  private retrieveFromLocalStorage = (): LoginResponseData | null => {
    try {
      const serializedLoginData = localStorage.getItem(this.loginDataKey);
      if (!serializedLoginData) {
        throw new Error("Not logged in");
      }
      return JSON.parse(serializedLoginData);
    } catch {
      return null;
    }
  };

  private removeFromLocalStorage = (): void => {
    localStorage.removeItem(this.loginDataKey);
  };

  // https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
  private parseJwt(token: string) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  }
}
