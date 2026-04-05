# Furkan Kasalak'ın REST API Metotları

**API Test Videosu:** [Test Videosu](https://youtu.be/MwvDvI3hl3E)

## 1. Kullanıcı Kaydı
- **Endpoint:** `POST /auth/register`
- **Request Body:** 
  ```json
  {
  "firstName": "string",
  "lastName": "string",
  "email": "furkannsddü@gmail.com",
  "password": "string"
  }
  ```
- **Response:** `201 Created` - Kullanıcı başarıyla kaydedildi

## 2. Kullanıcı Girişi
- **Endpoint:** `POST /auth/login`
- **Request Body:** 
  ```json
  {
  "email": "furkannsddü@gmail.com",
  "password": "string"
  }
  ```
- **Response:** `200 OK` - Kullanıcı başarıyla giriş yaptı

## 3. Şifre Değiştirme
- **Endpoint:** `PUT /users/{userId}/change-password`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si- 
  **Request Body:** 
  ```json
  {
    "oldPassword": "string",
    "newPassword": "string"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Şifre başarıyla değiştirildi

## 4. Profil Bilgilerini Görüntüleme
- **Endpoint:** `GET /users/{userId}/profile`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Profil bilgileri başarıyla getirildi

## 5. Hesap Silme
- **Endpoint:** `DELETE /users/{userId}/account`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Hesap başarıyla silindi

## 6. Profil Resmi Ekleme
- **Endpoint:** `POST /users/{userId}/avatar`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si
- **Request Body:** 
  ```json
  {
    "avatar": "base64"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Profil resmi başarıyla eklendi

## 7. Kullanıcının Gruplarını Listeleme
- **Endpoint:** `GET /users/{userId}/groups`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kullanıcının grupları başarıyla getirildi

## 8. AI – Anomali Tespiti & Fiyat Doğrulama
- **Endpoint:** `POST /ai/verify-price`
- **Request Body:** 
  ```json
  {
    "itemName": "string",
    "price": 0
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Anomali tespiti & fiyat doğrulama başarıyla yapıldı

