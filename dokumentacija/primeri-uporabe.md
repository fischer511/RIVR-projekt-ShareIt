# Diagram primerov uporabe

## UML diagram

(UML diagram je priložen v datoteki `uml-diagram.png` v tej mapi.)

### Seznam vseh primerov uporabe

- Registracija: Uporabnik ustvari račun z e-pošto in geslom.
- Prijava: Uporabnik se prijavi v sistem.
- Avtomatska prijava ob ponovnem zagonu: Sistem samodejno prijavi uporabnika, če je seja aktivna.
- Urejanje profila: Uporabnik spremeni ime, sliko ali druge podatke.
- Pregled ponudbe: Prikaz vseh razpoložljivih predmetov za izposojo.
- Iskanje: Filtriranje predmetov po kategoriji, ceni, razdalji.
- Ogled podrobnosti: Prikaz informacij o posameznem predmetu.
- Pošiljanje prošnje za izposojo: Uporabnik izbere predmet in pošlje prošnjo z datumi.
- Izbira datuma: Uporabnik določi časovni okvir izposoje.
- Potrditev ali zavrnitev prošnje: Lastnik potrdi ali zavrne prošnjo.
- Upravljanje izposoj: Pregled aktivnih, potrjenih in zaključenih izposoj.
- Označi kot vrnjeno: Lastnik ali uporabnik označi, da je predmet vrnjen.
- Dodajanje predmeta: Lastnik vnese nov predmet z opisom, fotografijami in lokacijo.
- Urejanje predmeta: Lastnik spremeni podatke obstoječega predmeta.
- Validacija vnosa: Sistem preveri pravilnost podatkov ob registraciji.
- Validacija obveznih polj: Sistem preveri, ali so vsa polja pri dodajanju predmeta izpolnjena.
- Nalaganje slik: Sistem shrani fotografije predmeta.
- Pridobivanje lokacije: Sistem pridobi GPS lokacijo ali omogoči ročni vnos.
- Preverjanje obstoječega uporabnika: Sistem preveri, ali uporabnik že obstaja ob prijavi.
- Push obvestila: Sistem pošilja obvestila o prošnjah, potrditvah, vračilih itd.

### Opis UML diagrama

#### Akterji
- **Neregistriran uporabnik**: Lahko pregleda ponudbo, išče predmete, gleda podrobnosti in se registrira.
- **Registriran uporabnik**: Ima vse pravice neregistriranega uporabnika, poleg tega pa lahko dodaja predmete, pošilja prošnje za izposojo, označi predmet kot vrnjen, upravlja izposoje, ureja profil in predmete, potrjuje ali zavrača prošnje.
- **Lastnik predmeta**: Posebna vloga registriranega uporabnika, ki je lastnik določenega predmeta. Lahko upravlja izposoje in potrjuje/zavrača prošnje.
- **Sistem**: Skrbi za validacijo vnosa, validacijo obveznih polj, avtomatsko prijavo, push obvestila, preverjanje obstoječega uporabnika ipd.

#### Glavni primeri uporabe (use cases)
- Registracija
- Prijava (vključuje preverjanje obstoječega uporabnika)
- Avtomatska prijava ob ponovnem zagonu
- Pregled ponudbe
- Iskanje
- Ogled podrobnosti
- Dodajanje predmeta (vključuje nalaganje slik, pridobivanje lokacije, validacijo obveznih polj)
- Urejanje predmeta
- Urejanje profila
- Pošiljanje prošnje za izposojo (vključuje izbiro datuma)
- Potrditev ali zavrnitev prošnje
- Upravljanje izposoj (razširja pošiljanje prošnje za izposojo)
- Označi kot vrnjeno
- Push obvestila (razširja več primerov uporabe)
- Validacija vnosa

#### Povezave med primeri uporabe
- **<<include>>** povezave:
  - Prijava vključuje preverjanje obstoječega uporabnika
  - Pošiljanje prošnje za izposojo vključuje izbiro datuma
  - Dodajanje predmeta vključuje nalaganje slik, pridobivanje lokacije, validacijo obveznih polj
