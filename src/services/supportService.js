import api from './api';

const supportService = {
  // User Actions
  createTicket: async (request) => {
    const response = await api.post('/support/tickets', request);
    return response.data;
  },

  uploadAttachment: async (file, ticketId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (ticketId) formData.append('ticketId', ticketId);
    const response = await api.post('/support/attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
  },

  findPersonWithShops: async (identifier) => {
    const response = await api.get('/support/admin/persons/search', {
      params: { identifier }
    });
    return response.data;
  },

  activateSubscriptionManually: async (shopId, { reason, paymentReference, amount, ticketId = null }) => {
    const response = await api.post(`/support/admin/shops/${shopId}/activate-subscription`, {
      reason,
      paymentReference,
      amount,
      ticketId
    });
    return response.data;
  }
};

export default supportService;
