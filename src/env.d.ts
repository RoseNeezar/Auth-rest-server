declare namespace NodeJS {
  export interface ProcessEnv {
    APP_PORT: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
  }
}
