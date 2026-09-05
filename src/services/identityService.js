import api from "./api";

export async function listMyMemberships() {
  const { data } = await api.get("/identity/memberships");
  return data;
}

export async function getMembershipByShop(shopId) {
  const { data } = await api.get(`/identity/memberships/shop/${shopId}`);
  return data;
}

export async function createMembership(payload) {
  const { data } = await api.post("/identity/memberships", payload);
  return data;
}

export async function updateMembershipRole(membershipId, role) {
  const { data } = await api.put(`/identity/memberships/${membershipId}/role`, { role });
  return data;
}

export async function toggleMembershipActive(membershipId) {
  const { data } = await api.patch(`/identity/memberships/${membershipId}/toggle-active`);
  return data;
}

export async function deleteMembership(membershipId) {
  await api.delete(`/identity/memberships/${membershipId}`);
}

export async function updateMembershipPermissions(membershipId, payload) {
  const { data } = await api.put(`/identity/memberships/${membershipId}/permissions`, payload);
  return data;
}

export async function getMyShops() {
  const { data } = await api.get("/identity/shops");
  return data;
}
