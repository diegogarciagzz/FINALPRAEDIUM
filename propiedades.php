<?php
// Leer propiedades desde el JSON
$propiedades = [];
if (file_exists('data/propiedades.json')) {
    $content = file_get_contents('data/propiedades.json');
    if ($content) {
        $propiedades = json_decode($content, true) ?? [];
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Propiedades - Praedium</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/responsive.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>
    <!-- Header -->
    <header class="header" style="position: relative;">
        <div class="logo">
            <img src="images/Praedium-FirmaInmobiliaria.jpg" alt="Praedium">
        </div>
        <a href="admin.php" class="praedium-digital-btn">PRAEDIUM DIGITAL</a>
    </header>

    <!-- Navegación -->
    <nav class="nav">
        <button class="menu-toggle" onclick="this.classList.toggle('active'); document.querySelector('.nav ul').classList.toggle('active');">
            <span></span><span></span><span></span>
        </button>
        <ul>
            <li><a href="index.html">Inicio</a></li>
            <li><a href="nosotros.html">Nosotros</a></li>
            <li><a href="servicios.html">Servicios</a></li>
            <li><a href="propiedades.php" class="active">Propiedades</a></li>
            <li><a href="equipo.html">Equipo</a></li>
            <li><a href="interes.html">Interés</a></li>
            <li><a href="contacto.html">Contacto</a></li>
        </ul>
    </nav>

    <div class="banner-container">
        <img src="Fotos e íconos/3 banner propiedades.jpg" alt="Banner de propiedades" class="seccion-banner">
    </div>

    <!-- Buscador de propiedades -->
    <section class="search-section">
        <div class="container">
            <div class="search-container">
                <h2 style="text-align: center; margin-bottom: 2rem; color: white; font-size: 2rem;">
                    Encuentra tu propiedad ideal
                </h2>
                <div class="search-form-inline">
                    <div class="search-field">
                        <label>Ubicación</label>
                        <input type="text" id="filter-ubicacion" placeholder="Ej: San Pedro, Monterrey...">
                    </div>

                    <div class="search-field">
                        <label>Tipo de propiedad</label>
                        <select id="filter-tipo">
                            <option value="">Todos los tipos</option>
                            <option value="casa">Casa</option>
                            <option value="departamento">Departamento</option>
                            <option value="terreno">Terreno</option>
                            <option value="local">Local Comercial</option>
                            <option value="oficina">Oficina</option>
                        </select>
                    </div>

                    <div class="search-field">
                        <label>Operación</label>
                        <select id="filter-operacion">
                            <option value="">Venta y Renta</option>
                            <option value="venta">Venta</option>
                            <option value="renta">Renta</option>
                        </select>
                    </div>

                    <div class="search-field">
                        <label>Precio máximo</label>
                        <select id="filter-precio">
                            <option value="">Sin límite</option>
                            <option value="500000">$500,000</option>
                            <option value="1000000">$1,000,000</option>
                            <option value="2000000">$2,000,000</option>
                            <option value="5000000">$5,000,000</option>
                            <option value="10000000">$10,000,000</option>
                        </select>
                    </div>

                    <button class="search-btn" onclick="filtrarPropiedades()">
                        <i class="fas fa-search"></i> Buscar
                    </button>
                    
                    <button class="clear-btn" onclick="limpiarFiltros()">
                        <i class="fas fa-times"></i> Limpiar
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Grid de propiedades -->
    <section class="properties-section">
        <div class="container">
            <?php if (empty($propiedades)): ?>
                <div class="no-properties">
                    <i class="fas fa-home" style="font-size: 4rem; color: #005580; margin-bottom: 1rem;"></i>
                    <h3>No hay propiedades disponibles</h3>
                    <p>Próximamente estaremos agregando nuevas propiedades.</p>
                </div>
            <?php else: ?>
                <div class="properties-stats">
                    <h2>Propiedades disponibles</h2>
                    <p>Se encontraron <span id="total-properties"><?= count($propiedades) ?></span> propiedades</p>
                </div>
                
                <div class="properties-grid" id="properties-grid">
                    <?php foreach ($propiedades as $index => $propiedad): ?>
                        <div class="property-card" 
                             data-tipo="<?= htmlspecialchars($propiedad['tipo']) ?>"
                             data-operacion="<?= htmlspecialchars($propiedad['operacion']) ?>"
                             data-precio="<?= $propiedad['precio'] ?>"
                             data-ubicacion="<?= htmlspecialchars($propiedad['ubicacion']) ?>">
                            
                            <div class="property-images">
                                <?php if (!empty($propiedad['imagenes'])): ?>
                                    <?php foreach ($propiedad['imagenes'] as $i => $imagen): ?>
                                        <img src="<?= htmlspecialchars($imagen) ?>" 
                                             alt="<?= htmlspecialchars($propiedad['nombre']) ?>"
                                             style="<?= $i > 0 ? 'display: none;' : '' ?>" 
                                             class="property-image">
                                    <?php endforeach; ?>
                                    
                                    <?php if (count($propiedad['imagenes']) > 1): ?>
                                        <div class="image-controls">
                                            <button class="prev-btn" onclick="cambiarImagen(this, -1)">‹</button>
                                            <span class="image-counter">1 / <?= count($propiedad['imagenes']) ?></span>
                                            <button class="next-btn" onclick="cambiarImagen(this, 1)">›</button>
                                        </div>
                                    <?php endif; ?>
                                <?php else: ?>
                                    <img src="images/no-image.jpg" alt="Sin imagen" class="property-image">
                                <?php endif; ?>
                                
                                <div class="property-badges">
                                    <span class="badge-operacion <?= $propiedad['operacion'] ?>">
                                        <?= ucfirst($propiedad['operacion']) ?>
                                    </span>
                                    <span class="badge-tipo">
                                        <?= ucfirst($propiedad['tipo']) ?>
                                    </span>
                                </div>
                            </div>

                            <div class="property-content">
                                <h3 class="property-title"><?= htmlspecialchars($propiedad['nombre']) ?></h3>
                                
                                <div class="property-price">
                                    $<?= number_format($propiedad['precio']) ?> MXN
                                    <?php if ($propiedad['operacion'] === 'renta'): ?>
                                        <small>/mes</small>
                                    <?php endif; ?>
                                </div>

                                <div class="property-location">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <?= htmlspecialchars($propiedad['ubicacion']) ?>
                                </div>

                                <div class="property-features">
                                    <div class="feature">
                                        <i class="fas fa-expand-arrows-alt"></i>
                                        <span><?= number_format($propiedad['superficie']) ?> m²</span>
                                    </div>
                                    
                                    <?php if ($propiedad['habitaciones'] > 0): ?>
                                        <div class="feature">
                                            <i class="fas fa-bed"></i>
                                            <span><?= $propiedad['habitaciones'] ?> hab</span>
                                        </div>
                                    <?php endif; ?>
                                    
                                    <?php if ($propiedad['banos'] > 0): ?>
                                        <div class="feature">
                                            <i class="fas fa-bath"></i>
                                            <span><?= $propiedad['banos'] ?> baños</span>
                                        </div>
                                    <?php endif; ?>
                                    
                                    <?php if ($propiedad['estacionamientos'] > 0): ?>
                                        <div class="feature">
                                            <i class="fas fa-car"></i>
                                            <span><?= $propiedad['estacionamientos'] ?> est</span>
                                        </div>
                                    <?php endif; ?>
                                </div>

                                <div class="property-description">
                                    <?= htmlspecialchars(substr($propiedad['descripcion'], 0, 120)) ?>
                                    <?php if (strlen($propiedad['descripcion']) > 120): ?>...<?php endif; ?>
                                </div>

                                <div class="property-actions">
                                    <button class="btn-details" onclick="verDetalles(<?= $index ?>)">
                                        <i class="fas fa-eye"></i> Ver detalles
                                    </button>
                                    <a href="https://wa.me/8112722672?text=Hola,%20me%20interesa%20la%20propiedad:%20<?= urlencode($propiedad['nombre']) ?>" 
                                       class="btn-contact" target="_blank">
                                        <i class="fab fa-whatsapp"></i> Contactar
                                    </a>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- Modal para detalles -->
    <div id="property-modal" class="property-modal-overlay" style="display: none;">
        <div class="property-modal">
            <div class="modal-header">
                <h2 id="modal-title"></h2>
                <button class="modal-close" onclick="cerrarModal()">&times;</button>
            </div>
            <div class="modal-content" id="modal-content">
                <!-- Contenido dinámico -->
            </div>
        </div>
    </div>

    <!-- Botones flotantes -->
    <a href="https://wa.me/8112722672" class="float-button whatsapp">
        <img src="images/Nueva carpeta/PngItem_1139670.png" alt="WhatsApp">
    </a>
    <a href="mailto:contacto@praedium.mx" class="float-button contact">
        <img src="images/Nueva carpeta/pngegg.png" alt="Contacto">
    </a>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <img src="images/Logo-PRAEDIUM-FirmaInmobiliaria.png" alt="Praedium" class="footer-logo">
            </div>
            <div class="footer-section">
                <h3>Información de contacto</h3>
                <ul class="contact-info">
                    <li><span class="gray-icon">📞</span> (81) 2082 9357</li>
                    <li><span class="gray-icon">💬</span> (81) 1272 2672</li>
                    <li><span class="gray-icon">✉️</span> contacto@praedium.mx</li>
                    <li><span class="gray-icon">📍</span> Av. Gómez Morín 1020, Valle de Chipinque, San Pedro Garza García N.L. C.P 66250</li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Menú</h3>
                <ul class="footer-menu">
                    <li><a href="index.html">Inicio</a></li>
                    <li><a href="nosotros.html">Nosotros</a></li>
                    <li><a href="servicios.html">Servicios</a></li>
                    <li><a href="propiedades.php">Propiedades</a></li>
                    <li><a href="equipo.html">Equipo</a></li>
                    <li><a href="contacto.html">Contacto</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>PRAEDIUM® 2025 Todos los derechos reservados.</p>
        </div>
    </footer>

    <script>
        // Datos de propiedades para JavaScript
        const propiedadesData = <?= json_encode($propiedades) ?>;

        // Función para filtrar propiedades
        function filtrarPropiedades() {
            const tipo = document.getElementById('filter-tipo').value.toLowerCase();
            const operacion = document.getElementById('filter-operacion').value.toLowerCase();
            const precioMax = document.getElementById('filter-precio').value;
            const ubicacion = document.getElementById('filter-ubicacion').value.toLowerCase();
            
            const cards = document.querySelectorAll('.property-card');
            let visibleCount = 0;
            
            cards.forEach(card => {
                let mostrar = true;
                
                // Filtrar por tipo
                if (tipo && card.dataset.tipo.toLowerCase() !== tipo) mostrar = false;
                
                // Filtrar por operación
                if (operacion && card.dataset.operacion.toLowerCase() !== operacion) mostrar = false;
                
                // Filtrar por precio
                if (precioMax && parseInt(card.dataset.precio) > parseInt(precioMax)) mostrar = false;
                
                // Filtrar por ubicación (búsqueda parcial)
                if (ubicacion && !card.dataset.ubicacion.toLowerCase().includes(ubicacion)) mostrar = false;
                
                card.style.display = mostrar ? 'block' : 'none';
                if (mostrar) visibleCount++;
            });
            
            // Actualizar contador
            const totalElement = document.getElementById('total-properties');
            if (totalElement) {
                totalElement.textContent = visibleCount;
            }
            
            // Mostrar mensaje si no hay resultados
            mostrarMensajeResultados(visibleCount);
        }

        // Función para limpiar filtros
        function limpiarFiltros() {
            document.getElementById('filter-tipo').value = '';
            document.getElementById('filter-operacion').value = '';
            document.getElementById('filter-precio').value = '';
            document.getElementById('filter-ubicacion').value = '';
            
            const cards = document.querySelectorAll('.property-card');
            cards.forEach(card => card.style.display = 'block');
            
            const totalElement = document.getElementById('total-properties');
            if (totalElement) {
                totalElement.textContent = '<?= count($propiedades) ?>';
            }
            
            ocultarMensajeResultados();
        }

        // Función para mostrar mensaje de resultados
        function mostrarMensajeResultados(count) {
            let messageContainer = document.getElementById('no-results-message');
            
            if (count === 0) {
                if (!messageContainer) {
                    messageContainer = document.createElement('div');
                    messageContainer.id = 'no-results-message';
                    messageContainer.className = 'no-results-message';
                    messageContainer.innerHTML = `
                        <div style="text-align: center; padding: 3rem; color: #666;">
                            <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: #005580;"></i>
                            <h3>No se encontraron propiedades</h3>
                            <p>Intenta ajustar los filtros de búsqueda para ver más resultados.</p>
                            <button onclick="limpiarFiltros()" style="background: #005580; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; margin-top: 1rem;">
                                <i class="fas fa-times"></i> Limpiar filtros
                            </button>
                        </div>
                    `;
                    document.querySelector('.properties-grid').parentNode.appendChild(messageContainer);
                }
                messageContainer.style.display = 'block';
                document.querySelector('.properties-grid').style.display = 'none';
            } else {
                ocultarMensajeResultados();
            }
        }

        // Función para ocultar mensaje de resultados
        function ocultarMensajeResultados() {
            const messageContainer = document.getElementById('no-results-message');
            if (messageContainer) {
                messageContainer.style.display = 'none';
            }
            const grid = document.querySelector('.properties-grid');
            if (grid) {
                grid.style.display = 'grid';
            }
        }

        // Función para cambiar imágenes
        function cambiarImagen(button, direction) {
            const card = button.closest('.property-card');
            const images = card.querySelectorAll('.property-image');
            const counter = card.querySelector('.image-counter');
            
            let currentIndex = 0;
            images.forEach((img, index) => {
                if (img.style.display !== 'none') {
                    currentIndex = index;
                }
                img.style.display = 'none';
            });
            
            currentIndex += direction;
            if (currentIndex >= images.length) currentIndex = 0;
            if (currentIndex < 0) currentIndex = images.length - 1;
            
            images[currentIndex].style.display = 'block';
            counter.textContent = `${currentIndex + 1} / ${images.length}`;
        }

        // Función para ver detalles
        function verDetalles(index) {
            const propiedad = propiedadesData[index];
            const modal = document.getElementById('property-modal');
            const title = document.getElementById('modal-title');
            const content = document.getElementById('modal-content');
            
            title.textContent = propiedad.nombre;
            
            let imagesHtml = '';
            if (propiedad.imagenes && propiedad.imagenes.length > 0) {
                imagesHtml = `
                    <div class="modal-images">
                        ${propiedad.imagenes.map(img => `<img src="${img}" alt="${propiedad.nombre}">`).join('')}
                    </div>
                `;
            }
            
            content.innerHTML = `
                ${imagesHtml}
                <div class="modal-info">
                    <div class="modal-price">$${new Intl.NumberFormat().format(propiedad.precio)} MXN ${propiedad.operacion === 'renta' ? '/mes' : ''}</div>
                    <div class="modal-location"><i class="fas fa-map-marker-alt"></i> ${propiedad.ubicacion}</div>
                    
                    <div class="modal-features">
                        <div class="feature"><i class="fas fa-expand-arrows-alt"></i> ${new Intl.NumberFormat().format(propiedad.superficie)} m²</div>
                        ${propiedad.habitaciones > 0 ? `<div class="feature"><i class="fas fa-bed"></i> ${propiedad.habitaciones} habitaciones</div>` : ''}
                        ${propiedad.banos > 0 ? `<div class="feature"><i class="fas fa-bath"></i> ${propiedad.banos} baños</div>` : ''}
                        ${propiedad.estacionamientos > 0 ? `<div class="feature"><i class="fas fa-car"></i> ${propiedad.estacionamientos} estacionamientos</div>` : ''}
                    </div>
                    
                    <div class="modal-description">
                        <h4>Descripción</h4>
                        <p>${propiedad.descripcion}</p>
                    </div>
                    
                    <div class="modal-actions">
                        <a href="https://wa.me/8112722672?text=Hola,%20me%20interesa%20la%20propiedad:%20${encodeURIComponent(propiedad.nombre)}" 
                           class="btn-contact-modal" target="_blank">
                            <i class="fab fa-whatsapp"></i> Contactar por WhatsApp
                        </a>
                    </div>
                </div>
            `;
            
            modal.style.display = 'flex';
        }

        // Función para cerrar modal
        function cerrarModal() {
            document.getElementById('property-modal').style.display = 'none';
        }

        // Cerrar modal al hacer clic fuera
        document.getElementById('property-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarModal();
            }
        });
    </script>
</body>
</html>
