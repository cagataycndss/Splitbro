# Çağatay Candaş'ın Web Frontend Görevleri
**Front-end Test Videosu:** [Test Videosu](https://youtu.be/o_-6tU7OS4c)

---

## 1. Grup Bilgilerini Güncelleme
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

## 2. Grup Silme
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

## 3. Gidere Ürün Ekleme
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

## 4. Ürünü Kişilere Atama
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

## 5. Otomatik Borç Hesaplama
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

## 6. Gider Detayını Görüntüleme
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

## 7. Gider Silme
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

## 8. Profil Resmi Silme
- **API Endpoint:** `DELETE /users/{userId}/avatar`
- **Görev:** Kullanıcının mevcut profil resmini kaldırıp varsayılan avatara dönme işlemi.
- **UI Bileşenleri:**
  - Profil sayfasında resmin üzerinde/yanında beliren "Kaldır" veya "X" butonu
- **Kullanıcı Deneyimi:**
  - Butona tıklandığı an resmin kaybolup yerine baş harflerden oluşan (Initials) veya gri bir Placeholder avatarın gelmesi (Immediate feedback)
- **Teknik Detaylar:**
  - Image source (`src`) değerinin statik bir fallback görsele çekilmesi
  - Hata durumunda eski resme geri dönme (Rollback)

## 9. AI – Ürün Kategorilendirme & Otomatik Etiketleme
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