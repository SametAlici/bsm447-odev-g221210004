# G221210004 ödev kontrol raporu

**Güncelleme: 2 Kasım 2026, Türkiye saati.** Expo yapılandırması ve kayıt/API sorunları giderildi. **Expo Doctor 20/20**, otomatik testler **15/15** geçti; GitHub'daki temiz kontrol çalışması da başarılı. **Bağımsız Android APK üretildi, imzası doğrulandı ve Android 35 emülatörüne kuruldu.** Metro kapalıyken açılış, arama, +10, kaydetme/çıkarma, bağlantı hatası/tekrar deneme ve işlem tamamen kapatılıp açıldığında kayıt kalıcılığı doğrulandı. Gerçek APK'dan üç ekran görüntüsü ve **43,43 saniyelik video** hazırlandı. Gelecekte tamamlanacak farklı günlerde commit ve OBİS yüklemesi teknik doğrulamalardan ayrıdır.

Kaynak: Kullanıcının sağladığı `BSM447_Donem_Odevi.pdf`; genel koşullar s.1–2, atama s.4, K19 kartı s.12. PDF değerlendirme ölçütü olarak okundu. İlk incelemenin başlangıç commit'i: `a823df00ec3603192d1b03ffd9a549eb730a5ac9`.

## 1. Atama ve güncel durum

**G221210004 → K19 Pokédex → b / Su → Ek kural 6 / 10'ar 10'ar gösterme.**

| Koşul / kontrol | Güncel sonuç | Kanıt / sınır |
|---|---|---|
| Doğru konu, varyant ve API | Uygun | `src/api.js`: `https://pokeapi.co/api/v2/type/water` |
| Çalışırken fetch + useEffect | Uygun | Canlı API 192 kayıt döndürdü; Android emülatöründeki uygulamada liste açıldı |
| FlatList, name anahtarı ve büyük/küçük harfe duyarsız arama | Doğrulandı | Native APK'da `PSYDUCK` araması 1/1 sonuç; olmayan ad için Sonuç bulunamadı |
| İlk 10, sonra +10 | Doğrulandı | Native APK'da başlangıç 10/192; tek kaydırma sonrası 20/192 |
| Bottom Tab + Stack ve route.params | Doğrulandı | Liste ve Kaydedilenler'den aynı Detay ekranına geçildi |
| İkinci detay isteği, görsel, boy, ağırlık ve istatistikler | Doğrulandı | Squirtle görseli, 0.5 m, 9 kg ve altı istatistik emülatörde görüldü |
| Değere bağlı yatay istatistik çubukları | Uygulanmış | 150 değeri %100 genişliğe karşılık geliyor |
| Detaydan kaydet/çıkar ve AsyncStorage | Düzeltildi; hata senaryoları geçti | Okuma tamamlanana kadar değişiklik engeli, sıralı yazma, yazma başarısından sonra state güncelleme |
| Özgün ad ve simge | Uygun | Su Pokédex; damla ve DEX yazılı özel simge |
| Expo SDK bağımlılık ve config kontrolü | **Geçti: Doctor 20/20** | `expo-font` eklendi; eski splash alanı config plugin'e taşındı |
| Android emülatöründe Expo Go açılışı | **Doğrulandı** | Ayrılmış Android 35 AVD: `BSM447_G221210004`, Expo Go 58 |
| Native APK üretimi ve kurulumu | **Geçti** | ARM64 release APK, imza doğrulaması, adb install Success; Metro kapalıyken açıldı |
| README üç ekran görüntüsü | **Tamam** | `screenshots/liste.png`, `detay.png`, `kaydedilenler.png`; 1080×2400 gerçek APK görüntüleri |
| En fazla 1 dakikalık üç ekran videosu | **Tamam: 43,43 saniye** | 720×1600 H.264 / 30 fps; üç ekran, kaydetme ve kapatıp açınca kalıcılık |
| Uygulamayı tamamen kapatıp açarak kayıt kalıcılığı | **Geçti** | Native uygulama force-stop edildi; yeniden açıldıktan sonra Squirtle kaydı korundu. Silme sonrası yeniden açılışta boş liste de doğrulandı |
| İnternet kapalıyken hata / Tekrar dene | **Geçti** | Temiz test verisiyle uçak modunda hata; ağ açıldıktan sonra tekrar deneme ile 10/192 listesi |
| Public depo, doğru ad ve .gitignore | Uygun | `SametAlici/bsm447-odev-g221210004`; `node_modules` ve `.expo` takip edilmiyor |
| En az 10 farklı günde en az 10 commit | Henüz zaman koşulu tamamlanmadı | Kabul aralığı 5 Kasım–15 Aralık; günlük otomasyon aşağıda |
| OBİS ZIP teslimi | Yapılmadı | OBİS'e erişilmedi; teslim kullanıcı tarafından yapılmalı |

## 2. Düzeltilen sorunlar ve testler

