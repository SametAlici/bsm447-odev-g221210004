# G221210004 ödev kontrol raporu

**İnceleme tarihi:** 2 Kasım 2026, Türkiye saati. **Sonuç:** Atanan uygulama doğru; temel kod büyük ölçüde mevcut, fakat proje henüz teslime hazır değil.

Kaynak: Kullanıcının sağladığı `BSM447_Donem_Odevi.pdf`; genel koşullar s.1–2, atama s.4, K19 kartı s.12. PDF değerlendirme ölçütü olarak okundu. İncelenen başlangıç commit'i: `a823df00ec3603192d1b03ffd9a549eb730a5ac9`.

## 1. Sana atanan görev ve mevcut uygulama

**G221210004 → K19 Pokédex → b / Su → Ek kural 6 / 10'ar 10'ar gösterme.**

| Koşul | Sonuç | Kanıt / sınır |
|---|---|---|
| Doğru konu, varyant ve API | Uygun | `src/api.js`: `https://pokeapi.co/api/v2/type/water` |
| Çalışırken fetch + useEffect | Kodda mevcut | `src/screens/ListScreen.js`; canlı API isteği ayrıca başarılı |
| FlatList ve keyExtractor | Uygun | Liste ve Kaydedilenler anahtarı `name` |
| Büyük/küçük harfe duyarsız arama | Kodda uygun | `toLowerCase()` ve `trim()` |
| İlk 10, sonra +10 | Kodda mevcut | `PAGE_SIZE=10`, Daha fazla ve `onEndReached`; cihaz kenar durumu aşağıda |
| Bottom Tab + Stack | Kodda uygun | `App.js`: Liste/Kaydedilenler sekmeleri, üstte Detay |
| Seçilen kaydın route.params ile aktarımı | Uygun | Liste ve Kaydedilenler → Detay |
| Detay için ikinci istek | Uygun | `pokemon/{name}`; görsel, boy, ağırlık, stats |
| Değere bağlı yatay istatistik çubukları | Mevcut; ölçek açıklığa kavuşturulmalı | Kod 150'yi %100 alıyor; PDF örneğiyle fark aşağıda |
| Detaydan kaydet/çıkar | Kodda mevcut | `src/screens/DetailScreen.js` |
| AsyncStorage kalıcılığı | Uygulanmış; veri kaybı riski var | Açılış ve yazma hataları aşağıda |
| Özgün ad ve simge | Uygun | Su Pokédex; damla ve DEX yazılı özel simge görsel olarak incelendi |
| Expo Go ile telefon uyumu | Doğrulanamadı | Bağlı telefon/açık emülatör yok |
| Public depo, doğru depo adı | Uygun | `SametAlici/bsm447-odev-g221210004`, `main` |
| node_modules / .expo depoda yok | Uygun | `.gitignore` ve takip edilen dosyalar kontrol edildi |
| README kimlik, konu, varyant, ek kural ve kalıcı veri yöntemi | Uygun | README üst tablosu |
| README 3 ekran görüntüsü | Eksik | `screenshots/liste.png`, `detay.png`, `kaydedilenler.png` dosyaları yok |
| APK ve README APK bağlantısı | Eksik / doğrulanamadı | `eas.json` preview APK ayarı var; APK/gerçek link yok |
| Üç ekranı gösteren en fazla 1 dk video | Eksik | README bağlantısı yer tutucu |
| En az 10 farklı günde en az 10 commit | Henüz sağlanmıyor | İnceleme başında 2 commit, ikisi de 2 Kasım; kabul aralığı 5 Kasım–15 Aralık |
| OBİS ZIP teslimi | Doğrulanamadı | OBİS'e erişilmedi, teslim yapılmadı |

## 2. Çalıştırılan doğrulamalar

