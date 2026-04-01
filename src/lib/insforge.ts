import { createClient } from '@insforge/sdk';

const PROJECT_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://8jztpnzq.eu-central.insforge.app';
const PROJECT_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'ik_b01ade282fb2baf13d9768514a658487';

export const insforge = createClient({
  baseUrl: PROJECT_URL,
  anonKey: PROJECT_ANON_KEY,
});
