import { Account, GASRequest } from '../types';

const GAS_URL = import.meta.env.VITE_GAS_URL;

export const api = {
  async getAll(): Promise<Account[]> {
    if (!GAS_URL) {
      console.error('VITE_GAS_URL is not set');
      return [];
    }
    const response = await fetch(GAS_URL);
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
  },

  async mutate(payload: GASRequest): Promise<any> {
    if (!GAS_URL) {
      console.error('VITE_GAS_URL is not set');
      return;
    }
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Mutation failed');
    return response.json();
  }
};