| Kontrol | Sonuç |
|---|---|
| `npx expo install --check` | Geçti: bağımlılık sürümleri SDK 58.0.22 ile uyumlu |
| `npx expo-doctor` | **18/20**, iki sorun: geçersiz `expo.splash` ve eksik `expo-font` peer bağımlılığı |
| `npx expo export --platform android --output-dir /tmp/bsm447-audit-android` | Geçti: 961 modül, yaklaşık 2.4 MB Hermes bundle |
| Temiz kopyada `npm ci` ve günlük kontrol script'i | Kurulum, Expo uyumu, Android export ve API geçti; Doctor başarısızlığı doğru raporlandı |
| Canlı PokeAPI | HTTP 200, inceleme anında 192 su Pokémon'u; örnek detay alanları doğrulandı |
| AsyncStorage hata senaryoları | Gerçek kaynak, mock React/AsyncStorage ile çalıştırıldı; aşağıdaki iki hata tekrar üretildi |
| API zaman aşımı senaryosu | Gerçek kaynak, mock fetch/timer ile çalıştırıldı; gövde bekleyişinin timeout dışında kaldığı doğrulandı |
| `npm audit --json` | 11 orta seviye etkilenen bağımlılık kaydı; yüksek/kritik 0. Kayıtlar `glob` / `minimatch` üzerinden Expo araç zincirine yayılıyor; bu 11 ayrı kök açık anlamına gelmez |
| `npx --yes eas-cli whoami` | `Not logged in`; yerelde EAS oturumu yok |
| Workflow sözdizimi ve tarih testleri | `actionlint` ve üç tarih/dry-run testi geçti |

**Android export, APK üretildiğinin veya telefonda çalıştığının kanıtı değildir.** Cihazda görsel yerleşim, dokunma/navigasyon, interneti kapatma ve uygulamayı tamamen kapatıp açarak kalıcılık testleri henüz yapılmadı.

## 3. Düzeltilmesi gerekenler

1. **Expo Doctor sorunları:** `app.json:9` içindeki eski `expo.splash` alanı SDK 58 şemasında kabul edilmiyor. Splash yapılandırması desteklenen `expo-splash-screen` config plugin düzenine taşınmalı. `package.json` içinde `@expo/vector-icons` için gerekli `expo-font` doğrudan bağımlılığı eksik; Expo Go dışındaki kurulumda sorun çıkarabilir. Kurulu SDK'nın beklediği sürümler `expo-font ~58.0.11`, `expo-splash-screen ~58.0.12`; düzeltmeden sonra Doctor ve APK tekrar doğrulanmalı.

2. **Açılışta kayıt kaybı / tutarsızlık:** `src/SavedContext.js:15` okuma tamamlanmadan kayıt eklenmesine izin veriyor. Tekrar üretim: diskten eski `[squirtle]` okunması geciktirildi; bu sırada `psyduck` eklendi. Disk `[psyduck]` oldu; eski okuma gelince arayüz `[squirtle]` oldu. Eski kaydın diskte kaybı ve arayüz/disk tutarsızlığı oluştu. İlk okuma tamamlanana kadar işlemler bekletilmeli veya değişiklikler güvenle birleştirilmeli.

3. **Başarısız yazma kaydedilmiş görünüyor:** `src/SavedContext.js:25` yazmayı beklemiyor ve hata yakalamıyor. Disk dolu hatası simüle edildiğinde `isSaved=true`, diskte kayıt yok ve yakalanmamış Promise hatası oluştu. `getItem`, `JSON.parse` ve `setItem` için hata yönetimi, veri şekli kontrolü ve kullanıcıya başarısızlık bildirimi gerekli.

4. **15 saniyelik timeout yalnız yanıt başlıklarını kapsıyor:** `src/api.js:12` fetch biter bitmez timer temizleniyor; `response.json()` sonraki satırlarda okunuyor. Başlıklar gelip JSON gövdesi bekletildiğinde aktif timer kalmadığı ve isteğin iptal edilmediği tekrar üretildi. Fetch ve JSON okuması aynı zaman aşımı kapsamında olmalı.

5. **Arama sonrası sayfalama kenar durumu:** `src/screens/ListScreen.js:43` arama değişirken `userScrolled.current` sıfırlanmıyor. Önceden kaydırma bayrağı kaldıysa yeni aramanın `onEndReached` olayı ilk 10'u hemen 20'ye çıkarabilir. Bu statik inceleme bulgusudur; cihazda tekrar üretilmedi.

6. **İstatistik çubuğu ölçeği:** `src/screens/DetailScreen.js` değeri `min(değer,150)/150*100` ile oranlıyor; 80 → %53,3. PDF s.12 örneğinde 80 → %80 deniyor; ayrıca en çok 150 ifadesi var. Çubukların değere bağlı olması karşılanıyor, fakat örnekle aynı ölçek kullanılmıyor. Değerlendirmede beklenen ölçek öğretim elemanından netleştirilmeli.

7. **Teslim kanıtları:** Gerçek telefondan/emülatörden üç ekran görüntüsü, kurulan APK'nın bağlantısı ve üç ekranı gösteren en fazla bir dakikalık video README'ye eklenmeli. Yer tutucular teslim kanıtı değildir.

