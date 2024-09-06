
<?php
date_default_timezone_set('Asia/Jakarta');

require 'vendor/autoload.php';

use Google\Client;
use Google\Service\Sheets;
use Google\Service\Sheets\ValueRange;

class GoogleSheetHelper
{
    private $client;
    private $service;
    private $spreadsheetId;

    public function __construct($authConfigFile, $spreadsheetId)
    {
        $this->client = new Client();
        $this->client->setApplicationName('Google Sheet API');
        $this->client->setScopes([Sheets::SPREADSHEETS]);
        $this->client->setAuthConfig($authConfigFile);
        $this->client->setAccessType('offline');

        // disable ssl verification
        $this->client->setHttpClient(new GuzzleHttp\Client(['verify' => false]));

        $this->service = new Google\Service\Sheets($this->client);
        $this->spreadsheetId = $spreadsheetId;
    }

    public function readSheet($sheetName)
    {
        $range = $sheetName;
        $response = $this->service->spreadsheets_values->get($this->spreadsheetId, $range);
        $rows = $response->getValues();

        // Remove the first one that contains headers
        $headers = array_shift($rows);
        // Pastikan jumlah kolom sama dengan jumlah header
        $rows = array_filter($rows, function ($row) use ($headers) {
            return count($row) === count($headers);
        });
        // Combine the headers with each following row
        $array = [];
        foreach ($rows as $row) {
            $array[] = array_combine($headers, $row);
        }

        return $array;
    }

    public function writeRow($sheetName, $newRow)
    {
        $range = $sheetName;
        $rows = [$newRow]; // you can append several rows at once
        $valueRange = new ValueRange();
        $valueRange->setValues($rows);
        $options = ['valueInputOption' => 'USER_ENTERED'];
        $this->service->spreadsheets_values->append($this->spreadsheetId, $range, $valueRange, $options);
    }

    // di sini ada kolom id, nama, pesan, kehadiran, dan waktu
    // fungsi untuk mencari id terakhir
    public function getLastId($sheetName)
    {
        $array = $this->readSheet($sheetName);
        $lastId = 0;
        foreach ($array as $row) {
            $lastId = $row['id'];
        }

        return $lastId;
    }

    // fungsi untuk menambahkan komentar ke sheet dengan id dan waktu otomatis
    public function writeComment($sheetName, $name, $message, $attendance)
    {
        $lastId = $this->getLastId($sheetName);
        $newId = $lastId + 1;
        $newRow = [
            $newId,
            $name,
            $message,
            $attendance,
            date('Y-m-d H:i:s'),
        ];
        $this->writeRow($sheetName, $newRow);
    }

    // fungsi untuk menghitung kehadiran berdasarkan status "Hadir", "Tidak Hadir", dan "Masih Ragu"
    public function countAttendance($sheetName)
    {
        $array = $this->readSheet($sheetName);
        $attendance = [
            'Hadir' => 0,
            'Tidak Hadir' => 0,
            'Masih Ragu' => 0,
        ];

        foreach ($array as $row) {
            @$attendance[$row['kehadiran']]++;
        }

        return $attendance;
    }

    // fungsi untuk menghitung seluruh kehadiran
    public function countTotalAttendance($sheetName)
    {
        $attendance = $this->countAttendance($sheetName);
        $totalAttendance = (int)$attendance['Hadir'] + (int)$attendance['Tidak Hadir'] + (int)$attendance['Masih Ragu'];

        return $totalAttendance;
    }
}

// Contoh penggunaan
// Sesuaikan $authConfigFile, $spreadsheetId, dan $sheetName dengan yang Anda miliki
// Reference: https://www.nidup.io/blog/manipulate-google-sheets-in-php-with-api

// Inisialisasi
// require_once 'config.php';
// $sheetName = 'KOMENTAR';
// $googleSheetHelper = new GoogleSheetHelper($authConfigFile, $spreadsheetId);

// Lihat isi sheet
// $array = $googleSheetHelper->readSheet($sheetName);
// print_r($array);

// Tulis komentar
// $googleSheetHelper->writeComment($sheetName, 'Ahmad', 'Semoga Samawa', 'Hadir');

// Hitung kehadiran
// $attendance = $googleSheetHelper->countAttendance($sheetName);
// print_r($attendance);

// Hitung total kehadiran
// $totalAttendance = $googleSheetHelper->countTotalAttendance($sheetName);
// echo $totalAttendance;
