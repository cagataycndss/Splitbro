# Gereksinim Analizi

Tüm gereksinimlerinizi çıkardıktan sonra beraber tartışıyoruz ve son gereksinimlerin isimlerini hangi API metoduna karşılık geleceğini ve kısa açıklamalarını buraya numaralı bir şekilde yazıyorsunuz. Daha sonra aşağıya herkes kendi gereksinimiyle ilgili sayfayı oluşturmalı ve kendi sayfasında kendine ait gereksinimleri numaralı bir şekilde listeleyerek her bir gereksinimin açıklamalarını yazmalı. Toplamda grup üyesi sayısı kadar sayfa oluşturulmalı. Her grup üyesine eşit sayıda gereksinim atanmalı.

## Gereksinim Sayıları (En Az)

- **1 Kişi:** 10 gereksinim
- **2 Kişi:** 16 gereksinim
- **3 Kişi:** 21 gereksinim
- **4 Kişi:** 24 gereksinim
- **5 Kişi:** 30 gereksinim

## Gereksinimlerde Uyulması Gereken Kurallar

1. **İsimler anlamlı olmalı:** Gereksinim isimleri net ve anlaşılır olmalıdır.
2. **Açıklamalar net olmalı:** Her gereksinimin açıklaması açık ve anlaşılır şekilde yazılmalıdır.
3. **Açıklamalar teknik jargon ve kısaltmalar içermemeli:** Gereksinim açıklamaları herkesin anlayabileceği basit bir dille yazılmalıdır.
4. **Gereksinim isimleri çok uzun olmamalı ve bir eylem bildirmeli:** 
   - İsimler kısa ve öz olmalıdır
   - Bir eylem fiili içermelidir
   - Örnekler: "Kayıt Olma", "Giriş Yapma", "Profil Güncelleme", "Hesap Silme"

# Tüm Gereksinimler 

1. **Giriş Yapma** (Ali Tutar)
   - **API Metodu:** `POST /auth/login`
   - **Açıklama:** Kullanıcıların sisteme giriş yaparak hizmetlere erişmesini sağlar. Email adresi ve şifre ile kimlik doğrulama yapılır. Başarılı giriş sonrası kullanıcıya erişim izni verilir ve kişisel verilerin güvenliği sağlanır.

2. **Üye Olma** (Ali Tutar)
   - **API Metodu:** `POST /auth/register`
   - **Açıklama:** Kullanıcıların yeni hesaplar oluşturarak sisteme kayıt olmasını sağlar. Kişisel bilgilerin toplanmasını ve hesap oluşturma işlemlerini içerir. Kullanıcılar email adresi ve şifre belirleyerek hesap oluşturur.

# Gereksinim Dağılımları

1. [Ali Tutar'ın Gereksinimleri](Ali-Tutar/Ali-Tutar-Gereksinimler.md)
2. [Grup Üyesi 2'nin Gereksinimleri](Grup-Uyesi-2/Grup-Uyesi-2-Gereksinimler.md)
3. [Grup Üyesi 3'ün Gereksinimleri](Grup-Uyesi-3/Grup-Uyesi-3-Gereksinimler.md)
4. [Grup Üyesi 4'ün Gereksinimleri](Grup-Uyesi-4/Grup-Uyesi-4-Gereksinimler.md)
5. [Grup Üyesi 5'in Gereksinimleri](Grup-Uyesi-5/Grup-Uyesi-5-Gereksinimler.md)
6. [Grup Üyesi 6'nın Gereksinimleri](Grup-Uyesi-6/Grup-Uyesi-6-Gereksinimler.md)