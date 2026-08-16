import api from "./api";

export async function getNotifications(shopId) {
  const response = await api.get("/notifications", { params: { shopId } });
  return response.data;
}
