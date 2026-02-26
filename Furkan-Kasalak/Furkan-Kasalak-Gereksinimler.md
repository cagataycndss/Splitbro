1. **Kullanıcı Kaydı**
- **API Metodu:** `POST /auth/register`
- **Açıklama:** Yeni kullanıcıların sisteme kayıt olmasını sağlar. Kullanıcıdan alınan bilgiler doğrulanarak veritabanına kaydedilir ve hesap oluşturulur.

2. **Kullanıcı Girişi**
- **API Metodu:** `POST /auth/login`
- **Açıklama:** Kayıtlı kullanıcıların email ve şifre ile kimlik doğrulaması yaparak sisteme erişmesini sağlar. Başarılı işlem sonucunda bir erişim anahtarı (token) döndürülür.

3. **Şifre Değiştirme**
- **API Metodu:** `PUT /user/change-password`
- **Açıklama:** Mevcut kullanıcının şifresini güvenli bir şekilde güncellemesini sağlar. Eski şifre doğrulaması yapıldıktan sonra yeni şifre sisteme tanımlanır.

4. **Profil Bilgilerini Görüntüleme**
- **API Metodu:** `GET /user/profile`
- **Açıklama:** Giriş yapmış kullanıcının ad, soyad, email gibi kişisel profil detaylarını görüntülemesini sağlar.

5. **Hesap Silme**
- **API Metodu:** `DELETE /user/account`
- **Açıklama:** Kullanıcının isteği üzerine hesabını ve ilgili kişisel verilerini sistemden kalıcı olarak silmesini sağlar.

6. **Profil Resmi Ekleme**
- **API Metodu:** `POST /user/profile-image`
- **Açıklama:** Kullanıcının profilinde görünecek olan görsel dosyasını sisteme yüklemesini ve profilini kişiselleştirmesini sağlar.

7. **Kullanıcının Gruplarını Listeleme**
- **API Metodu:** `GET /user/groups`
- **Açıklama:** Kullanıcının dahil olduğu veya yönettiği tüm grupların listesini, grup detaylarıyla birlikte getirir.

8. **AI – Anomali Tespiti & Fiyat Doğrulama**
- **API Metodu:** `POST /ai/verify-price`
- **Açıklama:** Yapay zeka algoritmalarını kullanarak girilen verilerdeki sıra dışı durumları (anomali) tespit eder ve fiyatların piyasa/sistem kriterlerine uygunluğunu doğrular.