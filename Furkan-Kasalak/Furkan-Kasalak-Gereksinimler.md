1. **Kullanıcı Kaydı** (Furkan Kasalak)
    - **API Metodu:** `POST /auth/register`
    - **Açıklama:** Yeni kullanıcıların sisteme kayıt olmasını sağlar. Kullanıcıdan alınan bilgiler doğrulanarak veritabanına kaydedilir ve hesap oluşturulur.

1. **Kullanıcı Girişi** (Furkan Kasalak)
    - **API Metodu:** `POST /auth/login`
    - **Açıklama:** Kayıtlı kullanıcıların email ve şifre ile kimlik doğrulaması yaparak sisteme erişmesini sağlar. Başarılı işlem sonucunda bir erişim anahtarı (token) döndürülür.

3. **Şifre Değiştirme** (Furkan Kasalak)
    - **API Metodu:** `PUT /users/{userId}/change-password`
    - **Açıklama:** Mevcut kullanıcının şifresini güvenli bir şekilde güncellemesini sağlar. Eski şifre doğrulaması yapıldıktan sonra yeni şifre sisteme tanımlanır.

4. **Profil Bilgilerini Görüntüleme** (Furkan Kasalak)
    - **API Metodu:** `GET /users/{userId}/profile`
    - **Açıklama:** Giriş yapmış kullanıcının ad, soyad, email gibi kişisel profil detaylarını görüntülemesini sağlar.

5. **Hesap Silme** (Furkan Kasalak)
    - **API Metodu:** `DELETE /users/{userId}/account`
    - **Açıklama:** Kullanıcının isteği üzerine hesabını ve ilgili kişisel verilerini sistemden kalıcı olarak silmesini sağlar.

6. **Profil Resmi Ekleme** (Furkan Kasalak)
    - **API Metodu:** `POST /users/{userId}/avatar`
    - **Açıklama:** Kullanıcının profilinde görünecek olan görsel dosyasını sisteme yüklemesini ve profilini kişiselleştirmesini sağlar.

7. **Kullanıcının Gruplarını Listeleme** (Furkan Kasalak)
    - **API Metodu:** `GET /users/{userId}/groups`
    - **Açıklama:** Kullanıcının dahil olduğu veya yönettiği tüm grupların listesini, grup detaylarıyla birlikte getirir.

8. **AI – Anomali Tespiti & Fiyat Doğrulama** (Furkan Kasalak)
    - **API Metodu:** `POST /ai/verify-price`
    - **Açıklama:** Yapay zeka algoritmalarını kullanarak girilen verilerdeki sıra dışı durumları (anomali) tespit eder ve fiyatların piyasa/sistem kriterlerine uygunluğunu doğrular.