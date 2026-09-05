import api from "./api";

export async function getSaleTypes(shopId) {
  const { data } = await api.get('/sale-types', { params: { shopId } });
  return data;
}

export async function createSaleType(shopId, data) {
  const { data: created } = await api.post('/sale-types', data, { params: { shopId } });
  return created;
}
