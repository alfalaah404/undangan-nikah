# Panduan Instalasi Web Undangan Nikah

Panduan ini akan membantu Anda dalam langkah-langkah instalasi Web Undangan Nikah

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal hal-hal berikut di komputer Anda:

-   PHP >= 8.1
-   Composer
-   Git
-   Server web (contoh: Apache, Nginx)

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