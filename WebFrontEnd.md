# Web Frontend Görev Dağılımı

**Web Frontend Adresi:** [splitbro-frontend.vercel.app](https://splitbro-frontend.vercel.app)

---

## 1. Grup Bilgilerini Güncelleme (Çağatay Candaş)
- **API Endpoint:** `PUT /groups/{groupId}`
- **Görev:** Grup sahibinin grup adını ve açıklamasını güncelleyebileceği arayüz tasarımı ve implementasyonu.
- **UI Bileşenleri:**
  - Grup ayarları formu (Responsive tasarım)
  - Grup Adı input alanı (mevcut değerle dolu)
  - Grup Açıklaması textarea alanı (mevcut değerle dolu)
  - "Değişiklikleri Kaydet" butonu (Primary style)
  - İşlem anında Loading Spinner
- **Form Validasyonu:**
  - HTML5 required validasyonu (Grup adı boş bırakılamaz)
  - Değişiklik yapılmadıysa kaydet butonunun disabled olması
- **Kullanıcı Deneyimi:**
  - Optimistic update (Kaydet'e basınca arayüzün beklemeden güncellenmesi)
  - Başarılı işlem sonrası yeşil Toast/Snackbar bildirimi ("Grup başarıyla güncellendi")
  - Hata durumunda kullanıcı dostu hata mesajı
- **Teknik Detaylar:**
  - Framework: React
  - State Management: Form state ve dirty state kontrolü
  - API call için Axios/Fetch entegrasyonu

## 2. Grup Silme (Çağatay Candaş)
- **API Endpoint:** `DELETE /groups/{groupId}`
- **Görev:** Grubun kalıcı olarak silinmesi için güvenli kullanıcı akışı tasarımı.
- **UI Bileşenleri:**
  - "Grubu Sil" butonu (Danger/Red button style)
  - Silme işlemi için Confirmation Modal (Onay Kutusu)
  - Modal içinde "İptal" ve "Evet, Sil" butonları
- **Kullanıcı Deneyimi:**
  - Destructive (yıkıcı) işlem olduğu için kırmızı renkli uyarılar
  - Yanlışlıkla tıklamayı önlemek için çift onay mekanizması (Modal)
  - Başarılı silme işleminden sonra ana sayfaya (veya grup listesine) yönlendirme (Redirect)
- **Teknik Detaylar:**
  - Modal state yönetimi (isOpen, onClose)
  - Routing ve History tabanlı yönlendirme

## 3. Gidere Ürün Ekleme (Çağatay Candaş)
- **API Endpoint:** `POST /expenses/{expenseId}/items`
- **Görev:** Bir harcama detayında, fişe ait yeni ürün kalemlerinin manuel olarak eklenmesi arayüzü.
- **UI Bileşenleri:**
  - Ürün Ekleme Formu (Inline form veya Modal içinde)
  - Ürün Adı input alanı
  - Fiyat input alanı (Sadece rakam ve ondalık girişine açık)
  - "Ekle" butonu (+)
- **Form Validasyonu:**
  - Fiyat alanı 0'dan büyük olmalı (Min validation)
  - Ürün adı boş olamaz
- **Kullanıcı Deneyimi:**
  - Ürün eklendiği anda listeye animasyonlu şekilde düşmesi
  - Form eklendikten sonra input alanlarının temizlenmesi (Reset form)
- **Teknik Detaylar:**
  - Input masking (Fiyat için para birimi formatı)
  - Liste state'inin güncellenmesi (Re-render optimizasyonu)

## 4. Ürünü Kişilere Atama (Çağatay Candaş)
- **API Endpoint:** `POST /expenses/{expenseId}/items/{itemId}/split`
- **Görev:** Eklenen ürünleri, ödemeye katılacak grup üyelerine atama arayüzü.
- **UI Bileşenleri:**
  - Ürün satırında "Kişi Ata" butonu
  - Grup üyelerinin listelendiği Dropdown veya Checkbox listesi
  - Seçilen kişilerin avatarlarının/isimlerinin ürün yanında gösterilmesi (Badge)
- **İşlem Validasyonu:**
  - En az bir kişi seçilmeden atama yapılamaması
- **Kullanıcı Deneyimi:**
  - Seçim yapıldıkça arayüzde anında güncellenen katılımcı ikonları
  - Kolay çoklu seçim (Multi-select) imkanı
- **Teknik Detaylar:**
  - Array state yönetimi (Seçilen kullanıcı ID'lerinin tutulması)
  - Veritabanına UUID formatında ID'lerin gönderilmesi

## 5. Otomatik Borç Hesaplama (Çağatay Candaş)
- **API Endpoint:** `GET /expenses/{expenseId}/calculate`
- **Görev:** Harcama paylaşımları girildikten sonra borç dağılımının hesaplanıp listelenmesi.
- **UI Bileşenleri:**
  - "Borçları Hesapla" butonu (Call to action)
  - Kimin kime ne kadar borçlu olduğunu gösteren Liste/Kart tasarımı
  - Borçlu ve Alacaklı için yönlendirici oklar veya renkler (Borç için kırmızı, alacak için yeşil)
- **Kullanıcı Deneyimi:**
  - Veri yüklenirken Skeleton Loading ekranı
  - Eğer harcama yoksa Empty State (Boş durum) ekranı ("Henüz hesaplanacak bir gider yok")
- **Teknik Detaylar:**
  - Gelen JSON verisindeki amount, debtorId ve creditorId eşleştirmeleri
  - Liste render edilirken benzersiz key'lerin kullanılması

## 6. Gider Detayını Görüntüleme (Çağatay Candaş)
- **API Endpoint:** `GET /expenses/{expenseId}`
- **Görev:** Bir gidere ait başlık, tarih, toplam tutar ve alt kalemlerin (ürünlerin) sergilendiği sayfa.
- **UI Bileşenleri:**
  - Gider Başlığı (H1/H2) ve Tarihi
  - Toplam Tutar kartı (Vurgulu)
  - Ürünler tablosu (Data Table veya Liste)
  - Geri dön butonu (Breadcrumb)
- **Kullanıcı Deneyimi:**
  - Temiz ve okunabilir bir layout (Responsive Grid/Flexbox)
  - Yükleme sırasında gecikme yaşanırsa loading indicator
- **Teknik Detaylar:**
  - Component Lifecycle / `useEffect` içinde API çağrısı
  - Gelen karmaşık JSON datasının UI componentlerine parse edilmesi

## 7. Gider Silme (Çağatay Candaş)
- **API Endpoint:** `DELETE /expenses/{expenseId}`
- **Görev:** Eklenen bir giderin sayfadan tamamen silinmesi işlemi.
- **UI Bileşenleri:**
  - Gider detay sayfasında veya listesinde Çöp Kutusu (Delete) ikonu
  - Silme Onay Modalı (Confirmation)
- **Kullanıcı Deneyimi:**
  - Yanlışlıkla veri kaybını önlemek için onay penceresi
  - Silindikten sonra bir üst sayfaya (Giderler listesine) otomatik dönüş
  - Başarılı silme bildirimi (Toast)
- **Teknik Detaylar:**
  - API yanıtı (204 No Content) sonrası client-side state'in temizlenmesi

## 8. Profil Resmi Silme (Çağatay Candaş)
- **API Endpoint:** `DELETE /users/{userId}/avatar`
- **Görev:** Kullanıcının mevcut profil resmini kaldırıp varsayılan avatara dönme işlemi.
- **UI Bileşenleri:**
  - Profil sayfasında resmin üzerinde/yanında beliren "Kaldır" veya "X" butonu
- **Kullanıcı Deneyimi:**
  - Butona tıklandığı an resmin kaybolup yerine baş harflerden oluşan (Initials) veya gri bir Placeholder avatarın gelmesi (Immediate feedback)
- **Teknik Detaylar:**
  - Image source (`src`) değerinin statik bir fallback görsele çekilmesi
  - Hata durumunda eski resme geri dönme (Rollback)

## 9. AI – Ürün Kategorilendirme & Otomatik Etiketleme (Çağatay Candaş)
- **API Endpoint:** `POST /ai/item-categorization`
- **Görev:** Girilen fiş/ürün kalemlerinin yapay zeka tarafından kategorize edilip UI'da gösterilmesi.
- **UI Bileşenleri:**
  - Ürün listesinin yanında "AI ile Kategorize Et" butonu
  - Kategori sonuçlarını gösteren renkli rozetler (Badges) (Örn: Gıda için yeşil, Temizlik için mavi)
- **İşlem Validasyonu:**
  - Gönderilecek ürün listesi (`itemsList`) boşsa butonun çalışmaması
- **Kullanıcı Deneyimi:**
  - Yapay zeka işlemi arka planda çalışırken özel bir Loading durumu (Örn: "Yapay zeka analiz ediyor..." yazısı veya parlayan iskelet yapısı)
  - Kategoriler geldiğinde yumuşak bir geçişle (fade-in) ekranda belirmesi
- **Teknik Detaylar:**
  - API'ye Array (`itemsList`) tipinde veri gönderimi
  - Dönen dinamik kategori isimlerine göre UI'da dinamik renk atamaları

## 10. Kullanıcı Kaydı (Registration) (Furkan Kasalak)
- **API Metodu:** `POST /auth/register`
- **Açıklama:** Yeni kullanıcıların sisteme güvenli bir şekilde dahil edilmesini sağlar.
- **Teknik Detaylar:**
  - Request Body: `email`, `password`, `firstName`, `lastName`
  - Şifrelerin **Bcrypt** algoritması ile hash'lenerek saklanması.
  - Her kullanıcı için benzersiz bir **UUID** (userId) oluşturulması.
- **Validasyon & Güvenlik:**
  - Email format doğrulaması (Regex).
  - Şifre karmaşıklığı kontrolü (Minimum 8 karakter).
  - Veritabanında mükerrer (duplicate) email kontrolü.
- **Veritabanı:** `Users` tablosuna yeni kayıt eklenmesi.

## 11. Kullanıcı Girişi (Authentication) (Furkan Kasalak)
- **API Metodu:** `POST /auth/login`
- **Açıklama:** Kayıtlı kullanıcıların kimlik doğrulaması yaparak oturum açmasını sağlar.
- **Teknik Detaylar:**
  - Request Body: `email`, `password`
  - Başarılı eşleşme durumunda **JWT (JSON Web Token)** üretimi ve döndürülmesi.
  - Token içeriğinde `userId` bilgisinin şifrelenmiş olarak tutulması.
- **Güvenlik:**
  - Hatalı giriş denemelerinde genel hata mesajı kullanımı ("Giriş başarısız").
  - Token expiration (süre aşımı) yönetimi.

## 12. Şifre Değiştirme (Furkan Kasalak)
- **API Metodu:** `PUT /users/{userId}/change-password`
- **Açıklama:** Mevcut kullanıcının şifresini güvenli bir şekilde güncellemesini sağlar.
- **Teknik Detaylar:**
  - Request Body: `oldPassword`, `newPassword`
  - İşlem öncesi mevcut şifrenin veritabanından doğrulanması.
- **Güvenlik:**
  - JWT üzerinden gelen `userId` ile URL'deki `userId` eşleşme kontrolü (Authorization).
  - Yeni şifrenin eskisiyle aynı olmaması kontrolü.

## 13. Profil Bilgilerini Görüntüleme (Furkan Kasalak)
- **API Metodu:** `GET /users/{userId}/profile`
- **Açıklama:** Giriş yapmış kullanıcının kişisel profil detaylarını getirir.
- **Teknik Detaylar:**
  - Veritabanından `firstName`, `lastName`, `email` ve `avatarUrl` bilgilerinin çekilmesi.
  - Şifre hash bilgisinin response içerisinde kesinlikle yer almaması (Data filtering).
- **Güvenlik:** Sadece yetkili kullanıcının kendi verisine erişimini sağlayan Middleware.

## 14. Hesap Silme (Furkan Kasalak)
- **API Metodu:** `DELETE /users/{userId}/account`
- **Açıklama:** Kullanıcının hesabını ve tüm kişisel verilerini kalıcı olarak sistemden kaldırır.
- **Teknik Detaylar:**
  - **Soft Delete** veya **Hard Delete** stratejisinin uygulanması.
  - Kullanıcıya bağlı ilişkili verilerin (grup üyelikleri vb.) tutarlılık (integrity) kontrolü.
- **Veritabanı:** `Users` tablosundan kaydın silinmesi.

## 15. Profil Resmi Ekleme (Avatar Upload) (Furkan Kasalak)
- **API Metodu:** `POST /users/{userId}/avatar`
- **Açıklama:** Kullanıcının profil görselini sisteme yüklemesini sağlar.
- **Teknik Detaylar:**
  - **Multer** kütüphanesi ile dosya işleme.
  - Dosyanın bulut depolama (AWS S3 / Cloudinary) veya yerel sunucuya yüklenmesi.
  - Veritabanındaki `avatarUrl` alanının güncellenmesi.
- **Validasyon:**
  - Dosya tipi kontrolü (Sadece .jpg, .png, .jpeg).
  - Dosya boyutu sınırı (Örn: Max 2MB).

## 16. Kullanıcının Gruplarını Listeleme (Furkan Kasalak)
- **API Metodu:** `GET /users/{userId}/groups`
- **Açıklama:** Kullanıcının dahil olduğu veya yönettiği tüm grupları getirir.
- **Teknik Detaylar:**
  - `UserGroups` (pivot) tablosu üzerinden `Groups` tablosuna JOIN sorgusu atılması.
  - Dönen listede grup adı, üye sayısı ve rol bilgisi yer almalıdır.
- **Performans:** Gerekirse büyük veri setleri için basit pagination (sayfalama) desteği.

## 17. AI – Anomali Tespiti & Fiyat Doğrulama (Furkan Kasalak)
- **API Metodu:** `POST /ai/verify-price`
- **Açıklama:** Girilen harcama verilerindeki anormallikleri tespit eder ve piyasa verilerine göre doğrular.
- **AI Entegrasyonu:**
  - Gelen `price` ve `itemName` verisinin AI modeline (Python microservice veya model scripti) gönderilmesi.
  - Anomali skoru hesaplanması (Örn: Ortalama fiyatın %500 üstündeki girişler).
- **Teknik Detaylar:**
  - Request Body: `itemName`, `price`, `category`
  - Response: `{ "isAnomaly": boolean, "suggestion": string, "confidenceScore": float }`
- **Kullanım Amacı:** Hatalı veya şişirilmiş fiyat girişlerini tespit ederek güvenilirliği artırmak.

## 18. Profil Bilgilerini Güncelleme (Gökdeniz Erten)
- **API Endpoint:** `PUT /users/{userId}`
- **Görev:** Kullanıcının temel kişisel bilgilerini (ad, soyad, telefon vb.) güncelleyebileceği arayüz tasarımı ve implementasyonu.
- **UI Bileşenleri:**
  - Kişisel bilgiler formu (Responsive tasarım)
  - Ad, Soyad ve Telefon input alanları (mevcut değerlerle dolu)
  - "Güncelle" butonu (Primary style)
  - İşlem anında Loading Spinner
- **Form Validasyonu:**
  - HTML5 required validasyonu (Ad ve Soyad boş bırakılamaz)
  - Değişiklik yapılmadıysa kaydet butonunun disabled olması
- **Kullanıcı Deneyimi:**
  - Optimistic update (Güncelle'ye basınca arayüzün beklemeden güncellenmesi)
  - Başarılı işlem sonrası yeşil Toast/Snackbar bildirimi ("Profil başarıyla güncellendi")
  - Hata durumunda kullanıcı dostu hata mesajı
- **Teknik Detaylar:**
  - Framework: React
  - State Management: Form state ve dirty state kontrolü
  - API call için Axios/Fetch entegrasyonu

## 19. Grup Oluşturma (Gökdeniz Erten)
- **API Endpoint:** `POST /groups`
- **Görev:** Kullanıcıların yeni bir harcama veya etkinlik grubu oluşturmasını sağlayan arayüz tasarımı.
- **UI Bileşenleri:**
  - "Yeni Grup Oluştur" butonu ve Modal/Sayfa tasarımı
  - Grup Adı input alanı
  - Grup Açıklaması textarea alanı
  - "Oluştur" butonu
- **Form Validasyonu:**
  - Grup adı alanının zorunlu olması (Min length kontrolü)
- **Kullanıcı Deneyimi:**
  - Başarılı oluşturma sonrası kullanıcının anında oluşturulan yeni grubun detay sayfasına yönlendirilmesi (Redirect)
- **Teknik Detaylar:**
  - Routing ve History tabanlı yönlendirme
  - API yanıtından dönen yeni grup ID'sinin yakalanması

## 20. Gruba Üye Ekleme (Gökdeniz Erten)
- **API Endpoint:** `POST /groups/{groupId}/members`
- **Görev:** Mevcut bir gruba e-posta adresi üzerinden yeni kullanıcıların dahil edilmesini sağlayan arayüz.
- **UI Bileşenleri:**
  - Üye ekleme input alanı (E-posta formatında)
  - "Davet Et" veya "Ekle" butonu
- **Form Validasyonu:**
  - Geçerli bir e-posta formatı kontrolü (Regex)
- **Kullanıcı Deneyimi:**
  - Hatalı mail girişinde anında kırmızı hata mesajı (Inline error)
  - Başarılı eklemede üye listesinin anında güncellenmesi ve inputun temizlenmesi
- **Teknik Detaylar:**
  - Input value binding ve onChange event yönetimi

## 21. Grup Üyelerini Listeleme (Gökdeniz Erten)
- **API Endpoint:** `GET /groups/{groupId}/members`
- **Görev:** Belirli bir gruptaki tüm üyeleri ve gruptaki rollerini gösteren liste tasarımı.
- **UI Bileşenleri:**
  - Kullanıcı avatarları ve isimlerinden oluşan dikey liste veya grid yapısı
  - Yönetici (Admin) ve Üye durumunu gösteren rozetler (Badges)
- **Kullanıcı Deneyimi:**
  - Veri yüklenirken iskelet (Skeleton Loading) ekranı
  - Grupta hiç üye yoksa (kurucu hariç) Empty State (Boş durum) ekranı
- **Teknik Detaylar:**
  - Component Lifecycle / `useEffect` içinde API çağrısı
  - Liste render edilirken benzersiz key prop'larının kullanılması

## 22. Gruptan Üye Çıkarma (Gökdeniz Erten)
- **API Endpoint:** `DELETE /groups/{groupId}/members/{userId}`
- **Görev:** Belirli bir kullanıcının gruptan çıkarılması işlemi için güvenli arayüz akışı tasarımı.
- **UI Bileşenleri:**
  - Üye isminin yanındaki üç nokta (Dropdown) menüsünde "Gruptan Çıkar" butonu (Danger style)
  - Silme işlemi için Confirmation Modal (Onay Kutusu)
- **Kullanıcı Deneyimi:**
  - Yıkıcı (destructive) işlem olduğu için Modal ile çift onay mekanizması
  - Başarılı işlem sonrası silinen üyenin listeden animasyonlu şekilde kaybolması
- **Teknik Detaylar:**
  - Modal state yönetimi (isOpen, onClose, selectedUserId)
  - API yanıtı (204 No Content) sonrası client-side state'in filtrelenerek güncellenmesi

## 23. Manuel Gider Ekleme (Gökdeniz Erten)
- **API Endpoint:** `POST /groups/{groupId}/expenses`
- **Görev:** Kullanıcıların ilgili gruba tutar, başlık ve tarih belirterek manuel harcama girebileceği form arayüzü.
- **UI Bileşenleri:**
  - Harcama başlığı input alanı
  - Tutar input alanı
  - Tarih seçici (Datepicker)
  - "Kim Ödedi?" seçimi için dropdown listesi
- **Form Validasyonu:**
  - Tutarın 0'dan büyük olması zorunluluğu
- **Kullanıcı Deneyimi:**
  - Fiyat alanı için para birimi formatı (Input masking)
  - Kayıt tamamlandığında başarılı bildirimi ve formun sıfırlanması
- **Teknik Detaylar:**
  - Tarih objesinin API'nin beklediği ISO formatına çevrilmesi
  - Dropdown için gruptaki mevcut üyelerin ID'lerinin listelenmesi

## 24. Profil Resmi Güncelleme (Gökdeniz Erten)
- **API Endpoint:** `PUT /users/{userId}/avatar`
- **Görev:** Kullanıcının cihazından dosya seçip profil resmini değiştirmesini sağlayan arayüz.
- **UI Bileşenleri:**
  - Mevcut avatar üzerinde beliren "Kamera/Düzenle" ikonu
  - Gizli file input alanı ve "Yükle" butonu
- **Kullanıcı Deneyimi:**
  - Fotoğraf seçildiği an sunucuya gitmeden önce anında önizleme (Image Preview) gösterilmesi
  - Yükleme işlemi sırasında eski fotoğrafın bulanıklaşıp loading spinner çıkması
- **Teknik Detaylar:**
  - FormData nesnesi oluşturulması
  - `multipart/form-data` header'ı ile API çağrısı
  - Client-side FileReader API kullanımı

## 25. Yapay Zeka (AI) Destekli Fiş Okuma ve Otomatik Gider Ekleme (Gökdeniz Erten)
- **API Endpoint:** `POST /ai/groups/{groupId}/expenses/scan`
- **Görev:** Yüklenen fiş/fatura görüntüsünün yapay zeka ile taranıp otomatik gider oluşturulmasını sağlayan ekran tasarımı.
- **UI Bileşenleri:**
  - "Fiş Tara" özel butonu (Görsel olarak vurgulu)
  - Drag & Drop (Sürükle-Bırak) dosya yükleme alanı
  - Yapay zeka analiz sonuçlarının (okunan tutar ve başlık) gösterildiği Onay Kartı
- **İşlem Validasyonu:**
  - Sadece izin verilen dosya formatları (.jpg, .png) ve maksimum boyut kontrolü
- **Kullanıcı Deneyimi:**
  - Fiş analizi uzun sürebileceği için o sırada dönen özel AI animasyonu (Örn: "Yapay zeka fişinizi okuyor...")
  - Başarılı okumadan sonra verilerin direkt kaydedilmeden önce kullanıcı onayına (Düzenleme şansına) sunulması
- **Teknik Detaylar:**
  - Uzun süren API çağrıları için Timeout ve asenkron state yönetimi
  - Dosya yükleme (File Upload) süreçleri için FormData kullanımı

---

## Grup Üyelerinin Web Frontend Görevleri

1. [Çağatay Candaş'ın Web Frontend Görevleri](Cagatay-Candas/Cagatay-Candas-Web-Frontend-Gorevleri.md)
2. [Furkan Kasalak'ın Web Frontend Görevleri](Furkan-Kasalak/Furkan-Kasalak-Web-Frontend-Gorevleri.md)
3. [Gökdeniz Erten'in Web Frontend Görevleri](Gokdeniz-Erten/Gokdeniz-Erten-Web-Frontend-Gorevleri.md)

