# Çağatay Candaş'ın REST API Metotları

**API Test Videosu:** [Test Videosu](https://youtu.be/FlI4P1TWd58)

## 1. Grup Bilgilerini Güncelleme
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

## 2. Grup Silme
- **Endpoint:** `DELETE /groups/{groupId}`
- **Path Parameters:** 
  - `groupId` (string, required) - Grup ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `204 No Content` - Grup bilgileri başarıyla silindi

## 3. Gidere Ürün Ekleme
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

## 4. Ürünü Kişilere Atama
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

## 5. Otomatik Borç Hesaplama
- **Endpoint:** `GET /expenses/{expenseId}/calculate`
- **Path Parameters:** 
  - `expenseId` (string, required) - Gider ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Borç hesaplaması başarıyla yapıldı

## 6. Gider Detayını Görüntüleme
- **Endpoint:** `GET /expenses/{expenseId}`
- **Path Parameters:** 
  - `expenseId` (string, required) - Gider ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Gider detayı başarıyla getirildi

## 7. Gider Silme
- **Endpoint:** `DELETE /expenses/{expenseId}`
- **Path Parameters:** 
  - `expenseId` (string, required) - Gider ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `204 No Content` - Gider bilgileri başarıyla silindi

## 8. Profil Resmi Silme
- **Endpoint:** `DELETE /users/{userId}/avatar`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Profil resmi başarıyla silindi

## 9. AI – Ürün Kategorilendirme & Otomatik Etiketleme
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
