import api from "./api";

export async function listEmployees(shopId) {
  const { data } = await api.get(`/users/shop/${shopId}`);
  return data;
}

export async function createEmployee(shopId, employee) {
  const { data } = await api.post(`/users/shop/${shopId}`, employee);
  return data;
}

export async function updateEmployee(userId, updates) {
  const { data } = await api.put(`/users/${userId}`, updates);
  return data;
}

export async function changeEmployeePassword(userId, newPassword) {
  await api.patch(`/users/${userId}/password`, { newPassword });
}

export async function toggleEmployeeActive(userId) {
  const { data } = await api.patch(`/users/${userId}/toggle-active`);
  return data;
}

export async function deleteEmployee(userId) {
  await api.delete(`/users/${userId}`);
}
//hey