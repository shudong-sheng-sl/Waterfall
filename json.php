<?php

// Generate JSON string of image data to the waterfall

$num = $_GET["n"];

$arr = array();

for($i = 0; $i < $num; $i++) {
  $src = rand(1, 60);
  $size = getimagesize("img/" . $src . ".jpg");
  $height = $size[1];
  if($size[0] != 190) {
    $height = 190 * $size[1] / $size[0];
  }
  $arr[$i] = array("s" => $src, "h" => $height, "w" => 190);
}

echo json_encode($arr);

?>