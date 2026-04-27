1. Profil Bilgilerini Güncelleme

   * **API Metodu:** `PUT /users/{userId}`
   * **Açıklama:** Kullanıcının temel kişisel bilgilerini (ad, soyad, telefon vb.) güncellemesini sağlar.

2. Grup Oluşturma

   * **API Metodu:** `POST /groups`
   * **Açıklama:** Kullanıcıların yeni bir harcama veya etkinlik grubu oluşturmasını sağlar.

3. Gruba Üye Ekleme

   * **API Metodu:** `POST /groups/{groupId}/members`
   * **Açıklama:** Mevcut bir gruba yeni kullanıcıların dahil edilmesini sağlar.

4. Grup Üyelerini Listeleme

   * **API Metodu:** `GET /groups/{groupId}/members`
   * **Açıklama:** Belirli bir gruptaki tüm üyeleri ve gruptaki rollerini listeler.

5. Gruptan Üye Çıkarma

   * **API Metodu:** `DELETE /groups/{groupId}/members/{userId}`
   * **Açıklama:** Belirli bir kullanıcının gruptan çıkarılmasını veya kendi isteğiyle ayrılmasını sağlar.

6. Manuel Gider Ekleme

   * **API Metodu:** `POST /groups/{groupId}/expenses`
   * **Açıklama:** Kullanıcıların ilgili gruba tutar, başlık ve tarih belirterek manuel harcama eklemesini sağlar.

7. Profil Resmi Güncelleme

   * **API Metodu:** `PUT /users/{userId}/avatar`
   * **Açıklama:** Kullanıcının profil resmini yeni bir görselle değiştirmesini sağlar.

8. Yapay Zeka (AI) Destekli Fiş Okuma ve Otomatik Gider Ekleme

   * **API Metodu:** `POST /groups/{groupId}/expenses/scan`
   * **Açıklama:** Yüklenen fiş/fatura görüntüsündeki verileri yapay zeka (OCR) ile okuyup, kalem kalem ürün adı ve fiyatlarını ayrıştırarak otomatik gider kaydı oluşturur.

9. Google ile Sosyal Giriş (OAuth 2.0)

   * **API Metodu:** `POST /auth/google`
   * **Açıklama:** Kullanıcıların Google hesaplarıyla tek tıkla giriş yapmasını veya otomatik kayıt olmasını sağlar. Google'dan alınan `idToken` backend tarafından doğrulanır.

10. Çoklu Para Birimi Desteği (Multi-Currency)

    * **API Metodu:** `POST /groups/{groupId}/expenses` (currency alanı)
    * **Açıklama:** Gider oluştururken TRY, USD, EUR, GBP gibi farklı para birimleri seçilebilir. Borç hesaplamaları para birimine göre ayrı ayrı yapılır.

11. Gruba Misafir (Kayıtsız) Üye Ekleme

    * **API Metodu:** `POST /groups/{groupId}/members/guest`
    * **Açıklama:** Sisteme kayıtlı olmayan kişilerin sadece isim girilerek gruba misafir olarak eklenmesini sağlar. Misafirler veritabanında ayrı bir kullanıcı oluşturmadan grubun içinde tutulur.

12. Grup Borç Optimizasyonu ve Hesaplaşma

    * **API Metodu:** `GET /groups/{groupId}/calculate` & `POST /groups/{groupId}/settle`
    * **Açıklama:** Gruptaki tüm giderleri analiz ederek kimin kime ne kadar borçlu olduğunu optimize bir şekilde hesaplar. Borç kapatma işlemi de bu endpoint üzerinden yapılır.