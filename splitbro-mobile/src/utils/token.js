import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "splitbro_auth_token";
const USER_ID_KEY = "splitbro_user_id";

// Token'ı cihaza kaydet
export const saveToken = async (token) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error("Token kaydedilemedi:", error);
  }
};

// Cihazdaki token'ı getir
export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Token alınamadı:", error);
    return null;
  }
};

// Çıkış yapıldığında token'ı sil
export const deleteToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Token silinemedi:", error);
  }
};

export const saveUserId = async (userId) => {
  try {
    await SecureStore.setItemAsync(USER_ID_KEY, userId);
  } catch (error) {
    console.error("UserId kaydedilemedi:", error);
  }
};

export const getUserId = async () => {
  try {
    return await SecureStore.getItemAsync(USER_ID_KEY);
  } catch (error) {
    console.error("UserId okunamadı:", error);
    return null;
  }
};

export const deleteUserId = async () => {
  try {
    await SecureStore.deleteItemAsync(USER_ID_KEY);
  } catch (error) {
    console.error("UserId silinemedi:", error);
  }
};
