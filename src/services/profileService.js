import api from "./api";

/**
 * Met à jour la photo de profil de l'utilisateur.
 * Retourne l'URL publique de la photo stockée sur Supabase.
 * @param {File} file
 */
export async function updateProfilePicture(file) {
  const formData = new FormData();
  formData.append("picture", file);
  const response = await api.put("/profile/picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/**
 * Met à jour la préférence de thème de l'utilisateur côté backend.
 * @param {"LIGHT"|"DARK"|"SYSTEM"} themePreference
 */
export async function updateThemePreference(themePreference) {
  const response = await api.put("/profile/theme", { themePreference });
  return response.data;
}
