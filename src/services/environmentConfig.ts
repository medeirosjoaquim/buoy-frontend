import { ApiService } from "services";

interface EnvironmentConfigData {
  dataMode: string;
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId: string;
  measurementId: string;
  storageBucket: string;
  databaseURL: string;
}

export class EnvironmentConfigService extends ApiService {
  async getConfig(): Promise<EnvironmentConfigData> {
    // const uri = "/clientConfig";
    // const response = await this.get(uri);
    // const environmentConfig = response as EnvironmentConfigData;
    // return environmentConfig.data;

    return {
      dataMode: import.meta.env.VITE_FAKE_API_MODE,
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    } as EnvironmentConfigData;
  }
}
