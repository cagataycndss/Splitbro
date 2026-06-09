import React, { useContext, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import client from "../api/client";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { userId, logout } = useContext(AuthContext);
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [editProfileModal, setEditProfileModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  // Furkan Kasalak – Profil cache göstergesi
  const [profileCached, setProfileCached] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await client.get(`/users/${userId}/profile`);
      const data = response.data.data;
      setProfile(data);
      setName(data.firstName);
      setSurname(data.lastName);
      // Furkan Kasalak – Cache flag kontrolü
      setProfileCached(data._cached === true);
    } catch (error) {
      console.error("Profil bilgileri çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await client.put(`/users/${userId}`, {
        firstName: name,
        lastName: surname,
      });
      Alert.alert("Başarılı", "Profiliniz güncellendi.");
      setEditProfileModal(false);
      fetchProfile();
    } catch (error) {
      Alert.alert("Hata", "Profil güncellenemedi.");
    }
  };

  const handleChangePassword = async () => {
    try {
      await client.put(`/users/${userId}/change-password`, {
        currentPassword: oldPassword,
        newPassword,
      });
      Alert.alert("Başarılı", "Şifreniz güncellendi.");
      setPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      Alert.alert(
        "Hata",
        error.response?.data?.message || "Şifre güncellenemedi.",
      );
    }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("İzin Gerekli", "Galeriye erişim izni vermelisiniz.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri) => {
    try {
      const formData = new FormData();
      formData.append("avatar", {
        uri: uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      });
      await client.post(`/users/${userId}/avatar`, formData);
      Alert.alert("Başarılı", "Profil fotoğrafınız güncellendi.");
      fetchProfile();
    } catch (error) {
      Alert.alert("Hata", "Profil fotoğrafı yüklenemedi.");
    }
  };

  const handleDeleteAvatar = () => {
    Alert.alert("Emin misiniz?", "Profil fotoğrafınız kaldırılacak.", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await client.delete(`/users/${userId}/avatar`);
            Alert.alert("Başarılı", "Profil fotoğrafı silindi.");
            fetchProfile();
          } catch (e) {
            Alert.alert("Hata", "Fotoğraf silinemedi.");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Emin misiniz?",
      "Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Hesabımı Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await client.delete(`/users/${userId}/account`);
              logout();
            } catch (e) {
              Alert.alert("Hata", "Hesap silinemedi.");
            }
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Çıkış Yap", style: "destructive", onPress: logout },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.avatarContainer}
            onPress={handlePickAvatar}
          >
            {profile?.avatar ? (
              <Image
                source={{ uri: profile.avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {profile?.firstName ? profile.firstName.charAt(0) : "U"}
              </Text>
            )}
            <View style={styles.editAvatarBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          {profile?.avatar && (
            <TouchableOpacity
              onPress={handleDeleteAvatar}
              style={styles.deleteAvatarBtn}
            >
              <Ionicons
                name="trash-outline"
                size={14}
                color={theme.danger}
                style={{ marginRight: 4 }}
              />
              <Text style={{ color: theme.danger, fontSize: 13, fontWeight: "600" }}>
                Fotoğrafı Sil
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.name}>
          {profile?.firstName} {profile?.lastName}
        </Text>
        <Text style={styles.email}>{profile?.email}</Text>
        {/* Furkan Kasalak – Redis cache göstergesi */}
        {profileCached && (
          <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.mode === 'dark' ? '#1e3a5f' : '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
            <Text style={{ fontSize: 11, color: theme.mode === 'dark' ? '#60a5fa' : '#3b82f6', fontWeight: '600' }}>⚡ Cache'den yüklendi</Text>
          </View>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        
        {/* Görünüm Ayarları */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionHeading}>Görünüm Ayarları</Text>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: isDarkMode ? "#334155" : "#f1f5f9" }]}>
                <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={isDarkMode ? "#cbd5e1" : "#f59e0b"} />
              </View>
              <Text style={styles.infoLabel}>Karanlık Mod (Dark Mode)</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#cbd5e1", true: theme.primary }}
              thumbColor={"#ffffff"}
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionHeading}>Hesap Ayarları</Text>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => setEditProfileModal(true)}
          >
            <View style={styles.infoRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: isDarkMode ? theme.primaryLight : "#f5f3ff" }]}>
                <Ionicons name="person-outline" size={20} color={theme.primary} />
              </View>
              <Text style={styles.infoLabel}>Profil Bilgilerini Güncelle</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.infoRow, { borderBottomWidth: 0 }]}
            onPress={() => setPasswordModal(true)}
          >
            <View style={styles.infoRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: isDarkMode ? "#78350f" : "#fef3c7" }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#d97706" />
              </View>
              <Text style={styles.infoLabel}>Şifre Değiştir</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionHeading}>Tehlikeli Alan</Text>

          <TouchableOpacity
            style={[styles.infoRow, { borderBottomWidth: 0 }]}
            onPress={handleDeleteAccount}
          >
            <View style={styles.infoRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.dangerBg }]}>
                <Ionicons name="warning-outline" size={20} color={theme.danger} />
              </View>
              <Text style={[styles.infoLabel, { color: theme.danger }]}>
                Hesabımı Kalıcı Olarak Sil
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.logoutButtonWrapper}
          onPress={handleLogout}
        >
          <View style={styles.logoutButton}>
            <Ionicons
              name="log-out-outline"
              size={24}
              color={theme.danger}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileModal}
        animationType="slide"
        transparent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profili Güncelle</Text>
              <TouchableOpacity
                onPress={() => setEditProfileModal(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ad"
              placeholderTextColor={theme.textMuted}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Soyad"
              placeholderTextColor={theme.textMuted}
              value={surname}
              onChangeText={setSurname}
            />

            <TouchableOpacity activeOpacity={0.8} onPress={handleUpdateProfile}>
              <View style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </View>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={passwordModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Şifre Değiştir</Text>
              <TouchableOpacity
                onPress={() => setPasswordModal(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Eski Şifre"
              placeholderTextColor={theme.textMuted}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Yeni Şifre"
              placeholderTextColor={theme.textMuted}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TouchableOpacity activeOpacity={0.8} onPress={handleChangePassword}>
              <View style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Güncelle</Text>
              </View>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
  },
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 30,
    paddingBottom: 20,
    backgroundColor: theme.background,
  },
  headerTitle: {
    color: theme.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  profileCard: {
    backgroundColor: theme.card,
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: theme.mode === 'dark' ? "#000" : "#94a3b8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.mode === 'dark' ? 0.3 : 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 4,
    borderColor: theme.card,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: { fontSize: 40, fontWeight: "800", color: theme.primary },
  avatarImage: { width: "100%", height: "100%", borderRadius: 50 },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: theme.card,
  },
  deleteAvatarBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.dangerBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  name: { fontSize: 22, fontWeight: "800", color: theme.text, marginBottom: 4 },
  email: { fontSize: 15, color: theme.textMuted, fontWeight: "500" },

  infoSection: {
    backgroundColor: theme.card,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: theme.mode === 'dark' ? "#000" : "#94a3b8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.mode === 'dark' ? 0.3 : 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.textMuted,
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.background,
  },
  infoRowLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoLabel: { fontSize: 16, color: theme.text, fontWeight: "600" },

  logoutButtonWrapper: {
    marginHorizontal: 20,
    marginBottom: 40,
    marginTop: 10,
  },
  logoutButton: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.dangerBg,
  },
  logoutButtonText: { color: theme.danger, fontSize: 17, fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: "800", color: theme.text },
  closeBtn: { backgroundColor: theme.background, padding: 8, borderRadius: 20 },

  input: {
    backgroundColor: theme.inputBg,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    fontSize: 15,
    color: theme.text,
  },
  saveButton: {
    backgroundColor: theme.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: { color: "#ffffff", fontSize: 17, fontWeight: "700" },
});
