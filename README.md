<p align="center">
    <a href="https://kenndeclouv.rf.gd">
    <img src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0b5061df29d55a92d945_full_logo_blurple_RGB.svg" border="0" width="400" style="margin:0 auto; border-radius: 10px">
    </a>
</p>
<br />
<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/KennDeClou/kenndeclouv-discord-bot">
  </a>

  <h3 align="center">Kenndeclouv Discord Bot</h3>
  <p align="center">
    <a href="https://github.com/KennDeClouv/kenndeclouv-discord-bot/issues">Report Bug</a>
    ·
    <a href="https://github.com/KennDeClouv/kenndeclouv-discord-bot/issues">Request Feature</a>
  </p>
</p>


## 📖 Overview

[![Readme Card](https://github-readme-stats.vercel.app/api/pin/?username=KennDeClouv&repo=kenndeclouv-discord-bot&theme=tokyonight)](https://github.com/KennDeClouv) <br/>
Discord Bot Leveling System adalah bot yang dirancang untuk memberikan pengalaman interaktif dengan sistem leveling. Pengguna akan mendapatkan XP setiap kali mereka mengirim pesan, dengan hadiah berupa role khusus setiap mencapai level tertentu.

## 📃 Features

- [x] **Moderation**: Perintah slash command untuk moderation seperti kick, ban, dan lainnya.
- [x] **Slash Command**: Perintah slash command untuk mengatur bot.
- [x] **Giveaway**: Perintah slash command untuk giveaway.
- [x] **Automod**: Perintah slash command untuk automod.
- [x] **Leveling System**: Dapatkan XP berdasarkan aktivitas di channel.
- [x] **Cooldown XP**: Batasi pemberian XP dengan jeda waktu 1 menit.
- [x] **Role Rewards**: Berikan role spesial sebagai hadiah di level tertentu.
- [x] **Welcome Message**: Pesan welcome untuk member baru.
- [x] **Economy**: Perintah slash command untuk economy seperti bank kerja, shop, dan lainnya.
- [x] **Customizable**: Konfigurasi sesuai kebutuhan.

## ⚙️ Prerequisites

Sebelum menjalankan bot ini, pastikan kamu sudah memiliki:

1. **Node.js** (Versi terbaru)
2. **npm** (biasanya terinstal bersama Node.js)
3. Token bot Discord dari [Discord Developer Portal](https://discord.com/developers/applications).
4. **Discord.js** library terinstal.
5. **MySQL** database terinstal.

## 📖 Tutorial Instalasi Discord Bot Leveling System

## 1. Siapkan Prasyarat

pastikan kamu sudah menginstal software berikut:

1. **Node.js**

   - unduh [node.js](https://nodejs.org/) dan instal di komputer kamu.
   - cek instalasi dengan perintah berikut di terminal:
     ```bash
     node -v
     npm -v
     ```
     jika versi node.js dan npm muncul, berarti instalasi berhasil.

2. **Git**

   - unduh dan instal [git](https://git-scm.com/).
   - cek instalasi dengan:
     ```bash
     git --version
     ```

3. **Token Discord Bot**
   - buka [discord developer portal](https://discord.com/developers/applications).
   - klik tombol **new application**, beri nama bot, dan buat.
   - navigasi ke tab **bot**, klik **add bot**, lalu salin token bot.

## 2. Clone Repository

1. buka terminal atau command prompt.
2. pindah ke folder tempat kamu ingin menyimpan bot:
   ```bash
   cd path/to/your/folder
   ```
3. clone repository:
   ```bash
   git clone https://github.com/KennDeClouv/kenndeclouv-discord-bot.git
   cd kenneclouv-discord-bot
   ```

## 3. Install Dependencies

1. pastikan kamu berada di dalam folder bot.
2. jalankan perintah berikut untuk menginstal library yang dibutuhkan:
   ```bash
   npm install
   ```
3. tunggu sampai semua dependensi selesai terinstal.


## 4. Setup File Environment

1. buat file `.env` di folder root proyek.
2. tambahkan konfigurasi berikut:

   ```env
   # BOT SETTINGS
   DISCORD_BOT_NAME=bot-name
   DISCORD_BOT_DESCRIPTION=bot-description.
   DISCORD_BOT_TOKEN=your-bot-token
   DISCORD_BOT_CLIENT_ID=bot-application-id
   DISCORD_ADMIN_ROLE_ID=admin-role-id
   PREFIX=/

   # MYSQL DATABASE
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=discord_bot

   # SETTINGS
   DISCORD_BOT_STATUS=online
   DISCORD_BOT_ACTIVITY=Genshin Impact

   # COMMANDS
   AUTOMOD_ON=true
   ECONOMY_ON=true
   GIVEAWAY_ON=true
   INVITES_ON=true
   MODERATION_ON=true
   SUGGESTION_ON=true
   TICKET_ON=true
   UTILITY_ON=true

   # LEVELING
   LEVELING_ON=true
   LEVELING_CHANNEL=leveling-channel-id
   LEVELING_COOLDOWN=0
   LEVELING_XP=15

   # WELCOME
   WELCOME_IN_ON=true
   WELCOME_IN_CHANNEL_ID=welcome-channel-id
   WELCOME_OUT_ON=true
   WELCOME_OUT_CHANNEL_ID=welcome-channel-id

   # CHANNELS
   STARTUP=true
   HOME_CHANNEL=home-channel-id
   RULES_CHANNEL=rules-channel-id
   ROLEINFO_CHANNEL=roleinfo-channel-id
   ADDROLES_CHANNEL=addroles-channel-id
   ```

   **keterangan**:

   - `DISCORD_BOT_NAME`: nama bot kamu
   - `DISCORD_BOT_DESCRIPTION`: deskripsi singkat tentang bot kamu
   - `DISCORD_BOT_TOKEN`: token bot discord kamu
   - `DISCORD_BOT_CLIENT_ID`: id aplikasi bot kamu
   - `DISCORD_ADMIN_ROLE_ID`: id role admin di server kamu
   - `PREFIX`: prefix untuk command bot, default '/'
   - `DB_HOST`: host database, biasanya 'localhost'
   - `DB_USER`: user untuk koneksi ke database
   - `DB_PASSWORD`: password database user
   - `DB_NAME`: nama database yang akan digunakan bot
   - `DISCORD_BOT_STATUS`: status bot, pilih 'online', 'idle', 'dnd', atau 'invisible'
   - `DISCORD_BOT_ACTIVITY`: teks aktivitas bot yang ditampilkan
   - `AUTOMOD_ON`: atur ke `true` untuk mengaktifkan automod
   - `ECONOMY_ON`: atur ke `true` untuk mengaktifkan sistem ekonomi
   - `GIVEAWAY_ON`: atur ke `true` untuk mengaktifkan giveaway
   - `INVITES_ON`: atur ke `true` untuk mengaktifkan sistem invite tracking
   - `MODERATION_ON`: atur ke `true` untuk mengaktifkan fitur moderasi
   - `SUGGESTION_ON`: atur ke `true` untuk mengaktifkan sistem saran
   - `TICKET_ON`: atur ke `true` untuk mengaktifkan sistem tiket
   - `UTILITY_ON`: atur ke `true` untuk mengaktifkan perintah utilitas
   - `LEVELING_ON`: atur ke `true` untuk mengaktifkan sistem leveling
   - `LEVELING_CHANNEL`: id channel untuk mengirim pesan level up
   - `LEVELING_COOLDOWN`: cooldown dalam detik antara mendapatkan xp, atur ke 0 untuk menonaktifkan
   - `LEVELING_XP`: jumlah xp yang didapat per pesan
   - `WELCOME_IN_ON`: atur ke `true` untuk mengaktifkan pesan selamat datang
   - `WELCOME_IN_CHANNEL_ID`: id channel untuk mengirim pesan selamat datang
   - `WELCOME_OUT_ON`: atur ke `true` untuk mengaktifkan pesan selamat tinggal
   - `WELCOME_OUT_CHANNEL_ID`: id channel untuk mengirim pesan selamat tinggal
   - `STARTUP`: atur ke `true` jika ingin mengirim pesan startup saat bot dinyalakan (CHANNEL DIBAWAH INI HARUS ADA JIKA STARTUP TRUE)
   - `HOME_CHANNEL`: id channel untuk mengirim pesan home
   - `RULES_CHANNEL`: id channel untuk mengirim pesan peraturan
   - `ROLEINFO_CHANNEL`: id channel untuk mengirim pesan info role
   - `ADDROLES_CHANNEL`: id channel untuk mengirim pesan menambahkan role


## 5. Jalankan Bot

1. pastikan semua konfigurasi sudah benar.
2. jalankan perintah berikut untuk memulai bot:
   ```bash
   node index.js
   ```
3. jika bot berhasil berjalan, akan muncul pesan seperti:
   ```bash
   kenndeclouv#1234 terhubung!
   ```
4. lihat di terminal apakah ada error atau tidak.
5. jika tidak ada error, bot sudah berjalan dan siap digunakan.
6. jika ada error, cek di file yang bersangkutan.
7. pencet ctrl + c untuk menghentikan bot.


## 6. Undang Bot ke Server

1. kembali ke [discord developer portal](https://discord.com/developers/applications).
2. pilih aplikasi bot kamu, lalu buka tab **OAuth2** > **URL Generator**.
3. centang `bot` di scopes dan tambahkan permission yang dibutuhkan (misal: ``, `Manage Roles`, `Send Messages`).
4. salin url yang dihasilkan, lalu buka di browser untuk mengundang bot ke server kamu.

## 7. Tes Bot

1. buka server discord tempat bot sudah diundang.
2. /ping untuk melihat ping bot.
3. selamat menggunakan bot!

dikembangkan dengan 💘 oleh [kenndeclouv](https://kenndeclouv.rf.gd), original dari [itz-princeyt336](https://github.com/itz-princeyt336)