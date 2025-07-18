// Variables globales
let allProperties = [];
let filteredProperties = [];

// Función para cargar propiedades desde el servidor
async function loadProperties() {
    try {
        const response = await fetch('data/propiedades.json');
        if (response.ok) {
            const data = await response.text();
            if (data.trim()) {
                allProperties = JSON.parse(data);
                console.log('Propiedades cargadas:', allProperties.length);
            } else {
                allProperties = [];
                console.log('Archivo JSON vacío');
            }
        } else {
            console.log('Archivo propiedades.json no encontrado');
            allProperties = [];
        }
    } catch (error) {
        console.log('Error al cargar propiedades:', error);
        allProperties = [];
    }
    
    filteredProperties = [...allProperties];
    displayProperties();
    updateResultsCount();
}

// Función para mostrar propiedades
function displayProperties() {
    const container = document.getElementById('properties-container');
    const noPropertiesMessage = document.getElementById('no-properties-message');
    
    if (!container) {
        console.log('Container no encontrado');
        return;
    }

    if (filteredProperties.length === 0) {
        container.innerHTML = '';
        if (noPropertiesMessage) {
            noPropertiesMessage.style.display = 'block';
        }
        console.log('No hay propiedades para mostrar');
        return;
    }

    if (noPropertiesMessage) {
        noPropertiesMessage.style.display = 'none';
    }

    container.innerHTML = filteredProperties.map(property => createPropertyCard(property)).join('');
    console.log('Mostrando', filteredProperties.length, 'propiedades');
}

// Función para crear tarjeta de propiedad con diseño correcto
function createPropertyCard(property) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
        }).format(price);
    };

    const mainImage = Array.isArray(property.imagenes) && property.imagenes.length > 0 
        ? property.imagenes[0] 
        : 'images/default-property.jpg';

    return `
        <div class="property-card" onclick="openModal(${property.id})">
            <!-- Contenedor de imagen -->
            <div class="property-image-container">
                <img class="property-img" src="${mainImage}" alt="${property.nombre}" onerror="this.src='images/default-property.jpg'">
            </div>

            <!-- Cuerpo de la tarjeta -->
            <div class="property-body">
                <h3 class="property-title">${property.nombre}</h3>
                
                <p class="property-location">
                    📍 ${property.ubicacion}
                </p>

                <div class="property-details">
                    <span><i>🏠</i> ${property.superficie} m²</span>
                    ${property.habitaciones > 0 ? `<span><i>🛏️</i> ${property.habitaciones}</span>` : ''}
                    ${property.banos > 0 ? `<span><i>🚿</i> ${property.banos}</span>` : ''}
                    ${property.estacionamientos > 0 ? `<span><i>🚗</i> ${property.estacionamientos}</span>` : ''}
                </div>
            </div>
            
            <!-- Precio fuera de la imagen -->
            <div class="property-price-bottom">
                <span class="price">$${formatPrice(property.precio).replace('$', '')} MXN</span>
                <span class="operation-badge">${property.operacion.toUpperCase()}</span>
            </div>
        </div>
    `;
}

// Función para actualizar contador de resultados
function updateResultsCount() {
    const countElement = document.getElementById('results-count');
    if (countElement) {
        const count = filteredProperties.length;
        countElement.textContent = count === 1 
            ? '1 propiedad encontrada' 
            : `${count} propiedades encontradas`;
    }
}

// Función para filtrar propiedades
function filterProperties() {
    const ubicacionSelect = document.getElementById('ubicacion');
    const tipoSelect = document.getElementById('tipo');
    const precioMinInput = document.getElementById('precioMin');
    const precioMaxInput = document.getElementById('precioMax');

    const ubicacionFiltro = ubicacionSelect?.value || '';
    const tipoFiltro = tipoSelect?.value || '';
    
    // Limpiar valores de precio para obtener solo números
    const precioMinValue = precioMinInput?.value.replace(/[^\d]/g, '') || '0';
    const precioMaxValue = precioMaxInput?.value.replace(/[^\d]/g, '') || '';
    
    const precioMin = parseFloat(precioMinValue) || 0;
    const precioMax = precioMaxValue ? parseFloat(precioMaxValue) : Infinity;

    console.log('Filtros aplicados:', {
        ubicacion: ubicacionFiltro,
        tipo: tipoFiltro,
        precioMin: precioMin,
        precioMax: precioMax
    });

    filteredProperties = allProperties.filter(property => {
        const ubicacionMatch = !ubicacionFiltro || 
            property.ubicacion.toLowerCase().includes(ubicacionFiltro.toLowerCase());
        
        const tipoMatch = !tipoFiltro || 
            property.tipo.toLowerCase() === tipoFiltro.toLowerCase();
        
        const precioMatch = property.precio >= precioMin && property.precio <= precioMax;

        return ubicacionMatch && tipoMatch && precioMatch;
    });

    console.log('Propiedades filtradas:', filteredProperties.length);
    displayProperties();
    updateResultsCount();
}

