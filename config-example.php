<?php
$mode = 'local'; // local or production
if ($mode == 'production') {
    $base_url = 'https://yourdomain.com/';
} else {
    $base_url = 'http://localhost/undangan-nikah/';
}

$authConfigFile = 'xxxx-xxx-xxxxxx-xx-xxxxxxxxxx.json'; // nama file json yang berisi credential API Google
$spreadsheetId = 'xxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxx'; // ID Google Spreadsheet
