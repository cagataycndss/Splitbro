import React, { useEffect, useState, useContext, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform,
  TextInput,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
} from "react-native";
import client from "../api/client";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";


export default function ExpenseDetailScreen({ route, navigation }) {
  const { theme, isDarkMode } = useContext(ThemeContext);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { expenseId, groupMembers } = route.params;
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  // Split Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [savingSplit, setSavingSplit] = useState(false);

  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  // Furkan Kasalak – Fiyat doğrulama state
  const [verifying, setVerifying] = useState(false);
  const verifyPollingRef = useRef(null);

  useEffect(() => {
    fetchExpenseDetails();
  }, [expenseId]);

  const fetchExpenseDetails = async () => {
    try {
      const response = await client.get(`/expenses/${expenseId}`);
      setExpense(response.data.data);
    } catch (error) {
      console.error("Harcama detayı çekilirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = () => {
    Alert.alert("Emin misiniz?", "Harcama kalıcı olarak silinecektir.", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await client.delete(`/expenses/${expenseId}`);
            Alert.alert("Başarılı", "Harcama silindi.");
            navigation.goBack();
          } catch (e) {
            Alert.alert("Hata", "Silinemedi.");
          }
        },
      },
    ]);
  };

  const handleAddItem = async () => {
    if (!newItemName || !newItemPrice || !expense) return;
    
    // Keep original state in case of rollback
    const originalExpense = { ...expense };

    // Create optimistic temporary item
    const tempId = "temp-" + Date.now();
    const tempItem = {
      _id: tempId,
      name: newItemName,
      price: Number(newItemPrice),
      category: "Manuel",
      assignedUserIds: [],
    };

    // Close modal and clear inputs instantly
    setAddItemModalVisible(false);
    setNewItemName("");
    setNewItemPrice("");

    // Update local state instantly
    setExpense({
      ...expense,
      items: [...(expense.items || []), tempItem],
    });

    try {
      await client.post(`/expenses/${expenseId}/items`, {
        name: tempItem.name,
        price: tempItem.price,
        category: "Manuel",
      });
      // Quietly fetch actual details from server to keep in sync
      const response = await client.get(`/expenses/${expenseId}`);
      setExpense(response.data.data);
    } catch (error) {
      console.error("Ürün ekleme hatası:", error);
      // Rollback to original state
      setExpense(originalExpense);
      Alert.alert("Hata", "Ürün eklenemedi.");
    }
  };


  const openSplitModal = (item) => {
    setSelectedItem(item);
    const assignedIds = (item.assignedUserIds || []).filter(u => u != null).map((u) => u._id || u);
    setSelectedUserIds(assignedIds);
    setModalVisible(true);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleSaveSplit = async () => {
    if (!selectedItem || !expense) return;
    setSavingSplit(true);

    // Keep original state in case of rollback
    const originalExpense = { ...expense };

    // Optimistic Update: Update the local state instantly
    const updatedItems = expense.items.map((item) => {
      if (item._id === selectedItem._id) {
        // Map selected user IDs to actual user objects locally
        const mappedUsers = selectedUserIds.map((id) => {
          const member = groupMembers.find(m => {
            const isGuest = !!m.guestName;
            const uId = isGuest ? m._id : m.user?._id || m.user;
            return uId === id;
          });
          return member ? (member.user || { _id: id }) : { _id: id };
        });
        return { ...item, assignedUserIds: mappedUsers };
      }
      return item;
    });

    setExpense({ ...expense, items: updatedItems });
    setModalVisible(false); // Close modal instantly

    try {
      await client.post(
        `/expenses/${expenseId}/items/${selectedItem._id}/split`,
        {
          assignedUserIds: selectedUserIds,
        },
      );
      
      // Quietly fetch actual details from server to keep in sync
      const response = await client.get(`/expenses/${expenseId}`);
      setExpense(response.data.data);
    } catch (error) {
      console.error("Ürün paylaştırma hatası:", error);
      // Rollback to original state
      setExpense(originalExpense);
      Alert.alert("Hata", "Paylaştırma kaydedilemedi.");
    } finally {
      setSavingSplit(false);
    }
  };

  // Furkan Kasalak – RabbitMQ Asenkron AI Fiyat Doğrulama (Polling)
  const pollVerificationStatus = useCallback(async (jobId) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 40; // 40 x 2sn = max 80 saniye
      
      verifyPollingRef.current = setInterval(async () => {
        attempts++;
        try {
          const response = await client.get(`/ai/verify-price/${jobId}`);
          const job = response.data.data;
          
          if (job.status === 'completed') {
            clearInterval(verifyPollingRef.current);
            verifyPollingRef.current = null;
            resolve(job.result);
          } else if (job.status === 'failed') {
            clearInterval(verifyPollingRef.current);
            verifyPollingRef.current = null;
            reject(new Error(job.error || 'Fiyat doğrulama başarısız oldu.'));
          } else if (attempts >= maxAttempts) {
            clearInterval(verifyPollingRef.current);
            verifyPollingRef.current = null;
            reject(new Error('Fiyat doğrulama zaman aşımına uğradı.'));
          }
        } catch (err) {
          clearInterval(verifyPollingRef.current);
          verifyPollingRef.current = null;
          reject(err);
        }
      }, 2000); // Her 2 saniyede bir sorgula
    });
  }, []);

  const handleVerifyPrice = async (item) => {
    setVerifying(true);
    try {
      // Furkan Kasalak – Asenkron: API 202 döner, jobId ile polling başlat
      const response = await client.post("/ai/verify-price", {
        items: [{ name: item.name, price: item.price }],
      });

      if (response.status === 202 && response.data.jobId) {
        // Polling ile sonuç bekle
        const data = await pollVerificationStatus(response.data.jobId);
        if (data.isAnomaly) {
          Alert.alert(
            "⚠️ Fiyat Anomalisi Tespit Edildi!",
            `Sebep: ${data.message}\n\nPiyasa Ortalaması: ₺${data.marketAverage}`,
          );
        } else {
          Alert.alert(
            "✅ Fiyat Normal",
            `Sebep: ${data.message}\n\nPiyasa Ortalaması: ₺${data.marketAverage}`,
          );
        }
      } else {
        // Eski format uyumluluğu
        const data = response.data.data;
        if (data.isAnomaly) {
          Alert.alert("⚠️ Fiyat Anomalisi!", `Sebep: ${data.message}\n\nPiyasa Ortalaması: ₺${data.marketAverage}`);
        } else {
          Alert.alert("✅ Fiyat Normal", `Sebep: ${data.message}\n\nPiyasa Ortalaması: ₺${data.marketAverage}`);
        }
      }
    } catch (e) {
      const errMsg = e?.message || "Yapay zeka şu an fiyat doğrulaması yapılamıyor.";
      Alert.alert("Hata", errMsg);
    } finally {
      setVerifying(false);
      if (verifyPollingRef.current) {
        clearInterval(verifyPollingRef.current);
        verifyPollingRef.current = null;
      }
    }
  };

  const pollCategorizationStatus = async (jobId) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        if (attempts > 30) {
          clearInterval(interval);
          reject(new Error("Zaman aşımı"));
          return;
        }

        try {
          const response = await client.get(`/ai/item-categorization/${jobId}`);
          const job = response.data.data;
          
          if (job.status === "completed") {
            clearInterval(interval);
            resolve(job.result.categories);
          } else if (job.status === "failed") {
            clearInterval(interval);
            reject(new Error(job.error || "İşlem başarısız oldu"));
          }
        } catch (error) {
          console.warn("Polling error:", error);
        }
      }, 1500);
    });
  };

  const handleCategorizeItems = async () => {
    if (!expense?.items || expense.items.length === 0) return;

    setCategorizing(true);
    try {
      const itemNames = expense.items.map((i) => i.name);
      const response = await client.post("/ai/item-categorization", {
        itemsList: itemNames,
      });

      const jobId = response.data.jobId;
      if (!jobId) {
        throw new Error("Job ID alınamadı.");
      }

      const categories = await pollCategorizationStatus(jobId);
      
      let resultMessage = "Yapay Zeka Kategorizasyon Sonucu:\n\n";
      categories.forEach((c) => {
        resultMessage += `• ${c.itemName}: ${c.category}\n`;
      });

      Alert.alert("🧠 Başarılı", resultMessage);
    } catch (e) {
      console.error(e);
      Alert.alert("Hata", "Kategorizasyon yapılamadı veya zaman aşımına uğradı.");
    } finally {
      setCategorizing(false);
    }
  };


  const renderItem = ({ item }) => {
    const validAssigned = (item.assignedUserIds || []).filter(u => u != null);
    const assignedCount = validAssigned.length;
    let assignedText = "Kimse seçilmedi";

    if (assignedCount === groupMembers.length && assignedCount > 0) {
      assignedText = "Herkes eşit paylaşıyor";
    } else if (assignedCount > 0) {
      const names = validAssigned.map((u) => u?.firstName || "?").join(", ");
      assignedText = names;
    }

    return (
      <View style={styles.itemCardContainer}>
        <TouchableOpacity
          style={styles.itemCard}
          activeOpacity={0.8}
          onPress={() => openSplitModal(item)}
        >
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>₺{item.price}</Text>
          </View>
          <View style={styles.assignedContainer}>
            <Ionicons
              name="people"
              size={16}
              color="#64748b"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.assignedText} numberOfLines={1}>
              {assignedText}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actionColumn}>
          <TouchableOpacity
            style={[
              styles.actionBtnIcon,
              { backgroundColor: "#e0e7ff", marginBottom: 8 },
            ]}
            onPress={() => handleVerifyPrice(item)}
          >
            <Ionicons name="hardware-chip" size={18} color="#4f46e5" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtnIcon, { backgroundColor: theme.mode === 'dark' ? theme.dangerBg : "#fee2e2" }]}
            onPress={async () => {
              if (!expense) return;

              // Keep original state in case of rollback
              const originalExpense = { ...expense };

              // Optimistic Update: Remove from local items list instantly
              const updatedItems = expense.items.filter((i) => i._id !== item._id);
              setExpense({ ...expense, items: updatedItems });

              try {
                await client.delete(`/expenses/${expenseId}/items/${item._id}`);
                
                // Quietly fetch actual details from server to keep in sync
                const response = await client.get(`/expenses/${expenseId}`);
                setExpense(response.data.data);
              } catch (e) {
                console.error("Ürün silme hatası:", e);
                // Rollback to original state
                setExpense(originalExpense);
                Alert.alert("Hata", "Ürün silinemedi.");
              }
            }}
          >
            <Ionicons name="trash" size={18} color={theme.danger} />
          </TouchableOpacity>

        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!expense) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.danger} />
        <Text style={styles.errorText}>Harcama bulunamadı.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <LinearGradient colors={["#4f46e5", "#3b82f6"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>{expense.title}</Text>
          <Text style={styles.subtitle}>
            Toplam: ₺{expense.totalAmount} • Ödeyen: {expense.paidById?.firstName || 'Bilinmeyen'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleDeleteExpense}
          style={styles.deleteExpenseBtn}
        >
          <Ionicons name="trash-outline" size={24} color="#f87171" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fiş Kalemleri</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={handleCategorizeItems}
              style={[
                styles.addItemBtn,
                { backgroundColor: "#6366f1", marginRight: 8 },
              ]}
            >
              <Ionicons
                name="sparkles"
                size={14}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.addItemBtnText}>Kategorize Et</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAddItemModalVisible(true)}
              style={styles.addItemBtn}
            >
              <Ionicons
                name="add"
                size={16}
                color="#fff"
                style={{ marginRight: 2 }}
              />
              <Text style={styles.addItemBtnText}>Ürün Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.helperNote}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#64748b"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.helperText}>
            Bir ürüne tıklayarak "kimlerin yediğini/ödeyeceğini" seçebilirsiniz.
          </Text>
        </View>

        <FlatList
          data={expense.items}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Add Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addItemModalVisible}
        onRequestClose={() => setAddItemModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { maxHeight: "60%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ürün Ekle</Text>
              <TouchableOpacity
                onPress={() => setAddItemModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ürün Adı"
              placeholderTextColor="#94a3b8"
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <TextInput
              style={styles.input}
              placeholder="Fiyat (₺)"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={newItemPrice}
              onChangeText={setNewItemPrice}
            />
            <TouchableOpacity activeOpacity={0.8} onPress={handleAddItem}>
              <LinearGradient
                colors={["#4f46e5", "#3b82f6"]}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>Ekle</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Split Modal */}
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
              <Text style={styles.modalTitle}>
                {selectedItem?.name} - Kim Ödeyecek?
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.membersList}>
              {groupMembers.map((member, index) => {
                const isGuest = !!member.guestName;
                const userObj = member.user || {};
                const userId = isGuest ? member._id : userObj._id || userObj;
                const isSelected = selectedUserIds.includes(userId);

                const displayName = isGuest
                  ? member.guestName
                  : `${userObj?.firstName || ''} ${userObj?.lastName || ''}`.trim() || 'Bilinmeyen';
                const initial = isGuest
                  ? member.guestName?.charAt(0) || 'M'
                  : userObj?.firstName
                    ? userObj.firstName.charAt(0)
                    : "U";

                return (
                  <TouchableOpacity
                    key={userId || index}
                    style={[
                      styles.memberRow,
                      isSelected && styles.memberRowSelected,
                    ]}
                    onPress={() => toggleUserSelection(userId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.memberInfo}>
                      <View
                        style={[
                          styles.avatarPlaceholder,
                          isSelected && styles.avatarPlaceholderSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.avatarText,
                            isSelected && { color: "#fff" },
                          ]}
                        >
                          {initial}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.memberName,
                          isSelected && styles.memberNameSelected,
                        ]}
                      >
                        {displayName} {isGuest && "(Misafir)"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveSplit}
              disabled={savingSplit}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                style={styles.saveButton}
              >
                {savingSplit ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Kaydet</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* AI Categorizing Overlay */}
      {categorizing && (
        <Modal transparent={true} animationType="fade" visible={categorizing}>
          <View style={styles.aiOverlayContainer}>
            <View style={styles.aiOverlayContent}>
              <ActivityIndicator size="large" color="#6366f1" style={{ marginBottom: 16 }} />
              <Text style={styles.aiOverlayText}>Akıllı kategorizasyon yapılıyor...</Text>
              <Text style={styles.aiOverlaySubtext}>Lütfen pencereyi kapatmayın.</Text>
            </View>
          </View>
        </Modal>
      )}

      {/* Furkan Kasalak – AI Fiyat Doğrulama Overlay */}
      {verifying && (
        <Modal transparent={true} animationType="fade" visible={verifying}>
          <View style={styles.aiOverlayContainer}>
            <View style={styles.aiOverlayContent}>
              <ActivityIndicator size="large" color="#4f46e5" style={{ marginBottom: 16 }} />
              <Text style={styles.aiOverlayText}>AI Fiyat Doğrulama Yapılıyor...</Text>
              <Text style={styles.aiOverlaySubtext}>Gemini güncel fiyat verilerini analiz ediyor.</Text>
            </View>
          </View>
        </Modal>
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
    padding: 32,
  },
  errorText: {
    fontSize: 20,
    color: theme.text,
    marginTop: 16,
    marginBottom: 24,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  backIcon: { marginRight: 16 },
  headerTextContainer: { flex: 1 },
  title: { color: "#fff", fontSize: 24, fontWeight: "800", letterSpacing: 0.5 },
  subtitle: { color: "#a7f3d0", fontSize: 16, marginTop: 4, fontWeight: "700" },
  deleteExpenseBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 12,
  },

  content: { flex: 1, padding: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: theme.text },
  helperNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.mode === 'dark' ? theme.card : "#e2e8f0",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: theme.mode === 'dark' ? 1 : 0,
    borderColor: theme.border,
  },
  helperText: { fontSize: 13, color: theme.textMuted, flex: 1, fontWeight: "500" },
  listContainer: { paddingBottom: 40 },

  itemCardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  itemCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: theme.mode === 'dark' ? "#000" : "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.mode === 'dark' ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: theme.mode === 'dark' ? 1 : 0,
    borderColor: theme.border,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemName: { fontSize: 16, fontWeight: "700", color: theme.text, flex: 1 },
  itemPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.danger,
    marginLeft: 10,
  },
  assignedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.mode === 'dark' ? theme.background : "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  assignedText: { fontSize: 13, color: theme.textMuted, fontWeight: "600" },

  actionColumn: { marginLeft: 12, justifyContent: "center" },
  actionBtnIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addItemBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "85%",
    borderWidth: theme.mode === 'dark' ? 1 : 0,
    borderColor: theme.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: theme.text, flex: 1 },
  closeBtn: {
    backgroundColor: theme.mode === 'dark' ? theme.background : "#f1f5f9",
    padding: 8,
    borderRadius: 20,
  },

  membersList: { marginBottom: 24 },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingHorizontal: 8,
  },
  memberRowSelected: {
    backgroundColor: theme.mode === 'dark' ? theme.successBg : "#f0fdf4",
    borderRadius: 12,
    borderBottomWidth: 0,
  },
  memberInfo: { flexDirection: "row", alignItems: "center" },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.mode === 'dark' ? theme.background : "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarPlaceholderSelected: { backgroundColor: theme.success },
  avatarText: { color: theme.textMuted, fontWeight: "bold", fontSize: 16 },
  memberName: { fontSize: 16, color: theme.text, fontWeight: "600" },
  memberNameSelected: { color: theme.success, fontWeight: "700" },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.border,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: { backgroundColor: theme.success, borderColor: theme.success },

  saveButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: theme.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  input: {
    backgroundColor: theme.inputBg,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: theme.text,
  },

  aiOverlayContainer: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  aiOverlayContent: {
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: theme.mode === 'dark' ? 1 : 0,
    borderColor: theme.border,
  },
  aiOverlayText: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.text,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  aiOverlaySubtext: {
    fontSize: 13,
    color: theme.textMuted,
    textAlign: "center",
  },
});

