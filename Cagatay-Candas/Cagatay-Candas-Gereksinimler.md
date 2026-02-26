1. **Grup Bilgilerini Güncelleme**
    - **API Metodu:** `PUT /groups/{groupId}`
    - **Açıklama:** Grup sahibinin grubun bilgilerini değiştirebilmesini sağlar.

2. **Grup Silme**
    - **API Metodu:** `DELETE /groups/{groupId}`
    - **Açıklama:** Grup sahibinin grubu kalıcı olarak silmesini sağlar.

3. **Gidere Ürün Ekleme**
    - **API Metodu:** `POST /expenses/{expenseId}/items`
    - **Açıklama:** Oluşturulan gidere manuel olarak gider eklenebilmesini sağlar.

4. **Ürünü Kişilere Atama**
    - **API Metodu:** `POST /expenses/{expenseId}/items/{itemId}/split`
    - **Açıklama:** Her ürün için hangi grup üyelerinin paylaşacağı belirlenir.

5. **Otomatik Borç Hesaplama**
    - **API Metodu:** `GET /expenses/{expenseId}/calculate`
    - **Açıklama:** Sistemin tüm ürünler ve paylaşımlar girildikten sonra kim ne kadar ödeyeceğini otomatik hesaplamasını sağlar. Bu işlem borçları kalıcı olarak kaydetmez, yalnızca hesaplama yapar.

6. **Gider Detayını Görüntüleme**
    - **API Metodu:** `GET /expenses/{expenseId}`
    - **Açıklama:** Kullanıcının bir giderin tüm detaylarını görmesini sağlar.

7. **Gider Silme**
    - **API Metodu:** `DELETE /expenses/{expenseId}`
    - **Açıklama:** Kullanıcının eklenen bir gideri silmesini sağlar.

8. **Profil Resmi Silme**
    - **API Metodu:** `DELETE /users/{userId}/avatar`
    - **Açıklama:** Kullanıcının profilindeki resmi kalıcı olarak silmesini sağlar.

9. **AI – Ürün Kategorilendirme & Otomatik Etiketleme**
    - **API Metodu:** `POST /ai/item-categorization`
    - **Açıklama:** Sistemin, fişlerdeki ürünleri (gıda, içecek, temizlik vb.) otomatik kategorilere ayırmasını sağlar.