1. **Expo yapılandırması:** Eksik `expo-font` bağımlılığı eklendi. SDK 58'in kabul etmediği eski `expo.splash` alanı kaldırılarak `expo-splash-screen` config plugin düzeni kullanıldı. Son Doctor sonucu **20/20**.
2. **Açılışta kayıtların ezilmesi:** `src/savedStore.js`, ilk AsyncStorage okuması tamamlanmadan ekleme/silme işlemini engelliyor. Okuma hatası ya da bozuk veri boş listeyle eski dosyanın üzerine yazılmasına yol açmıyor. Ekranda hata ve tekrar deneme durumu var.
3. **Başarısız yazmanın kaydedilmiş görünmesi:** Yazma işlemleri sıraya alındı. Yeni liste yalnız `AsyncStorage.setItem` başarılı olduktan sonra arayüze aktarılıyor. Disk hatası yakalanıyor; kayıt durumu korunuyor ve sonraki deneme çalışabiliyor.
4. **JSON gövdesinde sınırsız bekleme:** `src/api.js` içindeki 15 saniyelik sınır artık bağlantıyı ve JSON gövdesinin okunmasını birlikte kapsıyor. İptali tam uygulamayan ortamlarda da bekleyişi bitiren sınır var; HTTP/ağ/JSON hataları çağıran ekrana iletiliyor.
5. **Arama sonrası erken +10:** Arama değişince `userScrolled.current` sıfırlanıyor. Sayı en güncel state üzerinden artırılıyor; eski istek sonuçlarının yeni durumu ezmesi de engelleniyor.

| Test grubu | Sonuç | Kapsam |
|---|---|---|
| `scripts/api.test.mjs` | **6/6 geçti** | Liste dönüşümü, JSON gövdesi ve bağlantı timeout'u, HTTP hatası, bozuk JSON, ağ hatası ve timer temizliği |
| `scripts/saved-store.test.mjs` | **6/6 geçti** | İlk okuma koruması, yazma bitmeden başarı göstermeme, yazma/okuma hatası ve tekrar deneme, eşzamanlı işlemler, bozuk veri ve tekilleştirme |
| `scripts/daily-window.test.mjs` | **3/3 geçti** | 15 günlük tarih sınırları, Türkiye gün sınırı ve manuel dry-run koruması |
| Gerçek kaynakla regresyon harness'i | **Geçti** | İlk incelemede üretilen hydration, yazma hatası, API body timeout ve arama bayrağı senaryoları düzeltmeler sonrasında kontrol edildi |
| `npx expo-doctor` | **20/20 geçti** | Güncel bağımlılık ve config durumu |
| Canlı PokeAPI + emülatör açılışı | **Geçti** | 192 su Pokémon'u, ilk 10'un uygulamada görünmesi |

Testler gerçek uygulama modüllerini çalıştırır. Bellek içi depolama ve mock ağ testleri, gerçek cihazda kapatıp açma ve native APK kurulum testlerinin yerine geçmez.

## 3. Native Android derlemesi ve teslim kanıtları

Yerel Android ortamı: **SDK platform 37.0**, **Build Tools 37.0.0**, **NDK 27.1.12297006**, **JBR 21** ve CMake 3.22.1. `app:assembleRelease -PreactNativeArchitectures=arm64-v8a --no-daemon --max-workers=2` derlemesi **6 dakika 1 saniyede başarılı** tamamlandı; 393 görev çalıştı.

Çıktı ARM64 cihaz/emülatör için, JavaScript paketi içinde bulunan bağımsız bir test/preview APK'sıdır. Android 7.0+ içindir; paket kimliği `com.g221210004.supokedex`, sürüm `1.0.0`. `apksigner verify` başarılıdır. Expo şablonunun debug anahtarıyla imzalanan yerel release yapılandırması kullanıldı; EAS üzerinde üretilmiş veya mağaza imzasına sahip bir sürüm olarak sunulmaz. [Expo yerel release rehberi](https://docs.expo.dev/guides/local-app-production/), [APK rehberi](https://docs.expo.dev/build-reference/apk/).

Emülatöre kurulan APK üzerinde Liste → Detay → Kaydet → Kaydedilenler → Detay, çıkarma, ilk 10/+10, arama ve tamamen kapatıp açarak kayıt kalıcılığı testleri geçti. Fiziksel telefon bağlanmadı; doğrulama yönergenin izin verdiği Android emülatöründe yapıldı.

