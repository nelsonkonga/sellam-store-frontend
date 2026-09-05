import api from "./api";

export async function listRegisters(shopId) {
  const { data } = await api.get(`/cash/registers/${shopId}`);
  return data;
}

export async function createRegister(shopId, payload) {
  const { data } = await api.post(`/cash/registers/${shopId}`, payload);
  return data;
}

export async function openSession(registerId, payload) {
  const { data } = await api.post(`/cash/sessions/open/${registerId}`, payload);
  return data;
}

export async function closeSession(sessionId, payload) {
  const { data } = await api.post(`/cash/sessions/${sessionId}/close`, payload);
  return data;
}

export async function regularizeSession(sessionId, payload) {
  const { data } = await api.post(`/cash/sessions/${sessionId}/regularize`, payload);
  return data;
}

export async function resolveHandover(pendingSessionId, currentSessionId, payload) {
  const { data } = await api.post('/cash/sessions/handover/resolve', payload, {
    params: { pendingSessionId, currentSessionId },
  });
  return data;
}

export async function addMovement(sessionId, payload) {
  const { data } = await api.post(`/cash/sessions/${sessionId}/movements`, payload);
  return data;
}

export async function getSessionDetail(sessionId) {
  const { data } = await api.get(`/cash/sessions/${sessionId}`);
  return data;
}

export async function listSessions(shopId) {
  const { data } = await api.get(`/cash/sessions/shop/${shopId}`);
  return data;
}

export async function getCashStatus(shopId) {
  const { data } = await api.get(`/cash/status/${shopId}`);
  return data;
}
