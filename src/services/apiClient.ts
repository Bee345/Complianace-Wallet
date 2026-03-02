/**
 * API Client for the Street Vendor Compliance Wallet.
 * Handles communication with the Express backend.
 */

export const apiClient = {
  async getHealth() {
    const response = await fetch('/api/health');
    return response.json();
  },

  async getVendorProfile(id: string) {
    const response = await fetch(`/api/vendor/${id}`);
    if (!response.ok) throw new Error('Vendor not found');
    return response.json();
  },

  // Add more methods as needed for registration, logging, etc.
};
