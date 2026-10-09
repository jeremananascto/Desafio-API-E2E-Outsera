import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

const get = (key: string, fallback: string): string => process.env[key] ?? fallback;

export const env = {
  api: {
    baseURL: get('API_BASE_URL', 'https://restful-booker.herokuapp.com'),
    username: get('API_USERNAME', 'admin'),
    password: get('API_PASSWORD', 'password123'),
  },
  e2e: {
    baseURL: get('E2E_BASE_URL', 'https://www.saucedemo.com'),
    user: get('E2E_USER', 'standard_user'),
    password: get('E2E_PASSWORD', 'secret_sauce'),
    demoAppPort: Number(get('DEMO_APP_PORT', '4173')),
    headless: get('HEADLESS', 'true') !== 'false',
    slowMo: Number(get('SLOW_MO', '0')),
  },
} as const;
