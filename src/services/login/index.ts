import { LoginFakeService } from "./fake";
import { LoginApiService } from "./api";
import { LoginService } from "./interface";

let service: LoginService = new LoginApiService();

if (import.meta.env.VITE_FAKE_API_MODE === "true") {
  service = new LoginFakeService(1000, 0);
}

export default service;
