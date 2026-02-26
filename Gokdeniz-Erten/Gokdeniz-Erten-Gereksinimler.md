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
   * **Açıklama:** Kullanıcının profil resmini yeni bir görselle değiştirmesini veya silmesini sağlar.

8. Yapay Zeka (AI) Destekli Fiş Okuma ve Otomatik Gider Ekleme

   * **API Metodu:** `POST /groups/{groupId}/expenses/scan`
   * **Açıklama:** Yüklenen fiş/fatura görüntüsündeki verileri yapay zeka (OCR) ile okuyup otomatik gider kaydı oluşturur.