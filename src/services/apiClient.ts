// API client for communicating with our server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // AI endpoints
  async productInterview(data: {
    message: string;
    sessionId: string;
    userId: string;
    conversationHistory: any[];
  }) {
    return this.request('/ai/product-interview', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateFunnel(data: {
    productData?: any;
    targetAudience?: string;
    businessGoals?: string[];
    userId: string;
    prompt?: string;
  }) {
    return this.request('/ai/generate-funnel', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateCreative(data: {
    context: any;
    parameters: any;
    contentType: string;
  }) {
    return this.request('/ai/generate-creative', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Funnel endpoints
  async getFunnels(userId: string) {
    return this.request(`/funnels/user/${userId}`);
  }

  async createFunnel(data: any) {
    return this.request('/funnels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFunnel(funnelId: string, data: any) {
    return this.request(`/funnels/${funnelId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFunnel(funnelId: string) {
    return this.request(`/funnels/${funnelId}`, {
      method: 'DELETE',
    });
  }

  async getFunnelAnalytics(funnelId: string) {
    return this.request(`/funnels/${funnelId}/analytics`);
  }

  // Lead endpoints
  async getLeads(userId: string) {
    return this.request(`/leads/user/${userId}`);
  }

  async createLead(data: any) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLead(leadId: string, data: any) {
    return this.request(`/leads/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getFunnelLeads(funnelId: string) {
    return this.request(`/leads/funnel/${funnelId}`);
  }

  async analyzeLead(leadId: string) {
    return this.request(`/leads/${leadId}/analyze`, {
      method: 'POST',
    });
  }

  // Chatbot endpoints
  async getConversations(sessionId: string) {
    return this.request(`/chatbot/conversations/${sessionId}`);
  }

  async chatWithBot(data: {
    message: string;
    sessionId: string;
    userId: string;
    conversationHistory?: any[];
    context?: any;
  }) {
    return this.request('/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();