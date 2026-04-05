# Furkan Kasalak'ın Web Frontend Görevleri
**Front-end Test Videosu:** [Test Videosu](https://youtu.be/brBpnTUg8sg)

---

## 1. Kullanıcı Kaydı (Registration)
- **API Metodu:** `POST /auth/register`
- **Açıklama:** Yeni kullanıcıların sisteme güvenli bir şekilde dahil edilmesini sağlar.
- **Teknik Detaylar:**
  - Request Body: `email`, `password`, `firstName`, `lastName`
  - Şifrelerin **Bcrypt** algoritması ile hash'lenerek saklanması.
  - Her kullanıcı için benzersiz bir **UUID** (userId) oluşturulması.
- **Validasyon & Güvenlik:**
  - Email format doğrulaması (Regex).
  - Şifre karmaşıklığı kontrolü (Minimum 8 karakter).
  - Veritabanında mükerrer (duplicate) email kontrolü.
- **Veritabanı:** `Users` tablosuna yeni kayıt eklenmesi.

## 2. Kullanıcı Girişi (Authentication)
- **API Metodu:** `POST /auth/login`
- **Açıklama:** Kayıtlı kullanıcıların kimlik doğrulaması yaparak oturum açmasını sağlar.
- **Teknik Detaylar:**
  - Request Body: `email`, `password`
  - Başarılı eşleşme durumunda **JWT (JSON Web Token)** üretimi ve döndürülmesi.
  - Token içeriğinde `userId` bilgisinin şifrelenmiş olarak tutulması.
- **Güvenlik:**
  - Hatalı giriş denemelerinde genel hata mesajı kullanımı ("Giriş başarısız").
  - Token expiration (süre aşımı) yönetimi.

## 3. Şifre Değiştirme
- **API Metodu:** `PUT /users/{userId}/change-password`
- **Açıklama:** Mevcut kullanıcının şifresini güvenli bir şekilde güncellemesini sağlar.
- **Teknik Detaylar:**
  - Request Body: `oldPassword`, `newPassword`
  - İşlem öncesi mevcut şifrenin veritabanından doğrulanması.
- **Güvenlik:**
  - JWT üzerinden gelen `userId` ile URL'deki `userId` eşleşme kontrolü (Authorization).
  - Yeni şifrenin eskisiyle aynı olmaması kontrolü.

## 4. Profil Bilgilerini Görüntüleme
- **API Metodu:** `GET /users/{userId}/profile`
- **Açıklama:** Giriş yapmış kullanıcının kişisel profil detaylarını getirir.
- **Teknik Detaylar:**
  - Veritabanından `firstName`, `lastName`, `email` ve `avatarUrl` bilgilerinin çekilmesi.
  - Şifre hash bilgisinin response içerisinde kesinlikle yer almaması (Data filtering).
- **Güvenlik:** Sadece yetkili kullanıcının kendi verisine erişimini sağlayan Middleware.

## 5. Hesap Silme
- **API Metodu:** `DELETE /users/{userId}/account`
- **Açıklama:** Kullanıcının hesabını ve tüm kişisel verilerini kalıcı olarak sistemden kaldırır.
- **Teknik Detaylar:**
  - **Soft Delete** veya **Hard Delete** stratejisinin uygulanması.
  - Kullanıcıya bağlı ilişkili verilerin (grup üyelikleri vb.) tutarlılık (integrity) kontrolü.
- **Veritabanı:** `Users` tablosundan kaydın silinmesi.

## 6. Profil Resmi Ekleme (Avatar Upload)
- **API Metodu:** `POST /users/{userId}/avatar`
- **Açıklama:** Kullanıcının profil görselini sisteme yüklemesini sağlar.
- **Teknik Detaylar:**
  - **Multer** kütüphanesi ile dosya işleme.
  - Dosyanın bulut depolama (AWS S3 / Cloudinary) veya yerel sunucuya yüklenmesi.
  - Veritabanındaki `avatarUrl` alanının güncellenmesi.
- **Validasyon:**
  - Dosya tipi kontrolü (Sadece .jpg, .png, .jpeg).
  - Dosya boyutu sınırı (Örn: Max 2MB).

## 7. Kullanıcının Gruplarını Listeleme
- **API Metodu:** `GET /users/{userId}/groups`
- **Açıklama:** Kullanıcının dahil olduğu veya yönettiği tüm grupları getirir.
- **Teknik Detaylar:**
  - `UserGroups` (pivot) tablosu üzerinden `Groups` tablosuna JOIN sorgusu atılması.
  - Dönen listede grup adı, üye sayısı ve rol bilgisi yer almalıdır.
- **Performans:** Gerekirse büyük veri setleri için basit pagination (sayfalama) desteği.

## 8. AI – Anomali Tespiti & Fiyat Doğrulama
- **API Metodu:** `POST /ai/verify-price`
- **Açıklama:** Girilen harcama verilerindeki anormallikleri tespit eder ve piyasa verilerine göre doğrular.
- **AI Entegrasyonu:**
  - Gelen `price` ve `itemName` verisinin AI modeline (Python microservice veya model scripti) gönderilmesi.
  - Anomali skoru hesaplanması (Örn: Ortalama fiyatın %500 üstündeki girişler).
- **Teknik Detaylar:**
  - Request Body: `itemName`, `price`, `category`
  - Response: `{ "isAnomaly": boolean, "suggestion": string, "confidenceScore": float }`
- **Kullanım Amacı:** Hatalı veya şişirilmiş fiyat girişlerini tespit ederek güvenilirliği artırmak.