<?php
session_start();

// Debugging - mostrar errores
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuración simple
// Credenciales de los dos admins
$admins = [
    'gerardo' => [
        'username' => 'Gjgarciam',
        'password' => 'GjGm8900Gg4510',
        'nombre' => 'Gerardo García',
        'email' => 'gerardo@praedium.com.mx',
        'telefono' => '(81) 2082 9357'
    ],
    'susana' => [
        'username' => 'Smaldonado',
        'password' => 'SmSg8900Sm4510',
        'nombre' => 'Susana Maldonado',
        'email' => 'susana@praedium.com.mx',
        'telefono' => '(81) 1272 2672'
    ]
];

// Variables de debug (no mostrar hasta después del HTML)
$debug_info = "";
$error = "";

// Logout primero (debe ir antes de cualquier output)
if ($_GET['logout'] ?? false) {
    session_destroy();
    header('Location: admin.php');
    exit;
}

// Verificar login
if (isset($_POST['login'])) {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $debug_info = "POST recibido: " . print_r($_POST, true);
    $found = false;
    foreach ($admins as $key => $admin) {
        if ($username === $admin['username'] && $password === $admin['password']) {
            $_SESSION['admin_logged'] = true;
            $_SESSION['admin_key'] = $key;
            $_SESSION['admin_nombre'] = $admin['nombre'];
            $_SESSION['admin_email'] = $admin['email'];
            $_SESSION['admin_telefono'] = $admin['telefono'];
            $debug_info .= "\nLogin exitoso ($key), redirigiendo...";
            $found = true;
            header('Location: admin.php');
            exit;
        }
    }
    if (!$found) {
        $error = "Usuario o contraseña incorrectos. Usuario recibido: '$username'";
    }
}

// Verificar si está logueado
$logged_in = $_SESSION['admin_logged'] ?? false;
$admin_key = $_SESSION['admin_key'] ?? null;
$admin_nombre = $_SESSION['admin_nombre'] ?? '';
$admin_email = $_SESSION['admin_email'] ?? '';
$admin_telefono = $_SESSION['admin_telefono'] ?? '';

