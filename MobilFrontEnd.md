# Mobil Frontend Görev Dağılımı

Bu dokümanda, mobil uygulamanın kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) görevleri listelenmektedir. Her grup üyesi, kendisine atanan ekranların tasarımı, implementasyonu ve kullanıcı etkileşimlerinden sorumludur.

---

## Grup Üyelerinin Mobil Frontend Görevleri

1. [Ali Tutar'ın Mobil Frontend Görevleri](Ali-Tutar/Ali-Tutar-Mobil-Frontend-Gorevleri.md)
2. [Grup Üyesi 2'nin Mobil Frontend Görevleri](Grup-Uyesi-2/Grup-Uyesi-2-Mobil-Frontend-Gorevleri.md)
3. [Grup Üyesi 3'ün Mobil Frontend Görevleri](Grup-Uyesi-3/Grup-Uyesi-3-Mobil-Frontend-Gorevleri.md)
4. [Grup Üyesi 4'ün Mobil Frontend Görevleri](Grup-Uyesi-4/Grup-Uyesi-4-Mobil-Frontend-Gorevleri.md)
5. [Grup Üyesi 5'in Mobil Frontend Görevleri](Grup-Uyesi-5/Grup-Uyesi-5-Mobil-Frontend-Gorevleri.md)
6. [Grup Üyesi 6'nın Mobil Frontend Görevleri](Grup-Uyesi-6/Grup-Uyesi-6-Mobil-Frontend-Gorevleri.md)

---

## Genel Mobil Frontend Prensipleri

### 1. Tasarım Sistemi
- **Renk Paleti:** Tutarlı renk kullanımı (primary, secondary, error, success)
- **Tipografi:** Okunabilir font boyutları ve ağırlıkları
- **Spacing:** Tutarlı padding ve margin değerleri (8dp/8pt grid sistemi)
- **Iconography:** Standart icon seti kullanımı (Material Icons/SF Symbols)

### 2. Responsive Tasarım
- Farklı ekran boyutlarına uyum (phone, tablet)
- Landscape ve portrait mod desteği
- Safe area desteği (notch, status bar)

### 3. Kullanıcı Deneyimi (UX)
- **Loading States:** Skeleton screens, progress indicators
- **Error Handling:** Kullanıcı dostu hata mesajları
- **Empty States:** Boş durumlar için bilgilendirici mesajlar
- **Feedback:** Kullanıcı aksiyonlarına anında geri bildirim (toast, snackbar)

### 4. Erişilebilirlik (Accessibility)
- Content descriptions ve labels
- Touch target boyutları (min 44x44dp/pt)
- Screen reader desteği
- Yüksek kontrast modu desteği
- Font scaling desteği

### 5. Performans
- Lazy loading (liste görünümleri için)
- Image optimization ve caching
- Smooth animations (60 FPS hedefi)
- Memory management

### 6. Navigasyon
- Tutarlı navigation pattern (bottom navigation, drawer, tabs)
- Deep linking desteği
- Back button handling
- Navigation state yönetimi

### 7. Form Yönetimi
- Real-time validation
- Error mesajları alan altında gösterilmesi
- Keyboard handling (dismiss, next field focus)
- Form state persistence (opsiyonel)

### 8. Platform Özellikleri
- **Android:** Material Design 3 guidelines
- **iOS:** Human Interface Guidelines
- Platform-specific UI patterns kullanımı
- Native feel sağlanması