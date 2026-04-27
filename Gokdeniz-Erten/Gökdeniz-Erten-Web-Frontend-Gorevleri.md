# Gökdeniz Erten'in Web Frontend Görevleri
**Front-end Test Videosu:** [Test Videosu](https://youtu.be/7X6SDEJeM7c)

---

## 1. Profil Bilgilerini Güncelleme
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

## 2. Grup Oluşturma
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

## 3. Gruba Üye Ekleme
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

## 4. Grup Üyelerini Listeleme
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

## 5. Gruptan Üye Çıkarma
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

## 6. Manuel Gider Ekleme
- **API Endpoint:** `POST /groups/{groupId}/expenses`
- **Görev:** Kullanıcıların ilgili gruba tutar, başlık ve para birimi belirterek manuel harcama girebileceği form arayüzü.
- **UI Bileşenleri:**
  - Harcama başlığı input alanı
  - Tutar input alanı
  - Para Birimi seçici (TRY/USD/EUR/GBP dropdown)
  - "Kim Ödedi?" seçimi için dropdown listesi
- **Form Validasyonu:**
  - Tutarın 0'dan büyük olması zorunluluğu
- **Kullanıcı Deneyimi:**
  - Seçilen para birimine göre sembolün otomatik değişmesi
  - Kayıt tamamlandığında başarılı bildirimi ve formun sıfırlanması
- **Teknik Detaylar:**
  - Dropdown için gruptaki mevcut üyelerin ID'lerinin listelenmesi
  - Seçilen `currency` değerinin API'ye gönderilmesi

## 7. Profil Resmi Güncelleme
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

## 8. Yapay Zeka (AI) Destekli Fiş Okuma ve Otomatik Gider Ekleme
- **API Endpoint:** `POST /groups/{groupId}/expenses/scan`
- **Görev:** Yüklenen fiş/fatura görüntüsünün yapay zeka ile taranıp, kalem kalem ürün adı ve fiyatlarının ayrıştırılarak otomatik gider oluşturulmasını sağlayan ekran tasarımı.
- **UI Bileşenleri:**
  - "Fiş Tara" özel butonu (Görsel olarak vurgulu)
  - Drag & Drop (Sürükle-Bırak) dosya yükleme alanı
  - Yapay zeka analiz sonuçlarının (okunan ürün listesi, fiyatları ve başlık) gösterildiği Onay Kartı
- **İşlem Validasyonu:**
  - Sadece izin verilen dosya formatları (.jpg, .png) ve maksimum boyut kontrolü
- **Kullanıcı Deneyimi:**
  - Fiş analizi uzun sürebileceği için o sırada dönen özel AI animasyonu (Örn: "Yapay zeka fişinizi okuyor...")
  - Başarılı okumadan sonra verilerin direkt kaydedilmeden önce kullanıcı onayına (Düzenleme şansına) sunulması
- **Teknik Detaylar:**
  - Uzun süren API çağrıları için Timeout ve asenkron state yönetimi
  - Dosya yükleme (File Upload) süreçleri için FormData kullanımı

## 9. Google ile Giriş Butonu
- **API Endpoint:** `POST /auth/google`
- **Görev:** Login ve Register sayfalarına Google OAuth 2.0 ile tek tıkla giriş/kayıt butonunun yerleştirilmesi.
- **UI Bileşenleri:**
  - "--- veya ---" ayıracı (Divider)
  - `<GoogleLogin />` bileşeni (Koyu tema, yuvarlak köşe, Türkçe lokalizasyon)
- **Kullanıcı Deneyimi:**
  - Butona tıklayınca Google popup'ı açılır, hesap seçilir, otomatik giriş yapılır
  - Başarılı girişte Dashboard'a yönlendirilir
- **Teknik Detaylar:**
  - `@react-oauth/google` kütüphanesi
  - `GoogleOAuthProvider` wrapper
  - `AuthContext` içinde `googleLogin()` fonksiyonu

## 10. Misafir Üye Ekleme Arayüzü
- **API Endpoint:** `POST /groups/{groupId}/members/guest`
- **Görev:** Gruba kayıtsız (misafir) üye eklemeyi sağlayan sekme yapısının Üye Ekle modal'ına entegre edilmesi.
- **UI Bileşenleri:**
  - "Kayıtlı Kullanıcı" ve "Kayıtsız Misafir" sekmeleri (Tab yapısı)
  - Misafir sekmesinde isim input alanı
  - "Ekle" butonu
- **Form Validasyonu:**
  - Misafir adı boş bırakılamaz
- **Teknik Detaylar:**
  - `memberTab` state yönetimi
  - Misafir üyelerin `guestName` ile listelenmesi

## 11. Para Birimi Seçici
- **API Endpoint:** `POST /groups/{groupId}/expenses` (currency alanı)
- **Görev:** Manuel gider ekleme formundaki tutar alanının yanına para birimi dropdown'ının yerleştirilmesi.
- **UI Bileşenleri:**
  - `<select>` dropdown (TRY/USD/EUR/GBP)
  - Tutar ve birim alanlarının yan yana flex layout'u
- **Teknik Detaylar:**
  - `expCurrency` state yönetimi
  - `currencySymbols` obje mapping'i

## 12. Grup Borç Hesaplaşması Ekranı
- **API Endpoint:** `GET /groups/{groupId}/calculate` & `POST /groups/{groupId}/settle`
- **Görev:** Gruptaki tüm borçların para birimine göre ayrılmış şekilde listelenmesi ve tek tıkla kapatma butonu.
- **UI Bileşenleri:**
  - Borç kartları (Borçlu → Alacaklı ok ile)
  - Para birimi badge'i
  - "💳 Ödeştik" butonu
- **Teknik Detaylar:**
  - Settlement array'inde `currency` alanına göre sembol render'lama
  - Misafir üyelerin `guestName` fallback ile gösterilmesi