// Función para limpiar filtros
function clearFilters() {
    const ubicacionSelect = document.getElementById('ubicacion');
    const tipoSelect = document.getElementById('tipo');
    const precioMinInput = document.getElementById('precioMin');
    const precioMaxInput = document.getElementById('precioMax');

    if (ubicacionSelect) ubicacionSelect.selectedIndex = 0;
    if (tipoSelect) tipoSelect.selectedIndex = 0;
    if (precioMinInput) precioMinInput.value = '';
    if (precioMaxInput) precioMaxInput.value = '';
    
    filteredProperties = [...allProperties];
    displayProperties();
    updateResultsCount();
    
    console.log('Filtros limpiados');
}

// Función para abrir modal
function openModal(propertyId) {
    const property = allProperties.find(p => p.id == propertyId);
    if (!property) {
        console.log('Propiedad no encontrada:', propertyId);
        return;
    }

    // Cerrar modal anterior si existe
    closeModal();

    // Crear modal con el diseño anterior (mejor)
    const modal = document.createElement('div');
    modal.id = "propertyModal";
    modal.className = 'property-modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div class="property-modal" style="
            background: white;
            border-radius: 16px;
            max-width: 900px;
            max-height: 90vh;
            width: 100%;
            overflow: hidden;
            position: relative;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            display: grid;
            grid-template-rows: auto 1fr;
        ">
            <button class="modal-close" onclick="closeModal()" style="
                position: absolute;
                top: 15px;
                right: 15px;
                background: rgba(255,255,255,0.9);
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 1.5rem;
                cursor: pointer;
                z-index: 2;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #333;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
            " onmouseover="this.style.background='white'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(255,255,255,0.9)'; this.style.transform='scale(1)'">&times;</button>
            
            <div class="modal-content" style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                height: 600px;
                overflow: hidden;
            ">
                <!-- Galería de fotos -->
                <div class="modal-gallery" style="
                    position: relative;
                    background: #f8f9fa;
                    overflow: hidden;
                ">
                    <div class="gallery-main" style="
                        width: 100%;
                        height: 100%;
                        position: relative;
                        overflow: hidden;
                    ">
                        <img id="modal-main-image" src="${property.imagenes && property.imagenes.length > 0 ? property.imagenes[0] : 'images/default-property.jpg'}" alt="${property.nombre}" style="
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        " onerror="this.src='images/default-property.jpg'">
                        ${property.imagenes && property.imagenes.length > 1 ? `
                            <button class="gallery-nav prev" onclick="changeImage(-1)" style="
                                position: absolute;
                                left: 10px;
                                top: 50%;
                                transform: translateY(-50%);
                                background: rgba(255,255,255,0.9);
                                border: none;
                                width: 40px;
                                height: 40px;
                                border-radius: 50%;
                                font-size: 1.2rem;
                                cursor: pointer;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">&lt;</button>
                            <button class="gallery-nav next" onclick="changeImage(1)" style="
                                position: absolute;
                                right: 10px;
                                top: 50%;
                                transform: translateY(-50%);
                                background: rgba(255,255,255,0.9);
                                border: none;
                                width: 40px;
                                height: 40px;
                                border-radius: 50%;
                                font-size: 1.2rem;
                                cursor: pointer;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">&gt;</button>
                            <div class="image-counter" style="
                                position: absolute;
                                bottom: 15px;
                                right: 15px;
                                background: rgba(0,0,0,0.7);
                                color: white;
                                padding: 5px 10px;
                                border-radius: 15px;
                                font-size: 0.9rem;
                            ">
                                <span id="current-image">1</span> / ${property.imagenes.length}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Información de la propiedad -->
                <div class="modal-info" style="
                    padding: 30px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                ">
                    <div class="modal-header">
                        <h2 style="
                            margin: 0 0 10px 0;
                            color: #005580;
                            font-size: 1.8rem;
                            line-height: 1.2;
                        ">${property.nombre}</h2>
                        <div class="modal-price" style="
                            display: flex;
                            align-items: center;
                            gap: 15px;
                            margin-bottom: 15px;
                        ">
                            <span class="price" style="
                                font-size: 2rem;
                                font-weight: bold;
                                color: #28a745;
                            ">${new Intl.NumberFormat('es-MX', {
                                style: 'currency',
                                currency: 'MXN',
                                minimumFractionDigits: 0
                            }).format(property.precio)}</span>
                            <span class="operation-badge" style="
                                background: ${property.operacion === 'venta' ? '#28a745' : '#007bff'};
                                color: white;
                                padding: 6px 12px;
                                border-radius: 15px;
                                font-size: 0.9rem;
                                font-weight: bold;
                            ">${property.operacion.toUpperCase()}</span>
                        </div>
                    </div>

                    <div class="modal-location" style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        color: #666;
                        font-size: 1.1rem;
                    ">
                        📍 <span>${property.ubicacion}</span>
                    </div>

                    <div class="modal-features" style="
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                        padding: 20px;
                        background: #f8f9fa;
                        border-radius: 12px;
                    ">
                        <div class="feature" style="
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        ">
                            🏠 <span><strong>Superficie:</strong> ${property.superficie} m²</span>
                        </div>
                        ${property.habitaciones > 0 ? `
                            <div class="feature" style="
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            ">
                                🛏️ <span><strong>Habitaciones:</strong> ${property.habitaciones}</span>
                            </div>
                        ` : ''}
                        ${property.banos > 0 ? `
                            <div class="feature" style="
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            ">
                                🚿 <span><strong>Baños:</strong> ${property.banos}</span>
                            </div>
                        ` : ''}
                        ${property.estacionamientos > 0 ? `
                            <div class="feature" style="
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            ">
                                🚗 <span><strong>Estacionamientos:</strong> ${property.estacionamientos}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="modal-description">
                        <h3 style="
                            color: #005580;
                            margin: 0 0 10px 0;
                            font-size: 1.3rem;
                        ">Descripción</h3>
                        <p style="
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                        ">${property.descripcion || 'Sin descripción disponible'}</p>
                    </div>
                    
                    ${property.imagenes && property.imagenes.length > 1 ? `
                        <div class="gallery-thumbnails" style="
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
                            gap: 8px;
                            margin-top: auto;
                        ">
                            ${property.imagenes.map((img, index) => `
                                <img src="${img}" alt="Foto ${index + 1}" style="
                                    width: 100%;
                                    height: 60px;
                                    object-fit: cover;
                                    border-radius: 6px;
                                    cursor: pointer;
                                    border: 2px solid ${index === 0 ? '#005580' : 'transparent'};
                                    transition: all 0.3s ease;
                                " 
                                class="thumbnail ${index === 0 ? 'active' : ''}" 
                                onclick="setActiveImage(${index})"
                                onmouseover="this.style.transform='scale(1.05)'"
                                onmouseout="this.style.transform='scale(1)'">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    // Variables para galería
    window.currentImageIndex = 0;
    window.modalImages = property.imagenes || [];

    // Add modal to the DOM
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Mostrar modal con animación
    setTimeout(() => {
        modal.style.opacity = "1";
    }, 10);

    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Función para cerrar modal
function closeModal() {
    const modal = document.getElementById('propertyModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
            document.body.style.overflow = '';
        }, 300);
    }
}

// Funciones para la galería del modal
function changeImage(direction) {
    if (!window.modalImages || window.modalImages.length <= 1) return;
    
    window.currentImageIndex += direction;
    
    if (window.currentImageIndex >= window.modalImages.length) {
        window.currentImageIndex = 0;
    } else if (window.currentImageIndex < 0) {
        window.currentImageIndex = window.modalImages.length - 1;
    }

    updateModalImage();
}

function setActiveImage(index) {
    window.currentImageIndex = index;
    updateModalImage();
}

function updateModalImage() {
    const mainImage = document.getElementById('modal-main-image');
    const counter = document.getElementById('current-image');
    const thumbnails = document.querySelectorAll('.thumbnail');

    if (mainImage && window.modalImages[window.currentImageIndex]) {
        mainImage.src = window.modalImages[window.currentImageIndex];
    }

    if (counter) {
        counter.textContent = window.currentImageIndex + 1;
    }

    // Actualizar thumbnails activos
    thumbnails.forEach((thumb, index) => {
        if (index === window.currentImageIndex) {
            thumb.style.border = '2px solid #005580';
            thumb.classList.add('active');
        } else {
            thumb.style.border = '2px solid transparent';
            thumb.classList.remove('active');
        }
    });
}

// Event listeners principales
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando aplicación...');
    
    // Cargar propiedades al inicio
    loadProperties();
    
    // Agregar event listeners para filtros
    const ubicacionSelect = document.getElementById('ubicacion');
    const tipoSelect = document.getElementById('tipo');
    const precioMinInput = document.getElementById('precioMin');
    const precioMaxInput = document.getElementById('precioMax');
    const clearBtn = document.getElementById('clearBtn');

    if (ubicacionSelect) {
        ubicacionSelect.addEventListener('change', filterProperties);
        console.log('Event listener agregado a ubicacion');
    }
    if (tipoSelect) {
        tipoSelect.addEventListener('change', filterProperties);
        console.log('Event listener agregado a tipo');
    }
    if (precioMinInput) {
        precioMinInput.addEventListener('input', filterProperties);
        console.log('Event listener agregado a precioMin');
    }
    if (precioMaxInput) {
        precioMaxInput.addEventListener('input', filterProperties);
        console.log('Event listener agregado a precioMax');
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
        console.log('Event listener agregado a clearBtn');
    }

    // Event listener para cerrar modal con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});
