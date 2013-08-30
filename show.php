<?php
if ($_SERVER ['REQUEST_METHOD'] == 'POST') {
	$p = strpos($_POST['imageData'], ',')+1;
	$img = base64_decode(substr($_POST['imageData'], $p));
	$im = imagecreatefromstring($img);
	imageAlphaBlending($im, true);
	imageSaveAlpha($im, true);
	header('Content-type: image/png');
	imagepng($im, null);
	exit;
}
?>