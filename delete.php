<?php
session_start();

// Verificar que esté logueado
if (!($_SESSION['admin_logged'] ?? false)) {
    header('Location: admin.php');
    exit;
}

if (isset($_GET['id'])) {
    $id_to_delete = (int)$_GET['id'];
    
    if (file_exists('data/propiedades.json')) {
        $propiedades = json_decode(file_get_contents('data/propiedades.json'), true);
        
        if ($propiedades && isset($propiedades[$id_to_delete])) {
            // Eliminar imágenes físicas
            foreach ($propiedades[$id_to_delete]['imagenes'] as $imagen) {
                if (file_exists($imagen)) {
                    unlink($imagen);
                }
            }
            
            // Eliminar propiedad del array
            unset($propiedades[$id_to_delete]);
            
            // Reindexar array
            $propiedades = array_values($propiedades);
            
            // Guardar archivo actualizado
            file_put_contents('data/propiedades.json', json_encode($propiedades, JSON_PRETTY_PRINT));
        }
    }
}

header('Location: admin.php');
exit;
?>
