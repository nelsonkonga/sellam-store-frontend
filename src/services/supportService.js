import api from './api';

const supportService = {
  // User Actions
  createTicket: async (request) => {
    const response = await api.post('/support/tickets', request);
    return response.data;
  },

  listMyTickets: async () => {
    const response = await api.get('/support/tickets/my');
    return response.data;
  },

  getTicketDetail: async (ticketId) => {
    const response = await api.get(`/support/tickets/${ticketId}`);
    return response.data;
  },

  addMessage: async (ticketId, message) => {
    const response = await api.post(`/support/tickets/${ticketId}/messages`, { message });
    return response.data;
  },

  // Admin Actions
  listAllTickets: async () => {
    const response = await api.get('/support/admin/tickets');
    return response.data;
  },

  updateTicketStatus: async (ticketId, status) => {
    const response = await api.put(`/support/admin/tickets/${ticketId}/status`, { status });
    return response.data;
  },

  resetIdentityLimits: async (userId, reason, ticketId = null) => {
    const response = await api.post(`/support/admin/users/${userId}/reset-identity-limits`, { 
      reason,
      ticketId 
    });
    return response.data;
  }
};

export default supportService;
