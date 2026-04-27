# Gökdeniz Erten'in REST API Metotları

**API Test Videosu:** [Test Videosu](https://youtu.be/MROJCiomrM4)

## 1. Profil Bilgilerini Güncelleme
- **Endpoint:** `PUT /users/{userId}`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si
- **Request Body:** 
  ```json
  {
    "firstName": "Ali",
    "lastName": "Duran",
    "phone": "+905535485215"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Profil bilgileri başarıyla güncellendi

## 2. Grup Oluşturma
- **Endpoint:** `POST /groups`
- **Request Body:** 
  ```json
  {
    "name": "Ekip",
    "description": "Ali"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Grup başarıyla oluşturuldu

## 3. Gruba Üye Ekleme
- **Endpoint:** `POST /groups/{groupId}/members`
- **Path Parameters:** 
  - `groupId` (string, required) - Grup ID'si
- **Request Body:** 
  ```json
  {
    "userId": "69d26850a6fdb7a3f35d1ce5",
    "email": "akasap@gmail.com"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Üye gruba başarıyla eklendi

## 4. Grup Üyelerini Listeleme
- **Endpoint:** `GET /groups/{groupId}/members`
- **Path Parameters:** 
  - `groupId` (string, required) - Grup ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Grup üyeleri başarıyla listelendi

## 5. Gruptan Üye Çıkarma
- **Endpoint:** `DELETE /groups/{groupId}/members/{userId}`
- **Path Parameters:** 
  - `groupId` (string, required) - Grup ID'si
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `204 No Content` - Üye gruptan başarıyla çıkarıldı

## 6. Profil Resmi Güncelleme
- **Endpoint:** `PUT /users/{userId}/avatar`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si
- **Request Body:** form-data ile "avatar" key'ine dosya (file) eklenecek
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Profil resmi başarıyla güncellendi

## 7. Yapay Zeka (AI) Destekli Fiş Okuma ve Otomatik Gider Ekleme
- **Endpoint:** `POST /groups/{groupId}/expenses/scan`
- **Path Parameters:** 
  - `groupId` (string, required) - Grup ID'si
- **Request Body:** form-data ile "receipt" key'ine dosya (file) eklenecek
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Fiş başarıyla okundu, kalem kalem ürün ayrıştırılarak gider eklendi

## 8. Manuel Gider Ekleme
- **Endpoint:** `POST /groups/{groupId}/expenses`
- **Path Parameters:** 
  - `groupId` (string, required) - Grup ID'si
- **Request Body:** 
  ```json
  {
    "title": "Akşam Yemeği",
    "totalAmount": 450.00,
    "currency": "TRY",
    "paidById": "69d16c24e390f5da31e7890b"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Gider başarıyla manuel olarak eklendi
- **Not:** `currency` alanı opsiyoneldir. Desteklenen değerler: `TRY`, `USD`, `EUR`, `GBP`.

## 9. Google ile Sosyal Giriş (OAuth 2.0)
- **Endpoint:** `POST /auth/google`
- **Request Body:** 
  ```json
  {
    "idToken": "eyJhbGciOiJSUzI1NiIs..."
  }
  ```
- **Response:** `200 OK` - Google ile giriş başarılı
- **Not:** Google'dan alınan `idToken` doğrulanır; kullanıcı yoksa otomatik hesap açılır.

## 10. Gruba Misafir (Kayıtsız) Üye Ekleme
- **Endpoint:** `POST /groups/{groupId}/members/guest`
- **Path Parameters:** 
  - `groupId` (string, required) - Grup ID'si
- **Request Body:** 
  ```json
  {
    "guestName": "Ayşe Yılmaz"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Misafir üye başarıyla eklendi

## 11. Grup Borç Hesaplaşması
- **Endpoint:** `GET /groups/{groupId}/calculate`
- **Path Parameters:** 
  - `groupId` (string, required) - Grup ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Borçlar para birimine göre ayrılarak hesaplandı

## 12. Borç Kapatma / Ödeşme
- **Endpoint:** `POST /groups/{groupId}/settle`
- **Path Parameters:** 
  - `groupId` (string, required) - Grup ID'si
- **Request Body:** 
  ```json
  {
    "paidBy": "userId1",
    "paidTo": "userId2",
    "amount": 125.50,
    "currency": "TRY"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Borç başarıyla kapatıldı
