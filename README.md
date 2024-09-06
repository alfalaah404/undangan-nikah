# Panduan Instalasi Web Undangan Nikah

Repository ini adalah project iseng saya dalam membuat Web Undangan Nikah yang dilengkapi dengan link generator untuk mempermudah pengiriman undangan. Fitur tersebut akan menggunakan Google Spreadsheet API sebagai pengganti database, termasuk untuk menyimpan ucapan dan do'a yang ada di web. Berikut ini adalah panduan yang akan membantu Anda dalam langkah-langkah instalasi Web Undangan Nikah

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal hal-hal berikut di komputer Anda:

-   PHP >= 8.1
-   Composer
-   Git
-   Server web (contoh: Apache, Nginx)

Pastikan juga Anda membuat 1 Google Spreadsheet dengan 2 Sheet, yang terdiri dari:
1. Sheet "KOMENTAR" dengan kolom: id, nama, pesan, kehadiran, waktu
2. Sheet "SENDER" dengan kolom: nama, alamat, whatsapp

## Langkah 1: Clone Repositori

Pertama, clone repositori ke komputer Anda menggunakan Git.

```bash
git clone https://github.com/alfalaah404/undangan-nikah.git
cd undangan-nikah
```

## Langkah 2: Instalasi Dependencies

Selanjutnya, instal dependencies proyek menggunakan Composer.

```bash
composer install
```

## Langkah 3: Buat File Lingkungan

Buat salinan file `config-example.php` dan ubah namanya menjadi `config.php`.

```bash
cp config-example.php config.php
```

## Langkah 4: Buat API Google Spreadsheet

Silahkan buat API Google Spreadsheet Anda menggunakan panduan dari link berikut:

[https://www.nidup.io/blog/manipulate-google-sheets-in-php-with-api](https://www.nidup.io/blog/manipulate-google-sheets-in-php-with-api)

## Langkah 5: Sesuaikan config.php

Buka dan edit file config.php sesuai dengan kebutuhan Anda.

```bash
# $mode = variable yang berisi string 'local' atau 'production'
# $base_url = variable yang berisi alamat website
# $authConfigFile = variable yang berisi nama file json yang berisi credential API Google
# $spreadsheetId = variable yang berisi ID Google Spreadsheet
```