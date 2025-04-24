<?php
include '../config.php';
function lister()
{
    $connexion = mysqli_connect('localhost', 'root', '', 'cicaf_sass') or die('KO');
    mysqli_set_charset($connexion, "utf8");

    $result = mysqli_query($connexion, 'SELECT * FROM plan_comptable ORDER BY numero_compte, id ASC');
    while ($compte = mysqli_fetch_array($result)) {
        echo '<option value="' . $compte['numero_compte'] . '">'
            . $compte['numero_compte'] . ' - ' . $compte['designation_compte']
            . '</option>';
    }

    mysqli_close($connexion);
}