- [APK indirme bağlantısı](https://github.com/SametAlici/bsm447-odev-g221210004/releases/download/v1.0.0-preview/SuPokedex-G221210004-arm64.apk)
- [43,43 saniyelik ekran kaydı](https://github.com/SametAlici/bsm447-odev-g221210004/releases/download/v1.0.0-preview/SuPokedex-G221210004-demo.mp4)
- [Sürüm ve teslim dosyaları](https://github.com/SametAlici/bsm447-odev-g221210004/releases/tag/v1.0.0-preview)

Üç ekran görüntüsü `screenshots/` içinde ve README tablosundadır. Video gerçek Android ekran kaydıdır; içinde uygulama force-stop edilip yeniden açılır ve kayıt tekrar gösterilir. Uyumluluk için H.264 / 30 fps olarak kodlanan son dosya `ffprobe` ile 43,433333 saniye olarak ölçüldü; tamamı hatasız çözüldü ve örnek kareleri gözden geçirildi.

APK SHA-256: `a4b3a8c2e1c74a529b765c9aed91749ad90587e535a1a6f251e89ba6147707c7`.

## 4. İlk incelemenin geçmiş bulguları

2 Kasım'daki ilk incelemede Doctor **18/20** idi; `expo-font` eksikti ve eski splash alanı geçersizdi. Kayıt modülünde gecikmiş ilk okuma yeni kaydı ezebiliyor, başarısız disk yazısı kaydedilmiş görünebiliyordu. API timeout'u yanıt başlıklarından sonra temizleniyordu. Bu sorunlar önce yeniden üretildi, sonra yukarıdaki düzeltmeler ve testlerle giderildi.

İlk Android JavaScript/Hermes export'u geçmişti; bu sonuç APK üretimi veya kurulumu anlamına gelmiyordu. İlk incelemede ekran görüntüleri, APK ve video bağlantıları yoktu. Bunların güncel hazırlanma durumu 1. ve 3. bölümlerdedir.

İlk `npm audit` taramasında Expo araç zincirinin `glob` / `minimatch` bağımlılıkları üzerinden 11 orta seviye etkilenen bağımlılık kaydı, yüksek/kritik 0 görülmüştü. Bu 11 ayrı kök açık demek değildir. Otomatik öneri büyük SDK sürüm değişimi içerdiğinden zorlayıcı `audit fix` uygulanmadı; bu sayı ilk taramanın geçmiş sonucudur.

K19 kartındaki stat örneği ile kodun ölçeği farklı yazılmıştır: kod `min(değer,150)/150*100` kullanır; 80 değeri %53,3 olur. Değere bağlı yatay çubuk beklentisi uygulanmıştır; PDF'deki 80 → %80 örneği bu ölçeğin aynısı değildir.

## 5. Kurulan 15 günlük GitHub Action

- **Tarih:** 5–19 Kasım 2026 dahil 15 gün. **Saat:** Türkiye 18:17 / UTC 15:17.
- Gerçek Türkiye tarihi, yıl ve `main` dalı kontrol edilir. 19 Kasım'dan sonra rapor commit'i üretilmez; aynı gün ikinci rapor commit'i atılmaz.
- Gerçek bağımlılık kurulumu, Expo ve otomatik test kontrolleri, Android JavaScript export ve canlı PokeAPI sonuçları raporlanır.
- Sonuç `docs/daily-checks/YYYY-MM-DD.md` içine **github-actions[bot]** adıyla commit edilir. Kontrol başarısızsa gerçek hata raporlanır ve çalışma başarısız görünür.
- Manuel `dry_run=true` depoya rapor commit'i yazmaz. Kişisel token eklenmedi; ilgili job `contents:write` yetkili `GITHUB_TOKEN` kullanır.
- GitHub zamanlanmış işleri geciktirebilir veya atlayabilir. [GitHub zamanlama belgesi](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

**Geçmiş kurulum testi:** [41503158626 numaralı dry-run](https://github.com/SametAlici/bsm447-odev-g221210004/actions/runs/41503158626) düzeltmelerden önce çalışmıştı. Kurulum, export ve API geçti; o zamanki Doctor 18/20 sorunları doğru biçimde kırmızı raporlandı. Bu eski sonuç güncel Doctor 20/20 kontrolüyle karıştırılmamalı. [Tarih dışı gerçek mod denemesi](https://github.com/SametAlici/bsm447-odev-g221210004/actions/runs/41502862753) 2 Kasım'da kontrol/commit job'ını başarıyla atladı. İlk gerçek günlük bot commit'i 5 Kasım için planlıdır.

**Güncel başarılı CI:** [41505552849 numaralı çalışma](https://github.com/SametAlici/bsm447-odev-g221210004/actions/runs/41505552849), kaynak commit `d8f87eafcd37714b5a4bb43a1f3f2cf53ef5bc20`. Temiz `npm ci`, 15 test, Expo uyumu, Doctor 20/20, Android export ve canlı API kontrollerinin tamamı geçti; deneme modunda günlük rapor commit'i atılmadı.

Bu bot raporları günlük insan geliştirmesi değildir. Yönerge bot commitlerinin dersin 10 farklı gün koşulunda kabul edileceğini belirtmiyor; kabul koşulu ayrıca takip edilmelidir.

## 6. Teslim takvimi

- **15 Aralık 2026, 23:59:** `G221210004_BSM447.zip` OBİS'e yüklenmeli; `node_modules` ve `.expo` dahil edilmemeli. GitHub bağlantısı OBİS tesliminin yerine geçmez.
- **24 Aralık 2026:** Son hane 4 / çift olduğu için kontrol günü. Saat OBİS randevu listesine bağlı.
- Kodun her satırını ve seçilecek commit'i açıklayabilmek; Ek 3'teki 30 görevden çekileni 2,5 dakikada desteksiz yapmak gerekir.