- **<<extend>>** povezave:
  - Upravljanje izposoj razširja pošiljanje prošnje za izposojo
  - Push obvestila razširjajo več primerov uporabe (npr. upravljanje izposoj, potrjevanje/zavračanje prošenj)
- **Neposredne povezave**:
  - Akterji so povezani s primeri uporabe, ki jih lahko izvajajo (npr. registriran uporabnik lahko dodaja predmet, pošilja prošnje, ureja profil itd.)
  - Sistem je povezan s primeri uporabe, kjer je potrebna avtomatizacija ali validacija.

---

## Opis primerov uporabe

### Registracija
Uporabnik ustvari nov račun z vnosom e-pošte in gesla. Sistem preveri pravilnost podatkov in ustvari uporabniški profil.

### Prijava
Uporabnik vnese e-pošto in geslo ter se prijavi v sistem. Sistem preveri, ali uporabnik obstaja in ali so podatki pravilni.

### Avtomatska prijava ob ponovnem zagonu
Če je seja še aktivna, sistem ob ponovnem zagonu aplikacije samodejno prijavi uporabnika brez ponovnega vnosa podatkov.

### Urejanje profila
Uporabnik lahko spremeni svoje podatke, kot so ime, slika profila ali kontaktni podatki. Spremembe se shranijo v bazo.

### Pregled ponudbe
Uporabnik vidi seznam vseh predmetov, ki so na voljo za izposojo.

### Iskanje
Uporabnik lahko filtrira predmete po kategoriji, ceni ali razdalji od svoje lokacije.

### Ogled podrobnosti
Ob kliku na predmet se prikažejo vse podrobnosti: opis, slike, cena, lokacija, razpoložljivost, lastnik.

### Pošiljanje prošnje za izposojo
Uporabnik izbere predmet, določi datume izposoje in pošlje prošnjo lastniku predmeta.

### Izbira datuma
Uporabnik izbere časovni okvir (od-do), v katerem želi izposoditi predmet. Nedostopni datumi so onemogočeni.

### Potrditev ali zavrnitev prošnje
Lastnik prejme prošnjo in jo lahko potrdi ali zavrne. O tem je obveščen tudi izposojevalec.

### Upravljanje izposoj
Uporabnik ima pregled nad vsemi svojimi izposojami (aktivne, potrjene, zaključene) in lahko izvaja akcije (preklic, označi kot vrnjeno).

### Označi kot vrnjeno
Ko uporabnik vrne predmet, lahko to označi v sistemu. Lastnik potrdi vračilo in izposoja se zaključi.

### Dodajanje predmeta
Lastnik vnese nov predmet, doda opis, slike, določi ceno, lokacijo in razpoložljivost. Sistem preveri, ali so vsa polja izpolnjena.

### Urejanje predmeta
Lastnik lahko kadarkoli spremeni podatke o svojem predmetu (opis, slike, cena, razpoložljivost).

### Validacija vnosa
Sistem preveri pravilnost vnesenih podatkov (npr. format e-pošte, moč gesla) ob registraciji ali prijavi.

### Validacija obveznih polj
Sistem preveri, ali so vsa obvezna polja pri dodajanju ali urejanju predmeta izpolnjena.

### Nalaganje slik
Uporabnik lahko doda slike predmeta, ki jih sistem shrani v oblak in poveže s predmetom.

### Pridobivanje lokacije
Sistem samodejno pridobi GPS lokacijo uporabnika ali omogoči ročni vnos naslova pri dodajanju predmeta.

### Preverjanje obstoječega uporabnika
Ob registraciji ali prijavi sistem preveri, ali uporabnik z vneseno e-pošto že obstaja.

### Push obvestila
Sistem pošilja obvestila uporabnikom ob pomembnih dogodkih (nova prošnja, potrjena/zavrnjena prošnja, predmet vrnjen).
