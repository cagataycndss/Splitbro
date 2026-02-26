# Tüm Gereksinimler 

1. **Grup Bilgilerini Güncelleme** (Çağatay Candaş)
   - **API Metodu:** `PUT /groups/{groupId}`
   - **Açıklama:** Grup sahibinin grubun bilgilerini değiştirebilmesini sağlar.

2. **Grup Silme** (Çağatay Candaş)
   - **API Metodu:** `DELETE /groups/{groupId}`
   - **Açıklama:** Grup sahibinin grubu kalıcı olarak silmesini sağlar.

3. **Gidere Ürün Ekleme** (Çağatay Candaş)
   - **API Metodu:** `POST /expenses/{expenseId}/items`
   - **Açıklama:** Oluşturulan gidere ürün eklenebilmesini sağlar.

4. **Ürünü Kişilere Atama** (Çağatay Candaş)
   - **API Metodu:** `POST /expenses/{expenseId}/items/{itemId}/split`
   - **Açıklama:** Her ürün için hangi grup üyelerinin paylaşacağı belirlenir.

5. **Otomatik Borç Hesaplama** (Çağatay Candaş)
   - **API Metodu:** `GET /expenses/{expenseId}/calculate`
   - **Açıklama:** Sistemin tüm ürünler ve paylaşımlar girildikten sonra kim ne kadar ödeyeceğini otomatik hesaplamasını sağlar. Bu işlem borçları kalıcı olarak kaydetmez, yalnızca hesaplama yapar.

6. **Gider Detayını Görüntüleme** (Çağatay Candaş)
   - **API Metodu:** `GET /expenses/{expenseId}`
   - **Açıklama:** Kullanıcının bir giderin tüm detaylarını görmesini sağlar.

7. **Gider Silme** (Çağatay Candaş)
   - **API Metodu:** `DELETE /expenses/{expenseId}`
   - **Açıklama:** Kullanıcının eklenen bir gideri silmesini sağlar.

8. **Profil Resmi Silme** (Çağatay Candaş)
   - **API Metodu:** `DELETE /users/{userId}/avatar`
   - **Açıklama:** Kullanıcının profilindeki resmi kalıcı olarak silmesini sağlar.

9. **AI – Ürün Kategorilendirme & Otomatik Etiketleme** (Çağatay Candaş)
   - **API Metodu:** `POST /ai/item-categorization`
   - **Açıklama:** Sistemin, fişlerdeki ürünleri (gıda, içecek, temizlik vb.) otomatik kategorilere ayırmasını sağlar.

10. **Kullanıcı Kaydı** (Furkan Kasalak)
    - **API Metodu:** `POST /auth/register`
    - **Açıklama:** Yeni kullanıcıların sisteme kayıt olmasını sağlar. Kullanıcıdan alınan bilgiler doğrulanarak veritabanına kaydedilir ve hesap oluşturulur.

11. **Kullanıcı Girişi** (Furkan Kasalak)
    - **API Metodu:** `POST /auth/login`
    - **Açıklama:** Kayıtlı kullanıcıların email ve şifre ile kimlik doğrulaması yaparak sisteme erişmesini sağlar. Başarılı işlem sonucunda bir erişim anahtarı (token) döndürülür.

12. **Şifre Değiştirme** (Furkan Kasalak)
    - **API Metodu:** `PUT /users/{userId}/change-password`
    - **Açıklama:** Mevcut kullanıcının şifresini güvenli bir şekilde güncellemesini sağlar. Eski şifre doğrulaması yapıldıktan sonra yeni şifre sisteme tanımlanır.

13. **Profil Bilgilerini Görüntüleme** (Furkan Kasalak)
    - **API Metodu:** `GET /users/{userId}/profile`
    - **Açıklama:** Giriş yapmış kullanıcının ad, soyad, email gibi kişisel profil detaylarını görüntülemesini sağlar.

