# REST API Görev Dağılımı

**REST API Adresi:** [splitbro-restapi.vercel.app](https://splitbro-restapi.vercel.app)

## 1. Grup Bilgilerini Güncelleme (Çağatay Candaş)
- **Endpoint:** `PUT /groups/{groupId}`
- **Path Parameters:** 
  - `groupId` (string, required) - Grup ID'si
- **Request Body:** 
  ```json
  {
  "name": "Tatil",
  "description": "Antalya Tatili"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Grup bilgileri başarıyla güncellendi

## 2. Grup Silme (Çağatay Candaş)
- **Endpoint:** `DELETE /groups/{groupId}`
- **Path Parameters:** 
  - `groupId` (string, required) - Grup ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `204 No Content` - Grup bilgileri başarıyla silindi

## 3. Gidere Ürün Ekleme (Çağatay Candaş)
- **Endpoint:** `POST /expenses/{expenseId}/items`
- **Path Parameters:** 
  - `expenseId` (string, required) - Gider ID'si
- **Request Body:** 
  ```json
  {
    "name": "köfte",
    "price": 250
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Ürün başarıyla eklendi

## 4. Ürünü Kişilere Atama (Çağatay Candaş)
- **Endpoint:** `POST /expenses/{expenseId}/items/{itemId}/split`
- **Path Parameters:** 
  - `expenseId` (string, required) - Gider ID'si
  - `itemId` (string, required) - Ürün ID'si
- **Request Body:** 
  ```json
  {
    "assignedUserIds": [
      "69d16c24e390f5da31e7890b",
      "69d162ee1ad409892b608c83"
    ]
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Ürün başarıyla eklendi

## 5. Otomatik Borç Hesaplama (Çağatay Candaş)
- **Endpoint:** `GET /expenses/{expenseId}/calculate`
- **Path Parameters:** 
  - `expenseId` (string, required) - Gider ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Borç hesaplaması başarıyla yapıldı

## 6. Gider Detayını Görüntüleme (Çağatay Candaş)
- **Endpoint:** `GET /expenses/{expenseId}`
- **Path Parameters:** 
  - `expenseId` (string, required) - Gider ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Gider detayı başarıyla getirildi

## 7. Gider Silme (Çağatay Candaş)
- **Endpoint:** `DELETE /expenses/{expenseId}`
- **Path Parameters:** 
  - `expenseId` (string, required) - Gider ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `204 No Content` - Gider bilgileri başarıyla silindi

## 8. Profil Resmi Silme (Çağatay Candaş)
- **Endpoint:** `DELETE /users/{userId}/avatar`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Profil resmi başarıyla silindi

## 9. AI – Ürün Kategorilendirme & Otomatik Etiketleme (Çağatay Candaş)
- **Endpoint:** `POST /ai/item-categorization`
- **Request Body:** 
  ```json
  {
    "itemsList": [
      "Sütaş Ayran 1L"
    ]
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Ürün kategorilendirme ve otomatik etiketleme başarıyla yapıldı

# 10. Kullanıcı Kaydı (Furkan Kasalak)
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

## 11. Kullanıcı Girişi (Furkan Kasalak)
- **Endpoint:** `POST /auth/login`
- **Request Body:** 
  ```json
  {
  "email": "furkannsddü@gmail.com",
  "password": "string"
  }
  ```
- **Response:** `200 OK` - Kullanıcı başarıyla giriş yaptı

## 12. Şifre Değiştirme (Furkan Kasalak)
- **Endpoint:** `PUT /users/{userId}/change-password`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si- **Request Body:** 
  ```json
  {
    "oldPassword": "string",
    "newPassword": "string"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Şifre başarıyla değiştirildi

## 13. Profil Bilgilerini Görüntüleme (Furkan Kasalak)
- **Endpoint:** `GET /users/{userId}/profile`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Profil bilgileri başarıyla getirildi

## 14. Hesap Silme (Furkan Kasalak)
- **Endpoint:** `DELETE /users/{userId}/account`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Hesap başarıyla silindi

## 15. Profil Resmi Ekleme (Furkan Kasalak)
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

## 16. Kullanıcının Gruplarını Listeleme (Furkan Kasalak)
- **Endpoint:** `GET /users/{userId}/groups`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kullanıcının grupları başarıyla getirildi

## 17. AI – Anomali Tespiti & Fiyat Doğrulama (Furkan Kasalak)
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


## 18. Profil Bilgilerini Güncelleme (Gökdeniz Erten)
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

## 19. Grup Oluşturma (Gökdeniz Erten)
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

## 20. Gruba Üye Ekleme (Gökdeniz Erten)   
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

## 21. Grup Üyelerini Listeleme (Gökdeniz Erten)
- **Endpoint:** `GET /groups/{groupId}/members`
- **Path Parameters:** 
  - `groupId` (string, required) - Grup ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Grup üyeleri başarıyla listelendi

## 22. Gruptan Üye Çıkarma (Gökdeniz Erten)
- **Endpoint:** `DELETE /groups/{groupId}/members/{userId}`
- **Path Parameters:** 
  - `groupId` (string, required) - Grup ID'si
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `204 No Content` - Üye gruptan başarıyla çıkarıldı

## 23. Profil Resmi Güncelleme (Gökdeniz Erten)
- **Endpoint:** `PUT /users/{userId}/avatar`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si
- **Request Body:** form-data ile "avatar" key'ine dosya (file) eklenecek
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Profil resmi başarıyla güncellendi

## 24. Yapay Zeka (AI) Destekli Fiş Okuma ve Otomatik Gider Ekleme (Gökdeniz Erten)  
- **Endpoint:** `POST /groups/{groupId}/expenses/scan`
- **Path Parameters:** 
  - `groupId` (string, required) - Grup ID'si
- **Request Body:** form-data ile "receipt" key'ine dosya (file) eklenecek
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Fiş başarıyla okundu ve gider eklendi

## 25. Manuel Gider Ekleme (Gökdeniz Erten)    
- **Endpoint:** `POST /groups/{groupId}/expenses`
- **Path Parameters:** 
  - `groupId` (string, required) - Grup ID'si
- **Request Body:** 
  ```json
  {
    "title": "string",
    "totalAmount": 8627.354106973511,
    "date": "2020-06-20T15:56:32.238Z"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Gider başarıyla manuel olarak eklendi

---



## Grup Üyelerinin REST API Metotları

1. [Çağatay Candaş'ın REST API Metotları](Cagatay-Candas/Cagatay-Candas-Rest-API-Gorevleri.md)
2. [Furkan Kasalak'ın REST API Metotları](Furkan-Kasalak/Furkan-Kasalak-Rest-API-Gorevleri.md)
3. [Gökdeniz Erten'in REST API Metotları](Gokdeniz-Erten/Gokdeniz-Erten-Rest-API-Gorevleri.md)