// Mensaje de éxito si se agregó una propiedad
$success_message = "";
if (isset($_GET['success']) && $_GET['success'] == '1') {
    $success_message = "¡Propiedad agregada exitosamente!";
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - PRAEDIUM</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        .login-container {
            max-width: 400px;
            margin: 100px auto;
            padding: 2rem;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .login-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .admin-header {
            background: #005580;
            color: white;
            padding: 1rem;
            margin-bottom: 2rem;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logout-btn {
            background: #ff4444;
            color: white;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            text-decoration: none;
            font-size: 0.9rem;
        }
        .error {
            color: #ff4444;
            margin-top: 0.5rem;
        }
        .success {
            color: #00aa00;
            background: #e8f5e8;
            border: 1px solid #00aa00;
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1rem;
        }
        .property-admin-card {
            border: 1px solid #ddd;
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 8px;
            background: #f9f9f9;
        }
        .admin-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
    </style>
</head>
<body>

<?php 
// Mostrar debug info si existe
if ($debug_info) {
    echo "<!-- DEBUG: $debug_info -->";
}
?>

<?php if (!$logged_in): ?>
    <!-- Formulario de login -->
    <div class="login-container">
        <h2 style="text-align: center; color: #005580; margin-bottom: 2rem;">
            Acceso Administrativo<br>
            <small style="font-size: 0.6em; color: #666;">PRAEDIUM</small>
        </h2>
        
        <form method="POST" action="admin.php" class="login-form">
            <div class="form-group">
                <label for="username">Usuario:</label>
                <input type="text" id="username" name="username" value="Gjgarciam" required autocomplete="username">
            </div>
            
            <div class="form-group">
                <label for="password">Contraseña:</label>
                <input type="password" id="password" name="password" required autocomplete="current-password">
            </div>
            
            <input type="hidden" name="login" value="1">
            <button type="submit" class="submit-btn">Iniciar Sesión</button>
            
            <?php if (isset($error)): ?>
                <div class="error"><?= $error ?></div>
            <?php endif; ?>
        </form>
    </div>

<?php else: ?>
    <!-- Panel de administración -->
    <div class="admin-header">
        <h1>Panel de Administración - PRAEDIUM</h1>
        <a href="admin.php?logout=1" class="logout-btn">Cerrar Sesión</a>
    </div>

    <div class="admin-container">
        
        <?php if ($success_message): ?>
            <div class="success"><?= $success_message ?></div>
        <?php endif; ?>
        
        <form id="propiedadForm" class="property-form" action="upload.php" method="POST" enctype="multipart/form-data">
            <h2 style="color: #005580; margin-bottom: 2rem;">Agregar Nueva Propiedad</h2>
            
            <div class="form-group">
                <label for="nombre">Nombre de la propiedad:</label>
                <input type="text" id="nombre" name="nombre" required>
            </div>

            <div class="form-group">
                <label for="tipo">Tipo de propiedad:</label>
                <select id="tipo" name="tipo" required>
                    <option value="">Seleccionar...</option>
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="terreno">Terreno</option>
                    <option value="local">Local Comercial</option>
                    <option value="oficina">Oficina</option>
                </select>
            </div>

            <div class="form-group">
                <label for="precio">Precio (MXN):</label>
                <input type="number" id="precio" name="precio" required>
            </div>

            <div class="form-group">
                <label for="ubicacion">Ubicación:</label>
                <input type="text" id="ubicacion" name="ubicacion" required>
            </div>

            <div class="form-group">
                <label for="superficie">Superficie (m²):</label>
                <input type="number" id="superficie" name="superficie" required>
            </div>

            <div class="form-group">
                <label for="habitaciones">Habitaciones:</label>
                <input type="number" id="habitaciones" name="habitaciones" min="0">
            </div>

            <div class="form-group">
                <label for="banos">Baños:</label>
                <input type="number" id="banos" name="banos" min="0">
            </div>

            <div class="form-group">
                <label for="estacionamientos">Estacionamientos:</label>
                <input type="number" id="estacionamientos" name="estacionamientos" min="0">
            </div>

            <div class="form-group">
                <label for="descripcion">Descripción:</label>
                <textarea id="descripcion" name="descripcion" rows="4" required></textarea>
            </div>

            <div class="form-group">
                <label for="imagenes">Imágenes de la propiedad:</label>
                <input type="file" id="imagenes" name="imagenes[]" multiple accept="image/*" required>
                <small style="color: #666;">Selecciona una o más imágenes (JPG, PNG, WebP)</small>
            </div>

            <div class="form-group">
                <label for="operacion">Tipo de operación:</label>
                <select id="operacion" name="operacion" required>
                    <option value="">Seleccionar...</option>
                    <option value="venta">Venta</option>
                    <option value="renta">Renta</option>
                </select>
            </div>

            <button type="submit" class="submit-btn">Publicar Propiedad</button>
        </form>

        <div class="properties-list">
            <h2>Propiedades Publicadas</h2>
            <div id="admin-properties-container">
                <?php
                // Mostrar propiedades existentes
                if (file_exists('data/propiedades.json')) {
                    $propiedades = json_decode(file_get_contents('data/propiedades.json'), true);
                    if ($propiedades) {
                        foreach ($propiedades as $index => $propiedad) {
                            echo "<div class='property-admin-card'>";
                            echo "<h3>{$propiedad['nombre']}</h3>";
                            echo "<p><strong>Identificador:</strong> {$propiedad['identificador']}</p>";
                            echo "<p><strong>Tipo:</strong> {$propiedad['tipo']}</p>";
                            echo "<p><strong>Precio:</strong> $" . number_format($propiedad['precio']) . " MXN</p>";
                            echo "<p><strong>Ubicación:</strong> {$propiedad['ubicacion']}</p>";
                            if (isset($propiedad['asesor'])) {
                                echo "<div style='margin-top:1em; background:#eef; padding:0.5em; border-radius:6px;'>";
                                echo "<strong>Asesor responsable:</strong><br>";
                                echo "Nombre: " . htmlspecialchars($propiedad['asesor']['nombre']) . "<br>";
                                echo "Email: <a href='mailto:" . htmlspecialchars($propiedad['asesor']['email']) . "'>" . htmlspecialchars($propiedad['asesor']['email']) . "</a><br>";
                                echo "Teléfono: " . htmlspecialchars($propiedad['asesor']['telefono']) . "<br>";
                                echo "</div>";
                            }
                            echo "<a href='delete.php?id={$index}' onclick='return confirm(\"¿Eliminar esta propiedad?\")' style='color: #ff4444;'>Eliminar</a>";
                            echo "</div>";
                        }
                    }
                } else {
                    echo "<p>No hay propiedades publicadas aún.</p>";
                }
                ?>
            </div>
        </div>
    </div>

<?php endif; ?>

</body>
</html>
