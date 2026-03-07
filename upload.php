<?php
session_start();

// Verificar que esté logueado
if (!($_SESSION['admin_logged'] ?? false)) {
    header('Location: admin.php');
    exit;
}

// Crear directorio data si no existe
if (!file_exists('data')) {
    mkdir('data', 0777, true);
}

// Crear directorio uploads si no existe
if (!file_exists('uploads/propiedades')) {
    mkdir('uploads/propiedades', 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Validar datos
        $nombre = trim($_POST['nombre']);
        $tipo = $_POST['tipo'];
        $precio = (int)$_POST['precio'];
        $ubicacion = trim($_POST['ubicacion']);
        $superficie = (int)$_POST['superficie'];
        $habitaciones = (int)($_POST['habitaciones'] ?? 0);
        $banos = (int)($_POST['banos'] ?? 0);
        $estacionamientos = (int)($_POST['estacionamientos'] ?? 0);
        $descripcion = trim($_POST['descripcion']);
        $operacion = $_POST['operacion'];
        $identificador = trim($_POST['identificador']);
        $asesor = $_POST['asesor'];
        $asesor_nombre = '';
        $asesor_email = '';
        $asesor_telefono = '';

        if ($asesor === 'gerardo') {
            $asesor_nombre = 'Gerardo García';
            $asesor_email = 'gerardo@praedium.com.mx';
            $asesor_telefono = '(81) 2082 9357';
        } elseif ($asesor === 'susana') {
            $asesor_nombre = 'Susana Maldonado';
            $asesor_email = 'susana@praedium.com.mx';
            $asesor_telefono = '(81) 1272 2672';
        }

        if (empty($nombre) || empty($tipo) || empty($ubicacion) || empty($descripcion) || empty($identificador) || empty($asesor)) {
            throw new Exception("Todos los campos son obligatorios");
        }

        // Procesar imágenes
        $imagenes = [];
        if (isset($_FILES['imagenes']) && !empty($_FILES['imagenes']['name'][0])) {
            $allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
            
            for ($i = 0; $i < count($_FILES['imagenes']['name']); $i++) {
                if ($_FILES['imagenes']['error'][$i] === UPLOAD_ERR_OK) {
                    $file_type = $_FILES['imagenes']['type'][$i];
                    
                    if (!in_array($file_type, $allowed_types)) {
                        continue; // Saltar archivos no válidos
                    }
                    
                    $extension = pathinfo($_FILES['imagenes']['name'][$i], PATHINFO_EXTENSION);
                    $filename = 'prop_' . time() . '_' . $i . '.' . $extension;
                    $filepath = 'uploads/propiedades/' . $filename;
                    
                    if (move_uploaded_file($_FILES['imagenes']['tmp_name'][$i], $filepath)) {
                        $imagenes[] = $filepath;
                    }
                }
            }
        }

        if (empty($imagenes)) {
            throw new Exception("Debe subir al menos una imagen");
        }

        // Crear objeto propiedad
        $propiedad = [
            'id' => time(), // ID único basado en timestamp
            'identificador' => $identificador,
            'nombre' => $nombre,
            'tipo' => $tipo,
            'precio' => $precio,
            'ubicacion' => $ubicacion,
            'superficie' => $superficie,
            'habitaciones' => $habitaciones,
            'banos' => $banos,
            'estacionamientos' => $estacionamientos,
            'descripcion' => $descripcion,
            'operacion' => $operacion,
            'imagenes' => $imagenes,
            'asesor' => [
                'clave' => $asesor,
                'nombre' => $asesor_nombre,
                'email' => $asesor_email,
                'telefono' => $asesor_telefono
            ],
            'fecha_creacion' => date('Y-m-d H:i:s')
        ];

        // Leer propiedades existentes
        $propiedades = [];
        if (file_exists('data/propiedades.json')) {
            $content = file_get_contents('data/propiedades.json');
            if ($content) {
                $propiedades = json_decode($content, true) ?? [];
            }
        }

        // Agregar nueva propiedad
        $propiedades[] = $propiedad;

        // Guardar en archivo JSON
        if (file_put_contents('data/propiedades.json', json_encode($propiedades, JSON_PRETTY_PRINT))) {
            $success = "Propiedad publicada exitosamente";
        } else {
            throw new Exception("Error al guardar la propiedad");
        }

    } catch (Exception $e) {
        $error = $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resultado - Admin PRAEDIUM</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/responsive.css">
    <style>
        .result-container {
            max-width: 600px;
            margin: 100px auto;
            padding: 2rem;
            text-align: center;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .success {
            color: #4CAF50;
            font-size: 1.2rem;
            margin-bottom: 2rem;
        }
        .error {
            color: #ff4444;
            font-size: 1.2rem;
            margin-bottom: 2rem;
        }
        .back-btn {
            background: #005580;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            font-size: 1rem;
        }
        .back-btn:hover {
            background: #007bb5;
        }
    </style>
</head>
<body>

<div class="result-container">
    <h2>Resultado de la operación</h2>
    
    <?php if (isset($success)): ?>
        <div class="success"><?= $success ?></div>
        <p>La propiedad ha sido agregada y ya está visible en la página de propiedades.</p>
    <?php endif; ?>
    
    <?php if (isset($error)): ?>
        <div class="error"><?= $error ?></div>
        <p>Por favor, revisa los datos e intenta nuevamente.</p>
    <?php endif; ?>
    
    <a href="admin.php" class="back-btn">Volver al panel de administración</a>
    <br><br>
    <a href="propiedades.html" class="back-btn" style="background: #28a745;">Ver página de propiedades</a>
</div>

</body>
</html>