14. **Hesap Silme** (Furkan Kasalak)
    - **API Metodu:** `DELETE /users/{userId}/account`
    - **Açıklama:** Kullanıcının isteği üzerine hesabını ve ilgili kişisel verilerini sistemden kalıcı olarak silmesini sağlar.

15. **Profil Resmi Ekleme** (Furkan Kasalak)
    - **API Metodu:** `POST /users/{userId}/avatar`
    - **Açıklama:** Kullanıcının profilinde görünecek olan görsel dosyasını sisteme yüklemesini ve profilini kişiselleştirmesini sağlar.

16. **Kullanıcının Gruplarını Listeleme** (Furkan Kasalak)
    - **API Metodu:** `GET /users/{userId}/groups`
    - **Açıklama:** Kullanıcının dahil olduğu veya yönettiği tüm grupların listesini, grup detaylarıyla birlikte getirir.

17. **AI – Anomali Tespiti & Fiyat Doğrulama** (Furkan Kasalak)
    - **API Metodu:** `POST /ai/verify-price`
    - **Açıklama:** Yapay zeka algoritmalarını kullanarak girilen verilerdeki sıra dışı durumları (anomali) tespit eder ve fiyatların piyasa/sistem kriterlerine uygunluğunu doğrular.

18. **Profil Bilgilerini Güncelleme** (Gökdeniz Erten)
    - **API Metodu:** `PUT /users/{userId}`
    - **Açıklama:** Kullanıcının temel kişisel bilgilerini (ad, soyad, telefon vb.) güncellemesini sağlar.

19. **Grup Oluşturma** (Gökdeniz Erten)
    - **API Metodu:** `POST /groups`
    - **Açıklama:** Kullanıcıların yeni bir harcama veya etkinlik grubu oluşturmasını sağlar.

20. **Gruba Üye Ekleme** (Gökdeniz Erten)
    - **API Metodu:** `POST /groups/{groupId}/members`
    - **Açıklama:** Mevcut bir gruba yeni kullanıcıların dahil edilmesini sağlar.

21. **Grup Üyelerini Listeleme** (Gökdeniz Erten)
    - **API Metodu:** `GET /groups/{groupId}/members`
    - **Açıklama:** Belirli bir gruptaki tüm üyeleri ve gruptaki rollerini listeler.

22. **Gruptan Üye Çıkarma** (Gökdeniz Erten)
    - **API Metodu:** `DELETE /groups/{groupId}/members/{userId}`
    - **Açıklama:** Belirli bir kullanıcının gruptan çıkarılmasını veya kendi isteğiyle ayrılmasını sağlar.

23. **Manuel Gider Ekleme** (Gökdeniz Erten)
    - **API Metodu:** `POST /groups/{groupId}/expenses`
    - **Açıklama:** Kullanıcıların ilgili gruba tutar, başlık ve tarih belirterek manuel harcama eklemesini sağlar.

24. **Profil Resmi Güncelleme** (Gökdeniz Erten)
    - **API Metodu:** `PUT /users/{userId}/avatar`
    - **Açıklama:** Kullanıcının profil resmini yeni bir görselle değiştirmesini sağlar.

25. **Yapay Zeka (AI) Destekli Fiş Okuma ve Otomatik Gider Ekleme** (Gökdeniz Erten)
    - **API Metodu:** `POST /groups/{groupId}/expenses/scan`
    - **Açıklama:** Yüklenen fiş/fatura görüntüsündeki verileri yapay zeka (OCR) ile okuyup otomatik gider kaydı oluşturur.

# Gereksinim Dağılımları

1. [Çağatay Candaş'ın Gereksinimleri](Cagatay-Candas/Cagatay-Candas-Gereksinimler.md)
2. [Furkan Kasalak'ın Gereksinimleri](Furkan-Kasalak/Furkan-Kasalak-Gereksinimler.md)
3. [Gokdeniz Erten'nin Gereksinimleri](Gokdeniz-Erten/Gokdeniz-Erten-Gereksinimler.md)