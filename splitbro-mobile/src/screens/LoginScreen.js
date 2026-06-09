import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import client from "../api/client";
import { AuthContext } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "Lütfen e-posta ve şifrenizi girin.");
      return;
    }

    setLoading(true);
    try {
      const response = await client.post("/auth/login", { email, password });

      if (response.data && response.data.data && response.data.data.token) {
        await login(response.data.data.token, response.data.data._id);
      } else {
        Alert.alert("Hata", "Sunucudan geçersiz bir yanıt alındı.");
      }
    } catch (error) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message ||
        "Giriş yapılamadı. İnternet bağlantınızı ve bilgilerinizi kontrol edin.";
      Alert.alert("Giriş Başarısız", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#4f46e5", "#3b82f6"]}
        style={styles.topBackground}
      >
        <View style={styles.logoContainer}>
          <Ionicons name="wallet-outline" size={80} color="#fff" />
        </View>
      </LinearGradient>

      <View style={styles.formContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>SplitBro'ya{"\n"}Hoş Geldin! 👋</Text>
          <Text style={styles.subtitle}>
            Giriş yaparak harcamalarını yönetmeye başla.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#94a3b8"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="E-posta Adresi"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#94a3b8"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor="#94a3b8"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#94a3b8"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogin}
          disabled={loading}
          style={{ marginTop: 10 }}
        >
          <LinearGradient
            colors={["#4f46e5", "#3b82f6"]}
            style={styles.loginButton}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>



        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Hesabın yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Hemen Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  topBackground: {
    height: "35%",
    width: "100%",
    position: "absolute",
    top: 0,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  formContainer: {
    flex: 1,
    marginTop: "45%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  headerTextContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: "#0f172a",
  },
  eyeIcon: {
    padding: 10,
  },
  loginButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "700",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  registerText: {
    color: "#64748b",
    fontSize: 15,
  },
  registerLink: {
    color: "#4f46e5",
    fontSize: 15,
    fontWeight: "800",
  },
});
