import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import client from "../api/client";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const EMOJIS = ["🏝️", "🍔", "🚗", "🏠", "🎁", "✈️", "🛍️", "🎉"];
const getRandomEmoji = () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

export default function DashboardScreen({ navigation }) {
  const { logout, userId } = useContext(AuthContext);
  const { theme, isDarkMode } = useContext(ThemeContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Ekran her göründüğünde (goBack dahil) grupları yeniden çek
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [userId])
  );

  const fetchGroups = async () => {
    if (!userId) return;
    try {
      const response = await client.get(`/users/${userId}/groups`);
      const formattedGroups = (response.data.data || []).map(g => ({
        ...g,
        emoji: getRandomEmoji(),
      }));
      setGroups(formattedGroups);
    } catch (error) {
      console.error("Gruplar çekilirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert("Hata", "Lütfen bir grup adı girin.");
      return;
    }
    setCreating(true);
    try {
      await client.post("/groups", {
        name: newGroupName,
        description: newGroupDesc,
      });
      setModalVisible(false);
      setNewGroupName("");
      setNewGroupDesc("");
      fetchGroups();
    } catch (error) {
      Alert.alert("Hata", "Grup oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate("GroupDetail", { groupId: item._id, groupName: item.name })}

    >
      <View style={styles.groupIconContainer}>
        <Text style={styles.groupIconText}>{item.emoji}</Text>
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupDesc} numberOfLines={1}>
          {item.members?.length || 0} Üye katılıyor
        </Text>
      </View>
      <View style={styles.arrowIcon}>
        <Ionicons name="arrow-forward" size={18} color={theme.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Hoş Geldin!</Text>
          <Text style={styles.headerTitle}>Gruplarım</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.headerAddBtn}>
            <Ionicons name="add" size={24} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchGroups}
        ListHeaderComponent={() => (
          <View>
            <TouchableOpacity 
              style={styles.infoCard} 
              activeOpacity={0.9}
            >
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Masrafları Kolayca Bölüş</Text>
                <Text style={styles.infoDesc}>
                  Arkadaşlarınla etkinlikler düzenle, kimin kime ne kadar borcu olduğunu SplitBro senin için hesaplasın.
                </Text>
              </View>
              <View style={styles.infoIconBg}>
                <Ionicons name="bulb" size={32} color="#f59e0b" />
              </View>
            </TouchableOpacity>

            {!loading && groups.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={60} color={theme.textMuted} />
                <Text style={styles.emptyTitle}>Henüz Grubun Yok</Text>
                <Text style={styles.emptyDesc}>
                  Masraf eklemek ve takip etmek için hemen bir grup oluştur.
                </Text>
              </View>
            )}
          </View>
        )}
        renderItem={renderGroupItem}
        ListFooterComponent={() => (
          <TouchableOpacity 
            style={styles.createGroupDashed} 
            activeOpacity={0.7}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle" size={28} color={theme.primary} />
            <Text style={styles.createGroupDashedText}>Yeni Grup Oluştur</Text>
          </TouchableOpacity>
        )}
      />

      {/* Add Group Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Grup</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Grup Adı (Örn: Antalya Tatili)"
              placeholderTextColor={theme.textMuted}
              value={newGroupName}
              onChangeText={setNewGroupName}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Açıklama (İsteğe bağlı)"
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={3}
              value={newGroupDesc}
              onChangeText={setNewGroupDesc}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCreateGroup}
              disabled={creating}
              style={styles.createButton}
            >
              {creating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Oluştur</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 30,
    paddingBottom: 15,
    backgroundColor: theme.background,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textMuted,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.text,
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAddBtn: {
    backgroundColor: theme.primaryLight,
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  logoutBtn: {
    backgroundColor: theme.dangerBg,
    padding: 10,
    borderRadius: 12,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    marginTop: 10,
    shadowColor: theme.mode === 'dark' ? "#000" : theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: theme.mode === 'dark' ? 0.4 : 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoContent: {
    flex: 1,
    marginRight: 16,
  },
  infoTitle: {
    color: theme.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  infoDesc: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  infoIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.mode === 'dark' ? "#78350f" : "#fffbeb",
    justifyContent: "center",
    alignItems: "center",
  },
  groupCard: {
    flexDirection: "row",
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: theme.mode === 'dark' ? "#000" : "#94a3b8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.mode === 'dark' ? 0.4 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  groupIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: theme.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  groupIconText: {
    fontSize: 26,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    color: theme.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  groupDesc: {
    color: theme.textMuted,
    fontSize: 13,
  },
  arrowIcon: {
    backgroundColor: theme.primaryLight,
    padding: 8,
    borderRadius: 12,
  },
  createGroupDashed: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: theme.primary,
    borderStyle: "dashed",
    borderRadius: 16,
    marginTop: 10,
    backgroundColor: theme.mode === 'dark' ? theme.primaryLight : "#faf5ff",
  },
  createGroupDashedText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.mode === 'dark' ? theme.text : theme.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    color: theme.textMuted,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
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
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.text,
  },
  closeBtn: {
    backgroundColor: theme.background,
    padding: 8,
    borderRadius: 20,
  },
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  createButton: {
    backgroundColor: theme.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
});
