export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      MYSQL_USER: string;
      MYSQL_PW: string;
      PRIVATE_KEY: string;
    }
  }
}