Bağımlılık denetimindeki orta seviye kayıtlar SDK uyumunu koruyan güncellemelerle ayrıca incelenmeli. `npm audit` önerisi bu ortamda Expo 51'e büyük sürüm değişimi içeriyor; otomatik zorlayıcı düzeltme uygulanmadı.

## 4. Kurulan 15 günlük GitHub Action

Dosyalar: `.github/workflows/daily-check.yml`, `scripts/daily-check.mjs`, `scripts/daily-window.mjs`, `scripts/daily-window.test.mjs`.

- **Tarih:** 5–19 Kasım 2026 dahil 15 gün. **Saat:** Türkiye 18:17 / UTC 15:17.
- Yıl, gerçek Türkiye tarihi ve `main` dalı kontrol edilir; 19 Kasım'dan sonra rapor commit'i üretilmez.
- Gerçek `npm ci`, Expo sürüm kontrolü, Expo Doctor, Android JavaScript export ve canlı su listesi + detay isteği yapılır.
- Sonuç `docs/daily-checks/YYYY-MM-DD.md` içine **github-actions[bot]** adıyla kaydedilir. Kontrol başarısız olsa da gerçek başarısızlık raporlanır; workflow kırmızı olur.
- Aynı güne ikinci rapor commit'i atılmaz. Tarih geri alınmaz, boş commit oluşturulmaz, uygulama kodu her gün yapay olarak değiştirilmez.
- Manuel `dry_run=true` yalnız kontrolleri çalıştırır; günlük raporu depoya commit etmez.
- Kişisel token/secrets eklenmedi; yalnız ilgili job için `contents:write` yetkili `GITHUB_TOKEN` kullanılır.
- GitHub zamanlanmış işleri geciktirebilir veya atlayabilir. 15 gelecekteki çalışmanın şimdiden tamamlandığı ya da her gün kesin çalışacağı iddia edilemez. [GitHub zamanlama belgesi](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

**Bu bot raporları günlük insan geliştirmesi değildir. Yönergede bot commitlerinin ders koşulunda kabul edileceği belirtilmiyor. En az 10 farklı günde anlamlı geliştirme commit'i koşulunun karşılandığı ayrıca doğrulanmalıdır.**

**GitHub üzerinde doğrulandı:** [Son dry-run çalışması](https://github.com/SametAlici/bsm447-odev-g221210004/actions/runs/41503158626) Node 24 tabanlı güncel Actions sürümleriyle tamamlandı. `npm ci`, Expo uyumu, Android export ve PokeAPI geçti; Expo Doctor 18/20 ile aynı iki sorunu yakaladı. Workflow bu mevcut uygulama sorunları nedeniyle bilinçli olarak başarısız/kırmızı sonuçlandı. Deneme modunda commit adımı atlandı; günlük rapor depoya yazılmadı. Çalıştırıcı günlüğünde `Contents: write` yetkisi de doğrulandı.

[Tarih dışında gerçek mod denemesi](https://github.com/SametAlici/bsm447-odev-g221210004/actions/runs/41502862753) başarılı: 2 Kasım'da pencere kontrolü tam kontrol/commit job'ını atladı. İlk gerçek günlük bot commit'i 5 Kasım için planlıdır; henüz gerçekleşmiş bir işlem olarak sunulmaz.

## 5. Teslim takvimi ve son kontrol

- **15 Aralık 2026, 23:59:** `G221210004_BSM447.zip` OBİS'e yüklenmeli; `node_modules` ve `.expo` dahil edilmemeli. Depo bağlantısı OBİS tesliminin yerine geçmez.
- **24 Aralık 2026:** Son hane 4 / çift olduğundan kontrol günü bu tarih. Saat, OBİS randevu listesine bağlı.
- Telefonda Liste → Detay → Kaydet → Kaydedilenler → Detay akışını, çıkarma işlemini ve uygulamayı kapatıp açınca kaydın korunmasını dene.
- İlk 10 kayıt, +10, büyük/küçük harfli arama, sonuç bulunamaması ve internet yokken tekrar deneme davranışını göster.
- Kodun her satırını ve seçilecek commit'i açıklayabil; Ek 3'teki 30 görevden çekilen görevi 2,5 dakikada desteksiz yapmaya hazırlan.

Bu inceleme uygulama kaynaklarını ve bağımlılıklarını değiştirmedi; eklenenler kontrol raporu, otomasyon ve açıklamalarıdır.
