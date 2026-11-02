# Su Pokédex · BSM447 Dönem Ödevi

React Native + Expo ile yazılmış, üç ekranlı (Liste → Detay → Kaydedilenler) mobil uygulama.

| | |
|---|---|
| **Ad Soyad** | Samet Alıcı |
| **Öğrenci no** | G221210004 |
| **Konu** | K19 · Pokédex (PokeAPI) |
| **Varyant** | b · Su — `https://pokeapi.co/api/v2/type/water` |
| **Ek kural** | 6 · 10'ar 10'ar gösterme |
| **Kalıcı veri yöntemi** | AsyncStorage (`@react-native-async-storage/async-storage`) |

## Özellikler

- **Liste:** Su türündeki Pokémon'lar uygulama çalışırken PokeAPI'den `fetch` + `useEffect` ile çekilir ve `FlatList` ile gösterilir (`keyExtractor` = `name`). Üstteki arama kutusu büyük/küçük harfe duyarsız süzer.
- **Ek kural 6 – 10'ar 10'ar gösterme:** İlk 10 kayıt görünür; listenin sonuna kaydırınca ya da **"Daha fazla"** düğmesine basınca 10 kayıt daha eklenir. Arama değişince yeniden ilk 10 kayıttan başlanır.
- **Detay:** Kayıt `route.params` ile gelir; ikinci istek `pokemon/{name}` ile resim, boy, ağırlık ve istatistikler alınır. Her istatistik, değere bağlı genişlikte yatay bir çubukla gösterilir (en çok 150 = %100). "Kaydet / Kaydedilenlerden çıkar" düğmesi bu ekrandadır.
- **Kaydedilenler:** AsyncStorage'da saklanır; uygulama kapatılıp açılınca yerinde durur.
- Yükleniyor göstergesi ve internet yokken "Tekrar dene" düğmesi.
- **Navigasyon:** Bottom Tab (Liste, Kaydedilenler) + Native Stack (Detay sekmelerin üstünde açılır).

## Proje yapısı

```
App.js                      Navigasyon (Stack + Bottom Tab)
src/api.js                  PokeAPI istekleri ve yardımcı fonksiyonlar
src/SavedContext.js         Kaydedilenler + AsyncStorage
src/savedStore.js           İlk okuma, sıralı yazma ve depolama hata yönetimi
src/components/PokemonRow.js
src/screens/ListScreen.js
src/screens/DetailScreen.js
src/screens/SavedScreen.js
```

## Çalıştırma

```bash
npm ci
npm test
npx expo-doctor
npx expo start
```

## Android APK

[APK'yı indir (ARM64)](https://github.com/SametAlici/bsm447-odev-g221210004/releases/download/v1.0.0-preview/SuPokedex-G221210004-arm64.apk). Android 7.0 ve üzeri ARM64 cihazlar içindir; Expo Go veya Metro sunucusu gerektirmez.

Paylaşılan APK yerelde release olarak derlenmiş, Expo şablonunun test anahtarıyla imzalanmış bir önizleme sürümüdür. Mağaza dağıtımı için ayrı imzalama gerekir. Kaynak projeden aynı tür APK üretmek için JDK 21, Android SDK 37.0, Build Tools 37.0.0 ve NDK 27.1.12297006 kurulu olmalıdır:

```bash
npm ci
npx expo prebuild --platform android --no-install
cd android
./gradlew app:assembleRelease -PreactNativeArchitectures=arm64-v8a --no-daemon
```

Çıktı: `android/app/build/outputs/apk/release/app-release.apk`.

EAS hesabıyla bulutta üretim alternatifi: `eas build -p android --profile preview`. Bu depoda paylaşılan APK yerelde üretilmiştir.

## Ekran görüntüleri

| Liste | Detay | Kaydedilenler |
|---|---|---|
| ![Liste](screenshots/liste.png) | ![Detay](screenshots/detay.png) | ![Kaydedilenler](screenshots/kaydedilenler.png) |

## Bağlantılar

- **APK:** [Su Pokédex Android ARM64](https://github.com/SametAlici/bsm447-odev-g221210004/releases/download/v1.0.0-preview/SuPokedex-G221210004-arm64.apk)
- **Ekran kaydı (43 saniye):** [Liste, Detay, Kaydedilenler ve kapatıp açınca kalıcılık](https://github.com/SametAlici/bsm447-odev-g221210004/releases/download/v1.0.0-preview/SuPokedex-G221210004-demo.mp4)
- **Sürüm ve dosyalar:** [v1.0.0-preview](https://github.com/SametAlici/bsm447-odev-g221210004/releases/tag/v1.0.0-preview)
- **OBİS için ZIP:** [G221210004_BSM447.zip](https://github.com/SametAlici/bsm447-odev-g221210004/releases/download/v1.0.0-preview/G221210004_BSM447.zip) — kaynak proje, üç ekran görüntüsü, APK ve video; `node_modules` ve `.expo` içermez.

Ekran görüntüleri ve video, Android 35 emülatörüne kurulmuş bağımsız APK'dan alınmıştır.

## Kontrol durumu ve günlük otomasyon

2 Kasım 2026 düzeltmeleri sonrasında **Expo Doctor 20/20**, **otomatik testler 15/15** geçti. Temiz kurulum, testler, Doctor, Android export ve canlı API kontrolleri [GitHub Actions üzerinde de başarılı](https://github.com/SametAlici/bsm447-odev-g221210004/actions/runs/41505552849). Native APK ve emülatör doğrulamaları [kontrol raporunda](docs/KONTROL_RAPORU.md) açıklanmıştır.

[Günlük GitHub Action](https://github.com/SametAlici/bsm447-odev-g221210004/actions/workflows/daily-check.yml), **5–19 Kasım 2026 dahil 15 gün, Türkiye saati 18:17** için ayarlıdır. Gerçek bağımlılık kurulumu, API/kayıt/tarih testleri, Expo uyumu, Expo Doctor, Android JavaScript export ve canlı PokeAPI kontrollerini yapar; sonucu `docs/daily-checks/YYYY-MM-DD.md` dosyasına **github-actions[bot]** olarak commit eder. Hatalı kontrol de rapora yazılır ve Actions ekranında başarısız gösterilir. Aynı gün ikinci rapor commit'i oluşturulmaz; tarih aralığı dışında commit atılmaz.

Actions → **15 günlük gerçek kontrol raporu** → **Run workflow** → `dry_run=true` ile depoya rapor commit'i yazmadan denenebilir. Zamanlanmış çalışmalarda kişisel erişim anahtarı gerekmeksizin deponun `GITHUB_TOKEN` yetkisi kullanılır. GitHub zamanlaması gecikebilir veya bir çalıştırmayı atlayabilir; sonuçlar Actions ekranından takip edilmelidir.

Bu kayıtlar otomatik teknik kontrol raporlarıdır. İnsan tarafından yapılan günlük geliştirme olarak sunulmaz; dersin farklı günlerde commit koşulunda kabul edileceğine dair bir garanti yoktur. Yönergenin istediği en az 10 farklı gündeki anlamlı geliştirme çalışmalarını ayrıca takip edin.
