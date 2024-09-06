<?php
require_once 'config.php';
require_once 'helper.php';

// fungsi untuk menggenerate link wa.me menggunakan nomor whatsapp yang valid
function generateWhatsAppLink($phoneNumber, $namaPenerima, $alamatPenerima)
{
    // Menghilangkan karakter selain angka
    $phoneNumber = preg_replace('/\D/', '', $phoneNumber);

    // Cek apakah nomor whatsapp valid
    if (substr($phoneNumber, 0, 1) == '0') {
        $phoneNumber = '62' . substr($phoneNumber, 1);
    }

    // fix $namaPenerima
    $namaEncode = str_replace(' ', '%20', $namaPenerima);

    if (empty($alamatPenerima)) {
        $alamatPenerima = "";
    } else {
        $alamatPenerima = "($alamatPenerima)";
    }

    // Menghasilkan link wa.me
    $pesan = urlencode("Kepada Yth.
Bapak/Ibu/Saudara/i
$namaPenerima $alamatPenerima
➖➖➖➖➖➖➖

Assalamu'alaikum Warohmatullahi Wabarokatuh.

Bismillahirrahmaanirrahiim.
Tanpa mengurangi rasa hormat, perkenankan Kami mengundang Bapak/Ibu/Saudara/i, teman sekaligus sahabat, untuk menghadiri acara resepsi pernikahan Kami.

Berikut link undangan Kami, untuk info lengkap dari acara bisa kunjungi:

https://afalshofi.my.id/?untuk=$namaEncode

Mohon maaf perihal undangannya hanya dibagikan melalui pesan ini.

Merupakan suatu kebahagiaan bagi Kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu kepada Kami berdua.

Atas kehadiran dan do'a restunya Kami ucapkan terimakasih.🙏🙏

Wassalamu'alaikum Warohmatullahi Wabarokatuh.");

    return "https://api.whatsapp.com/send?phone=$phoneNumber&text=$pesan";
}

// Inisialisasi
$sheetName = 'SENDER';
$googleSheetHelper = new GoogleSheetHelper($authConfigFile, $spreadsheetId);
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link Generator - Undangan Online</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- DataTables CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.11.5/css/dataTables.bootstrap5.min.css">
</head>

<body>
    <div class="container mt-5">
        <h2 class="mb-4">Link Generator - Undangan Online</h2>
        <table id="contactTable" class="table table-striped table-bordered">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Alamat</th>
                    <th>Nomor WhatsApp</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                <?php
                // Read sheet
                $array = $googleSheetHelper->readSheet($sheetName);
                $no = 1;
                foreach ($array as $row) {
                    // pastikan kolom nama, alamat, dan whatsapp tidak kosong
                    if (empty($row['whatsapp'])) {
                        continue;
                    }
                    $nama = trim($row['nama']);
                    $alamat = trim($row['alamat']);
                    $whatsapp = trim($row['whatsapp']);
                    $whatsappLink = generateWhatsAppLink($whatsapp, $nama, $alamat);
                ?>
                    <tr>
                        <td><?= $no++; ?></td>
                        <td><?= $nama; ?></td>
                        <td><?= $alamat; ?></td>
                        <td><?= $whatsapp; ?></td>
                        <td>
                            <a href="<?= $whatsappLink; ?>" class="btn btn-primary" target="_blank">Kirim</a>
                            <button class="btn btn-success" onclick="copyTextToClipboard('<?= $whatsappLink; ?>')">Salin</button>
                        </td>
                    </tr>
                <?php
                }
                ?>
            </tbody>
        </table>
    </div>

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- DataTables JS -->
    <script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.11.5/js/dataTables.bootstrap5.min.js"></script>
    <!-- Inisialisasi DataTable -->
    <script>
        $(document).ready(function() {
            $('#contactTable').DataTable();
        });

        function fallbackCopyTextToClipboard(text) {
            var textArea = document.createElement("textarea");
            textArea.value = text;

            // Avoid scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Fallback: Copying text command was ' + msg);
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }

            document.body.removeChild(textArea);
        }

        function copyTextToClipboard(text) {
            if (!navigator.clipboard) {
                fallbackCopyTextToClipboard(text);
                return;
            }
            navigator.clipboard.writeText(text).then(function() {
                console.log('Async: Copying to clipboard was successful!');
            }, function(err) {
                console.error('Async: Could not copy text: ', err);
            });
        }
    </script>
</body>

</html>