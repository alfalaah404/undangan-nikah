
<?php
require_once 'config.php';
require_once 'helper.php';

// fungsi untuk mengetahui berapa lama waktu yang sudah berlalu dari 2 date('Y-m-d H:i:s')
function time_elapsed_string($datetime, $full = false)
{
    $now = new DateTime;
    $ago = new DateTime($datetime);
    $diff = $now->diff($ago);

    $diff->w = floor($diff->d / 7);
    $diff->d -= $diff->w * 7;

    $string = [
        'y' => 'tahun',
        'm' => 'bulan',
        'w' => 'minggu',
        'd' => 'hari',
        'h' => 'jam',
        'i' => 'menit',
        's' => 'detik',
    ];
    foreach ($string as $k => &$v) {
        if ($diff->$k) {
            $v = $diff->$k . ' ' . $v . ($diff->$k > 1 ? '' : '');
        } else {
            unset($string[$k]);
        }
    }

    if (!$full) $string = array_slice($string, 0, 1);
    return $string ? implode(', ', $string) . ' yang lalu' : 'baru saja';
}

// Inisialisasi
$sheetName = 'KOMENTAR';
$googleSheetHelper = new GoogleSheetHelper($authConfigFile, $spreadsheetId);

if (isset($_GET['tulis_komentar']) && isset($_POST['is_submited'])) {
    // filter data yang diinputkan
    $name = strip_tags($_POST['nama']);
    $message = strip_tags($_POST['ucapan']);
    $attendance = strip_tags($_POST['konfirmasi']);

    $googleSheetHelper->writeComment($sheetName, $name, $message, $attendance);
}

if (isset($_GET['load_komentar'])) {
    $array = $googleSheetHelper->readSheet($sheetName);

    // balik urutan array
    $array = array_reverse($array);

    foreach ($array as $row) {
        if ($row['kehadiran'] == 'Hadir') {
            $is_hadir = '<span class="cui-post-author-mark cui-post-author-hadir"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" xml:space="preserve" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" clip-rule="evenodd" viewBox="0 0 20 20"><path fill="#3d9a62" d="M17.645 8.032c-.294-.307-.599-.625-.714-.903-.106-.256-.112-.679-.118-1.089-.012-.762-.025-1.626-.626-2.227s-1.465-.614-2.227-.626c-.41-.006-.833-.012-1.089-.118-.278-.115-.596-.42-.903-.714-.54-.518-1.152-1.105-1.968-1.105-.816 0-1.428.587-1.968 1.105-.307.294-.625.599-.903.714-.256.106-.679.112-1.089.118-.762.012-1.626.025-2.227.626s-.614 1.465-.626 2.227c-.006.41-.012.833-.118 1.089-.115.278-.42.596-.714.903C1.837 8.572 1.25 9.184 1.25 10c0 .816.587 1.428 1.105 1.968.294.307.599.625.714.903.106.256.112.679.118 1.089.012.762.025 1.626.626 2.227s1.465.614 2.227.626c.41.006.833.012 1.089.118.278.115.596.42.903.714.54.518 1.152 1.105 1.968 1.105.816 0 1.428-.587 1.968-1.105.307-.294.625-.599.903-.714.256-.106.679-.112 1.089-.118.762-.012 1.626-.025 2.227-.626s.614-1.465.626-2.227c.006-.41.012-.833.118-1.089.115-.278.42-.596.714-.903.518-.54 1.105-1.152 1.105-1.968 0-.816-.587-1.428-1.105-1.968Zm-3.343-2.461a.882.882 0 0 0-1.222.256l-4.26 6.509-2.036-1.885a.885.885 0 0 0-1.2 1.297l2.815 2.604c.01.009.023.011.033.02.025.02.04.048.067.067.037.025.08.03.121.048a.86.86 0 0 0 .145.058.817.817 0 0 0 .147.023.883.883 0 0 0 .212-.003.89.89 0 0 0 .086-.02.887.887 0 0 0 .247-.103l.039-.028c.052-.036.108-.062.152-.11.031-.034.045-.078.071-.116l.003-.004 4.835-7.389a.89.89 0 0 0-.255-1.224Z"></path></svg></span>';
        } else {
            $is_hadir = '';
        }

        echo '
        <li class="comment even thread-even depth-1 cui-item-comment animated fadeIn" id="cui-item-comment-10020" data-likes="0">
            <div id="cui-comment-10020" class="cui-comment cui-clearfix">
                <div class="cui-comment-avatar">
                    <img alt="" src="https://avatar.oxro.io/avatar.svg?name=' . $row['nama'] . '&amp;background=random&amp;length=2&amp;caps=1&amp;fontSize=200&amp;bold=true">
                </div><!--.cui-comment-avatar-->

                <div class="cui-comment-content">
                    <div class="cui-comment-info">
                        <a class="cui-commenter-name" title="' . $row['nama'] . '">' . $row['nama'] . '</a> ' . $is_hadir . '
                    </div><!--.cui-comment-info-->
                    <div class="cui-comment-text">
                        <p>' . $row['pesan'] . '</p>
                    </div><!--.cui-comment-text-->

                    <div class="cui-comment-actions">
                        <span class="cui-comment-time"><i class="far fa-clock"></i>
                            ' . time_elapsed_string($row['waktu']) . ' </span>
                    </div><!--.cui-comment-actions-->

                </div><!--.cui-comment-content-->
            </div><!--.cui-comment-->
            <!--</li>-->
        </li><!-- #comment-## -->';
    }
}

if (isset($_GET['load_count_komentar'])) {
    $totalAttendance = $googleSheetHelper->countTotalAttendance($sheetName);
    echo $totalAttendance;
}

if (isset($_GET['load_count_konfirmasi'])) {
    $kehadiran = $googleSheetHelper->countAttendance($sheetName);
    echo '<div class="cui_comment_count_card_row">
                <div class="cui_comment_count_card cui_card-hadir"><span>' . $kehadiran['Hadir'] . '</span><span>Hadir</span></div>
                <div class="cui_comment_count_card cui_card-tidak_hadir"><span>' . $kehadiran['Tidak Hadir'] . '</span><span>Tidak Hadir</span></div>
                <div class="cui_comment_count_card cui_card-masih_ragu"><span>' . $kehadiran['Masih Ragu'] . '</span><span>Masih Ragu</span></div>
            </div>';
}
?>