// api/summary.ts
import api from "./axios";

export async function fetchDashboardSummary(shipId: number, userId: number) {
  try {
    const res = await api.get(`/summary`, { params: { ship_id: shipId, user_id: userId } });
    return res.data; // { counters: {...}, last: {...} }
  } catch (error) {
    console.error("Errore getDashboardSummary:", error);
    return { counters: {}, last: {} };
  }
}