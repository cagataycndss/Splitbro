import React, { useEffect, useState, useContext, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import client from "../api/client";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";


export default function GroupDetailScreen({ route, navigation }) {
  const { groupId } = route.params;
  const { theme, isDarkMode } = useContext(ThemeContext);
  const { userId } = useContext(AuthContext);
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paidById, setPaidById] = useState("");

  const [activeTab, setActiveTab] = useState("expenses");

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [creating, setCreating] = useState(false);

  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newGuestName, setNewGuestName] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  const [scanning, setScanning] = useState(false);
  // Gökdeniz Erten – Üye listesi cache göstergesi
  const [membersCached, setMembersCached] = useState(false);
  // Gökdeniz Erten – Fiş okuma polling referansı
  const scanPollingRef = useRef(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    fetchGroupDetails();

    const unsubscribe = navigation.addListener("focus", () => {
      // Quietly refresh the details when returning to this screen
      fetchGroupDetails();
    });

    return unsubscribe;
  }, [groupId, navigation]);


  useEffect(() => {
    if (activeTab === "settlements") {
      fetchDebts();
    }
  }, [activeTab]);

  const fetchGroupDetails = async () => {
    if (!group) {
      setLoading(true);
    }
    try {
      const response = await client.get(`/groups/${groupId}`);
      const data = response.data.data;
      setGroup(data.group);
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error("Grup detayları çekilirken hata:", error);
    } finally {
      setLoading(false);
    }
  };


  const fetchDebts = async () => {
    try {
      const response = await client.get(`/groups/${groupId}/calculate`);
      setDebts(response.data.data || []);
    } catch (error) {
      console.error("Borç hesaplama hatası:", error);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      Alert.alert("Hata", "Lütfen e-posta adresini girin.");
      return;
    }
    setAddingMember(true);
    try {
      await client.post(`/groups/${groupId}/members`, {
        email: newMemberEmail,
      });
      Alert.alert("Başarılı", "Üye gruba eklendi.");
      setNewMemberEmail("");
      fetchGroupDetails();
    } catch (error) {
      Alert.alert(
        "Hata",
        error.response?.data?.message || "Üye eklenemedi."
      );
    } finally {
      setAddingMember(false);
    }
  };

  const handleAddGuest = async () => {
    if (!newGuestName.trim()) {
      Alert.alert("Hata", "Lütfen misafir adını girin.");
      return;
    }
    setAddingMember(true);
    try {
      await client.post(`/groups/${groupId}/members/guest`, {
        guestName: newGuestName,
      });
      Alert.alert("Başarılı", "Misafir eklendi.");
      setNewGuestName("");
      fetchGroupDetails();
    } catch (error) {
      Alert.alert("Hata", error.response?.data?.message || "Misafir eklenemedi.");
    } finally {
      setAddingMember(false);
    }
  };

  const handleAddExpense = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert("Hata", "Lütfen harcama adını ve tutarı girin.");
      return;
    }

    const allMemberIds = group.members.map((m) => m.user?._id || m.user);

    setCreating(true);
    try {
      await client.post(`/groups/${groupId}/expenses`, {
        title,
        totalAmount: Number(amount),
        currency: "TRY",
        assignedUserIds: allMemberIds,
        paidById: paidById || userId,
      });

      setModalVisible(false);
      setTitle("");
      setAmount("");
      setPaidById("");
      fetchGroupDetails();
    } catch (error) {
      Alert.alert("Hata", "Harcama eklenemedi.");
    } finally {
      setCreating(false);
    }
  };


  const handleScanReceipt = () => {
    setActionModalVisible(false);
    
    setTimeout(() => {
      Alert.alert(
        "Fiş Yükle",
        "Fişin fotoğrafını nasıl eklemek istersin?",
        [
          {
            text: "Kamera ile Çek",
            onPress: async () => {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== "granted") {
                Alert.alert("İzin Reddedildi", "Kamera izni olmadan fiş tarayamazsınız.");
                return;
              }
              try {
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ['images'],
                  quality: 0.2,
                });
                if (!result.canceled && result.assets && result.assets.length > 0) {
                  uploadReceipt(result.assets[0].uri);
                }
              } catch (e) {
                console.log(e);
              }
            }
          },
          {
            text: "Galeriden Seç",
            onPress: async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== "granted") {
                Alert.alert("İzin Reddedildi", "Galeri izni olmadan fiş seçemezsiniz.");
                return;
              }
              try {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ['images'],
                  quality: 0.2,
                });
                if (!result.canceled && result.assets && result.assets.length > 0) {
                  uploadReceipt(result.assets[0].uri);
                }
              } catch (e) {
                console.log(e);
              }
            }
          },
          { text: "İptal", style: "cancel" }
        ]
      );
    }, 500);
  };

  // Gökdeniz Erten – RabbitMQ Asenkron Fiş Okuma (Polling)
  const pollScanStatus = useCallback(async (jobId) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 60; // 60 x 2sn = max 2 dakika
      
      scanPollingRef.current = setInterval(async () => {
        attempts++;
        try {
          const response = await client.get(`/groups/${groupId}/expenses/scan/${jobId}`);
          const job = response.data.data;
          
          if (job.status === 'completed') {
            clearInterval(scanPollingRef.current);
            scanPollingRef.current = null;
            resolve(job);
          } else if (job.status === 'failed') {
            clearInterval(scanPollingRef.current);
            scanPollingRef.current = null;
            reject(new Error(job.error || 'Fiş okuma başarısız oldu.'));
          } else if (attempts >= maxAttempts) {
            clearInterval(scanPollingRef.current);
            scanPollingRef.current = null;
            reject(new Error('Fiş okuma zaman aşımına uğradı.'));
          }
        } catch (err) {
          clearInterval(scanPollingRef.current);
          scanPollingRef.current = null;
          reject(err);
        }
      }, 2000); // Her 2 saniyede bir sorgula
    });
  }, [groupId]);

  const uploadReceipt = async (imageUri) => {
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append("receipt", {
        uri: imageUri,
        name: "receipt.jpg",
        type: "image/jpeg",
      });

      // Gökdeniz Erten – Asenkron: API 202 döner, jobId ile polling başlat
      const response = await client.post(`/groups/${groupId}/expenses/scan`, formData);
      
      if (response.status === 202 && response.data.jobId) {
        // Polling ile sonuç bekle
        const completedJob = await pollScanStatus(response.data.jobId);
        Alert.alert(
          "Başarılı!", 
          `Fiş okundu: ${completedJob.result?.title || 'Gider'} - ₺${completedJob.result?.totalAmount || '?'}`
        );
      } else {
        // Eski format uyumluluğu (eğer senkron dönüş gelirse)
        Alert.alert("Başarılı!", response.data.message || "Fiş okundu.");
      }
      fetchGroupDetails();
    } catch (error) {
      const errMsg = error?.message || "Fiş okunamadı.";
      Alert.alert("Okuma Hatası", errMsg);
    } finally {
      setScanning(false);
      if (scanPollingRef.current) {
        clearInterval(scanPollingRef.current);
        scanPollingRef.current = null;
      }
    }
  };

  const handleSettleDebt = (debt) => {
    Alert.alert(
      "Borcu Kapat",
      `Bu borcun ödendiğini onaylıyor musunuz? (₺${debt.amount})`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Onayla",
          onPress: async () => {
            try {
              await client.post(`/groups/${groupId}/settle`, {
                paidBy: debt.from,
                paidTo: debt.to,
                amount: debt.amount,
                currency: debt.currency,
              });
              Alert.alert("Başarılı", "Borç kapatıldı.");
              fetchDebts();
              if (activeTab === "expenses") fetchGroupDetails();
            } catch (error) {
              Alert.alert("Hata", "Borç kapatılamadı.");
            }
          },
        },
      ]
    );
  };

  const renderExpenseItem = ({ item }) => {
    const isSettlement = item.isSettlement;
    const isAI = item.items && item.items[0] && item.items[0].category === "AI Taraması";
    
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={isSettlement ? 1 : 0.8}
        onPress={() =>
          !isSettlement &&
          navigation.navigate("ExpenseDetail", {
            expenseId: item._id,
            groupMembers: group?.members || [],
          })
        }
        disabled={isSettlement}
      >

        <View style={[styles.iconContainer, isSettlement && { backgroundColor: theme.mode === 'dark' ? theme.successBg : "#d1fae5" }]}>
          {isSettlement ? (
            <Ionicons name="card" size={24} color={theme.success} />
          ) : isAI ? (
            <Ionicons name="hardware-chip" size={24} color={theme.primary} />
          ) : (
            <Ionicons name="cart" size={24} color={theme.primary} />
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>
            {isSettlement ? "Ödeyen:" : "Ekleyen:"}{" "}
            <Text style={{ fontWeight: "600", color: theme.textMuted }}>
              {item.paidById?.firstName} {item.paidById?.lastName}
            </Text>
          </Text>
        </View>
        <Text style={[styles.amount, isSettlement && { color: theme.success }]}>
          ₺{item.totalAmount}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDebtItem = ({ item }) => {
    const members = group?.members || [];
    const debtor = members.find((m) => {
      const id = m.user?._id?.toString?.() || m.user?.toString?.() || m._id?.toString?.();
      return id === item.from?.toString?.();
    });
    const creditor = members.find((m) => {
      const id = m.user?._id?.toString?.() || m.user?.toString?.() || m._id?.toString?.();
      return id === item.to?.toString?.();
    });


    const dName = debtor ? (debtor.guestName || debtor.user?.firstName || "Bilinmeyen") : "Bilinmeyen";
    const cName = creditor ? (creditor.guestName || creditor.user?.firstName || "Bilinmeyen") : "Bilinmeyen";

    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <Text style={styles.debtorText}>{dName}</Text>
            <Ionicons name="arrow-forward" size={14} color={theme.textMuted} style={{ marginHorizontal: 6 }} />
            <Text style={styles.creditorText}>{cName}</Text>
          </View>
          <Text style={styles.cardSubtitle}>borçlu</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.amount}>₺{item.amount}</Text>
          <TouchableOpacity style={styles.payBtn} onPress={() => handleSettleDebt(item)}>
            <Text style={styles.payBtnText}>Öde</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const displayGroupName = group?.name || route.params?.groupName || "Yükleniyor...";

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      {/* Dynamic Background Top Element to prevent all-white feel */}
      <View style={styles.topBackgroundDecoration} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{displayGroupName}</Text>
        {group ? (
          <TouchableOpacity onPress={() => setMembersModalVisible(true)} style={styles.headerIcon}>
            <Ionicons name="settings" size={26} color={theme.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 48 }} /> // empty spacer when loading
        )}
      </View>


      {/* Modern Pill Tabs */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "expenses" && styles.activeTab]}
            onPress={() => { setActiveTab("expenses"); fetchGroupDetails(); }}
          >
            <Ionicons name="receipt-outline" size={18} color={activeTab === "expenses" ? theme.primary : theme.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, activeTab === "expenses" && styles.activeTabText]}>
              Harcamalar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "settlements" && styles.activeTab]}
            onPress={() => setActiveTab("settlements")}
          >
            <Ionicons name="wallet-outline" size={18} color={activeTab === "settlements" ? theme.primary : theme.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, activeTab === "settlements" && styles.activeTabText]}>
              Hesaplaşma
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {!group && loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : activeTab === "expenses" ? (
          expenses.length === 0 ? (

            <View style={styles.emptyContainer}>
              <View style={[styles.iconCircleSuccess, { backgroundColor: theme.mode === 'dark' ? theme.primaryLight : '#f5f3ff' }]}>
                <Ionicons name="receipt" size={40} color={theme.primary} />
              </View>
              <Text style={styles.emptyTitle}>Harcama Bulunamadı</Text>
              <Text style={styles.emptyDesc}>İlk harcamayı ekleyerek hesapları tutmaya başlayın.</Text>
            </View>
          ) : (
            <FlatList
              data={expenses}
              keyExtractor={(item) => item._id}
              renderItem={renderExpenseItem}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : debts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.iconCircleSuccess}>
              <Ionicons name="checkmark-done" size={40} color={theme.success} />
            </View>
            <Text style={styles.emptyTitle}>Her Şey Tamam!</Text>
            <Text style={styles.emptyDesc}>Kimsenin kimseye borcu kalmadı.</Text>
          </View>
        ) : (
          <FlatList
            data={debts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderDebtItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Sticky Bottom Button for Expenses */}
      {group && activeTab === "expenses" && (
        <View style={styles.stickyFooter}>
          <TouchableOpacity style={styles.mainActionBtn} onPress={() => setActionModalVisible(true)}>
            <Ionicons name="add-circle" size={28} color="#fff" />
            <Text style={styles.mainActionText}>Yeni Harcama Ekle</Text>
          </TouchableOpacity>
        </View>
      )}


      {/* Action Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={actionModalVisible}
        onRequestClose={() => setActionModalVisible(false)}
      >
        <TouchableOpacity style={styles.actionOverlay} activeOpacity={1} onPress={() => setActionModalVisible(false)}>
          <View style={styles.actionSheet}>
            <Text style={styles.actionSheetTitle}>Ne eklemek istersin?</Text>
            <TouchableOpacity 
              style={styles.actionSheetItem} 
              onPress={() => { setActionModalVisible(false); setTimeout(() => setModalVisible(true), 300); }}
            >
              <View style={[styles.actionIconBg, { backgroundColor: theme.mode === 'dark' ? theme.primaryLight : '#f5f3ff' }]}>
                <Ionicons name="create" size={24} color={theme.primary} />
              </View>
              <View>
                <Text style={styles.actionSheetText}>Manuel Harcama Gir</Text>
                <Text style={styles.actionSheetSubText}>Kendin elle tutar yaz</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionSheetItem} onPress={handleScanReceipt}>
              <View style={[styles.actionIconBg, { backgroundColor: theme.mode === 'dark' ? '#1e3a8a' : '#eff6ff' }]}>
                <Ionicons name="scan" size={24} color={theme.mode === 'dark' ? '#60a5fa' : '#3b82f6'} />
              </View>
              <View>
                <Text style={styles.actionSheetText}>Fiş/Fatura Tara</Text>
                <Text style={styles.actionSheetSubText}>Yapay zeka ile anında hesapla</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={membersModalVisible}
        onRequestClose={() => setMembersModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContentPremium}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitlePremium}>Grup Ayarları</Text>
                <Text style={styles.modalSubtitle}>Grubu ve üyeleri buradan yönetebilirsin</Text>
              </View>
              <TouchableOpacity onPress={() => setMembersModalVisible(false)} style={styles.closeBtnPremium}>
                <Ionicons name="close" size={26} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="text" size={20} color={theme.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionHeadingPremium}>Grup İsmi</Text>
              </View>
              <View style={styles.premiumInputContainer}>
                <TextInput
                  style={styles.premiumInput}
                  placeholder="Yeni İsim"
                  placeholderTextColor={theme.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />
                <TouchableOpacity
                  style={styles.premiumBtn}
                  onPress={async () => {
                    if (!title.trim()) return;
                    await client.put(`/groups/${groupId}`, { name: title });
                    setTitle("");
                    fetchGroupDetails();
                  }}
                >
                  <Text style={styles.premiumBtnText}>Güncelle</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionHeaderRow}>
                <Ionicons name="people" size={20} color={theme.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionHeadingPremium}>Üyeler ({group?.members?.length || 0})</Text>
                {/* Gökdeniz Erten – Redis cache göstergesi */}
                {membersCached && (
                  <View style={{ marginLeft: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.mode === 'dark' ? '#1e3a5f' : '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                    <Text style={{ fontSize: 10, color: theme.mode === 'dark' ? '#60a5fa' : '#3b82f6' }}>⚡ Cache</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.membersContainerPremium}>
                {group?.members?.map((member, index) => {
                  // Kayıtlı üye: user._id, Misafir: member._id (subdocument)
                  const memberId = member.user?._id || member.user || member._id;

                  return (
                    <View key={index} style={styles.memberRowPremium}>
                      <View style={styles.memberAvatarPremium}>
                        <Ionicons name="person" size={20} color={theme.primary} />
                      </View>
                      <Text style={styles.memberNamePremium}>
                        {member.guestName ? `${member.guestName} (Misafir)` : `${member.user?.firstName} ${member.user?.lastName}`}
                      </Text>
                      <TouchableOpacity
                        style={styles.trashBtnPremium}
                        onPress={() => {
                          const memberName = member.guestName || `${member.user?.firstName || ''} ${member.user?.lastName || ''}`.trim();
                          Alert.alert(
                            "Üye Çıkar",
                            `${memberName} grubunuzdan çıkarılsın mı?`,
                            [
                              { text: "İptal", style: "cancel" },
                              {
                                text: "Çıkar",
                                style: "destructive",
                                onPress: async () => {
                                  try {
                                    await client.delete(`/groups/${groupId}/members/${memberId}`);
                                    fetchGroupDetails();
                                  } catch (err) {
                                    Alert.alert("Hata", err.response?.data?.message || "Üye çıkarılamadı.");
                                  }
                                },
                              },
                            ]
                          );
                        }}
                      >
                        <Ionicons name="trash" size={22} color={theme.danger} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              <View style={styles.sectionHeaderRow}>
                <Ionicons name="person-add" size={20} color={theme.mode === 'dark' ? '#60a5fa' : '#3b82f6'} style={{ marginRight: 8 }} />
                <Text style={styles.sectionHeadingPremium}>Kayıtlı Üye Ekle</Text>
              </View>
              <View style={styles.premiumInputContainer}>
                <Ionicons name="mail-outline" size={20} color={theme.textMuted} style={{ paddingLeft: 16 }} />
                <TextInput 
                  style={[styles.premiumInput, { paddingLeft: 10 }]} 
                  placeholder="E-Posta Adresi" 
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none" 
                  value={newMemberEmail} 
                  onChangeText={setNewMemberEmail} 
                />
                <TouchableOpacity style={[styles.premiumBtn, { backgroundColor: theme.mode === 'dark' ? '#3b82f6' : '#3b82f6' }]} onPress={handleAddMember}>
                  <Text style={styles.premiumBtnText}>Ekle</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionHeaderRow}>
                <Ionicons name="person-add-outline" size={20} color={theme.success} style={{ marginRight: 8 }} />
                <Text style={styles.sectionHeadingPremium}>Uygulaması Olmayan Misafir</Text>
              </View>
              <View style={styles.premiumInputContainer}>
                <Ionicons name="text-outline" size={20} color={theme.textMuted} style={{ paddingLeft: 16 }} />
                <TextInput 
                  style={[styles.premiumInput, { paddingLeft: 10 }]} 
                  placeholder="Misafir Adı" 
                  placeholderTextColor={theme.textMuted}
                  value={newGuestName} 
                  onChangeText={setNewGuestName} 
                />
                <TouchableOpacity style={[styles.premiumBtn, { backgroundColor: theme.success }]} onPress={handleAddGuest}>
                  <Text style={styles.premiumBtnText}>Ekle</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.dangerBtnPremium} onPress={() => {
                Alert.alert(
                  "Grubu Sil",
                  `"${group.name}" grubunu ve tüm harcamalarını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`,
                  [
                    { text: "İptal", style: "cancel" },
                    {
                      text: "Sil",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await client.delete(`/groups/${groupId}`);
                          navigation.goBack();
                        } catch (err) {
                          Alert.alert("Hata", err.response?.data?.message || "Grup silinemedi.");
                        }
                      },
                    },
                  ]
                );
              }}>
                <Ionicons name="warning" size={24} color={theme.danger} style={{ marginRight: 10 }} />
                <Text style={styles.dangerBtnTextPremium}>Grubu Kalıcı Olarak Sil</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Manual Expense Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContentPremium}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitlePremium}>Harcama Ekle</Text>
                <Text style={styles.modalSubtitle}>Hesabı eşit bölüştür</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtnPremium}>
                <Ionicons name="close" size={26} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.expenseInputContainer}>
              <Ionicons name="pricetag-outline" size={24} color={theme.primary} style={{ marginRight: 12 }} />
              <TextInput style={styles.expenseInput} placeholder="Neye harcandı? (Örn: Akşam Yemeği)" placeholderTextColor={theme.textMuted} value={title} onChangeText={setTitle} />
            </View>
            
            <View style={styles.expenseInputContainer}>
              <Text style={{ fontSize: 24, color: theme.primary, fontWeight: 'bold', marginRight: 12 }}>₺</Text>
              <TextInput style={styles.expenseInput} placeholder="Tutar" placeholderTextColor={theme.textMuted} keyboardType="numeric" value={amount} onChangeText={setAmount} />
            </View>

            {/* Payer Selector */}
            <Text style={[styles.sectionHeadingPremium, { marginTop: 12, marginBottom: 8, fontSize: 16 }]}>Ödemeyi Kim Yaptı?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16, maxHeight: 80 }} contentContainerStyle={{ paddingVertical: 4 }}>
              {group?.members?.map((member, index) => {
                const isGuest = !!member.guestName;
                const userObj = member.user || {};
                const mId = isGuest ? member._id : userObj._id || userObj;
                const isSelected = paidById === mId || (!paidById && mId === userId);

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
                    key={mId || index}
                    style={[
                      styles.payerCard,
                      isSelected && styles.payerCardSelected
                    ]}
                    onPress={() => setPaidById(mId)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.payerAvatar, isSelected && styles.payerAvatarSelected]}>
                      <Text style={[styles.payerAvatarText, isSelected && { color: '#fff' }]}>{initial}</Text>
                    </View>
                    <Text style={[styles.payerName, isSelected && styles.payerNameSelected]} numberOfLines={1}>
                      {displayName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={styles.submitBtnPremium} onPress={handleAddExpense} disabled={creating}>
              {creating ? <ActivityIndicator color="#fff" /> : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnTextPremium}>Kaydet ve Bölüştür</Text>
                </View>
              )}
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Loading Overlay */}
      {scanning && (
        <View style={styles.scanningOverlay}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: "#fff", marginTop: 16, fontWeight: "700", fontSize: 18 }}>Fiş Okunuyor...</Text>
          <Text style={{ color: "#cbd5e1", marginTop: 8 }}>Yapay zeka analiz ediyor</Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background },
  container: { flex: 1, backgroundColor: theme.background, position: 'relative' },
  
  topBackgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: theme.card,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: theme.mode === 'dark' ? "#000" : theme.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: theme.mode === 'dark' ? 0.3 : 0.03,
    shadowRadius: 20,
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerIcon: { padding: 10, backgroundColor: theme.mode === 'dark' ? '#334155' : '#f1f5f9', borderRadius: 14 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: theme.text, flex: 1, textAlign: "center" },

  tabWrapper: { paddingBottom: 16 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: theme.mode === 'dark' ? '#334155' : '#f1f5f9',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 6,
  },
  tab: { flex: 1, flexDirection: 'row', paddingVertical: 12, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  activeTab: { backgroundColor: theme.card, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  tabText: { fontSize: 15, color: theme.textMuted, fontWeight: "700" },
  activeTabText: { color: theme.primary },

  content: { flex: 1 },
  list: { padding: 16, paddingBottom: 120 },

  card: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: theme.mode === 'dark' ? "#000" : "#94a3b8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: theme.mode === 'dark' ? 0.4 : 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.border,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: theme.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: "800", color: theme.text, marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: theme.textMuted, fontWeight: "500" },
  amount: { fontSize: 20, fontWeight: "900", color: theme.text },

  debtorText: { fontSize: 16, fontWeight: "800", color: theme.danger },
  creditorText: { fontSize: 16, fontWeight: "800", color: theme.success },
  payBtn: { backgroundColor: theme.success, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12, marginTop: 8 },
  payBtnText: { color: "#ffffff", fontWeight: "800", fontSize: 14 },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40, marginTop: 20 },
  iconCircleSuccess: { width: 88, height: 88, borderRadius: 44, backgroundColor: theme.mode === 'dark' ? theme.successBg : "#d1fae5", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: theme.text, marginBottom: 10 },
  emptyDesc: { fontSize: 15, color: theme.textMuted, textAlign: "center", lineHeight: 22, fontWeight: "500" },

  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    backgroundColor: theme.mode === 'dark' ? "rgba(15, 23, 42, 0.85)" : "rgba(248, 250, 252, 0.85)",
  },
  mainActionBtn: {
    backgroundColor: theme.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  mainActionText: { color: "#fff", fontSize: 18, fontWeight: "800", marginLeft: 10 },

  actionOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)", justifyContent: "flex-end" },
  actionSheet: { backgroundColor: theme.card, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === "ios" ? 40 : 24 },
  actionSheetTitle: { fontSize: 20, fontWeight: "800", color: theme.text, marginBottom: 20 },
  actionSheetItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, marginBottom: 12, backgroundColor: theme.inputBg, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.border },
  actionIconBg: { width: 52, height: 52, borderRadius: 18, justifyContent: "center", alignItems: "center", marginRight: 16 },
  actionSheetText: { fontSize: 17, fontWeight: "700", color: theme.text },
  actionSheetSubText: { fontSize: 13, color: theme.textMuted, marginTop: 4, fontWeight: "500" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)", justifyContent: "flex-end" },
  modalContentPremium: { backgroundColor: theme.card, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, paddingBottom: Platform.OS === "ios" ? 40 : 20, maxHeight: "90%", flexShrink: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitlePremium: { fontSize: 24, fontWeight: "900", color: theme.text, marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: theme.textMuted, fontWeight: "500" },
  closeBtnPremium: { backgroundColor: theme.background, width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  sectionHeadingPremium: { fontSize: 16, fontWeight: "800", color: theme.text },
  
  premiumInputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: theme.inputBg, borderRadius: 14, borderWidth: 1, borderColor: theme.border, height: 50, overflow: 'hidden' },
  premiumInput: { flex: 1, paddingHorizontal: 16, fontSize: 15, color: theme.text, fontWeight: "500", height: 50 },
  premiumBtn: { backgroundColor: theme.primary, justifyContent: "center", alignItems: 'center', paddingHorizontal: 20, height: '100%' },
  premiumBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  
  membersContainerPremium: { backgroundColor: theme.background, borderRadius: 16, padding: 6, borderWidth: 1, borderColor: theme.border },
  memberRowPremium: { flexDirection: "row", alignItems: "center", backgroundColor: theme.card, padding: 12, borderRadius: 12, marginBottom: 6, shadowColor: theme.mode === 'dark' ? "#000" : "#94a3b8", shadowOffset: { width: 0, height: 2 }, shadowOpacity: theme.mode === 'dark' ? 0.3 : 0.05, shadowRadius: 4, elevation: 1 },
  memberAvatarPremium: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.primaryLight, justifyContent: "center", alignItems: "center", marginRight: 12 },
  memberNamePremium: { flex: 1, fontSize: 15, fontWeight: "700", color: theme.text },
  trashBtnPremium: { padding: 6, backgroundColor: theme.dangerBg, borderRadius: 10 },
  
  dangerBtnPremium: { flexDirection: 'row', backgroundColor: theme.dangerBg, padding: 16, borderRadius: 14, alignItems: "center", justifyContent: 'center', marginTop: 24 },
  dangerBtnTextPremium: { color: theme.danger, fontWeight: "800", fontSize: 16 },

  expenseInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: 14, paddingHorizontal: 16, marginBottom: 12, height: 54 },
  expenseInput: { flex: 1, fontSize: 16, color: theme.text, fontWeight: "600", height: 54 },
  submitBtnPremium: { backgroundColor: theme.primary, padding: 16, borderRadius: 14, alignItems: "center", marginTop: 8, shadowColor: theme.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  submitBtnTextPremium: { color: "#fff", fontSize: 17, fontWeight: "800" },

  scanningOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15, 23, 42, 0.85)", justifyContent: "center", alignItems: "center", zIndex: 999 },

  payerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.border,
    height: 48,
  },
  payerCardSelected: {
    backgroundColor: theme.mode === 'dark' ? theme.primaryLight : "#f5f3ff",
    borderColor: theme.primary,
  },
  payerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.mode === 'dark' ? theme.background : "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  payerAvatarSelected: {
    backgroundColor: theme.primary,
  },
  payerAvatarText: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.textMuted,
  },
  payerName: {
    fontSize: 14,
    color: theme.text,
    fontWeight: "600",
    maxWidth: 100,
  },
  payerNameSelected: {
    color: theme.primary,
    fontWeight: "700",
  },
});

