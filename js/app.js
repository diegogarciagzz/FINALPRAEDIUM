class PropertyManager {
      constructor() {
        console.log('Inicializando PropertyManager...');
        this.properties = JSON.parse(localStorage.getItem('properties')) || [];
        this.uploadedImages = [];
        
        // Si no hay propiedades, cargar las por defecto
        if (this.properties.length === 0) {
            console.log('Cargando propiedades por defecto...');
            this.properties = this.getDefaultProperties();
            this.saveProperties();
        }
        
        console.log('Total propiedades:', this.properties.length);
        this.init();
    }

    init() {
        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage === 'admin.html') {
            this.initAdmin();
        } else if (currentPage === 'propiedades.html') {
            this.initProperties();
        }
    }

    initAdmin() {
        this.initImageUpload();
        this.initForm();
        this.displayAdminProperties(); // ← Faltaba esta función
    }    initProperties() {
        console.log('Inicializando vista de propiedades...');
        console.log('Propiedades disponibles:', this.properties.length);
        this.displayProperties();
        this.initFilters();
        this.updateResultsCount(this.properties.length);
    }

    initImageUpload() {
        const fileInput = document.getElementById('imagenes');
        fileInput?.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleImageUpload(files);
        });
    }    handleImageUpload(files) {
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = {
                        id: Date.now() + Math.random(),
                        dataUrl: e.target.result,
                        name: file.name
                    };
                    this.uploadedImages.push(imageData);
                    this.renderImages();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    initFilters() {
        const applyBtn = document.getElementById('apply-filters');
        const clearBtn = document.getElementById('clear-filters');
        const filterUbicacion = document.getElementById('filter-ubicacion');
        const filterTipo = document.getElementById('filter-tipo');
        const filterPrecioMin = document.getElementById('filter-precio-min');
        const filterPrecioMax = document.getElementById('filter-precio-max');

        // Formatear inputs de precio en tiempo real
        [filterPrecioMin, filterPrecioMax].forEach(input => {
            if (input) {
                input.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/[^\d]/g, '');
                    if (value) {
                        value = parseInt(value).toLocaleString('es-MX');
                        e.target.value = '$' + value;
                    }
                    
                    // Agregar clase has-value si tiene contenido
                    if (e.target.value) {
                        e.target.parentElement.classList.add('has-value');
                    } else {
                        e.target.parentElement.classList.remove('has-value');
                    }
                });

                // Aplicar filtros al presionar Enter
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.applyCurrentFilters();
                    }
                });
            }
        });

        // Agregar clase has-value a selects cuando cambian
        [filterUbicacion, filterTipo].forEach(select => {
            if (select) {
                select.addEventListener('change', (e) => {
                    if (e.target.value) {
                        e.target.parentElement.classList.add('has-value');
                    } else {
                        e.target.parentElement.classList.remove('has-value');
                    }
                    
                    // Aplicar filtros automáticamente al cambiar
                    setTimeout(() => {
                        this.applyCurrentFilters();
                    }, 100);
                });
            }
        });

        // Aplicar filtros al hacer clic en Buscar
        applyBtn?.addEventListener('click', () => {
            this.applyCurrentFilters();
            this.showSearchMessage();
        });

        // Limpiar filtros
        clearBtn?.addEventListener('click', () => {
            this.clearAllFilters();
            this.showClearMessage();
        });
    }

    applyCurrentFilters() {
        const filter = {
            ubicacion: document.getElementById('filter-ubicacion')?.value || '',
            tipo: document.getElementById('filter-tipo')?.value || '',
            precioMin: this.parsePrice(document.getElementById('filter-precio-min')?.value) || 0,
            precioMax: this.parsePrice(document.getElementById('filter-precio-max')?.value) || Infinity
        };

        this.displayProperties(filter);
        console.log('Filtros aplicados:', filter); // Debug
    }

    clearAllFilters() {
        const filterUbicacion = document.getElementById('filter-ubicacion');
        const filterTipo = document.getElementById('filter-tipo');
        const filterPrecioMin = document.getElementById('filter-precio-min');
        const filterPrecioMax = document.getElementById('filter-precio-max');

        if (filterUbicacion) filterUbicacion.value = '';
        if (filterTipo) filterTipo.value = '';
        if (filterPrecioMin) filterPrecioMin.value = '';
        if (filterPrecioMax) filterPrecioMax.value = '';

        // Remover clases has-value
        document.querySelectorAll('.search-field').forEach(field => {
            field.classList.remove('has-value');
        });

        this.displayProperties();
    }

    parsePrice(priceString) {
        if (!priceString) return 0;
        // Remover todo excepto números
        const cleanPrice = priceString.replace(/[^0-9]/g, '');
        return cleanPrice ? parseInt(cleanPrice) : 0;
    }

    filterProperties(filter) {
        return this.properties.filter(property => {
            // Filtro por ubicación (búsqueda parcial, insensible a mayúsculas)
            const locationMatch = !filter.ubicacion || 
                property.ubicacion.toLowerCase().includes(filter.ubicacion.toLowerCase());
            
            // Filtro por tipo (coincidencia exacta)
            const typeMatch = !filter.tipo || property.tipo === filter.tipo;
            
            // Filtro por rango de precios
            const priceMatch = property.precio >= filter.precioMin && 
                property.precio <= filter.precioMax;

            console.log(`Propiedad: ${property.nombre}`, {
                locationMatch,
                typeMatch,
                priceMatch,
                precio: property.precio,
                filtro: filter
            }); // Debug

            return locationMatch && typeMatch && priceMatch;
        });
    }

    showSearchMessage() {
        const filter = {
            ubicacion: document.getElementById('filter-ubicacion')?.value || '',
            tipo: document.getElementById('filter-tipo')?.value || '',
            precioMin: this.parsePrice(document.getElementById('filter-precio-min')?.value) || 0,
            precioMax: this.parsePrice(document.getElementById('filter-precio-max')?.value) || Infinity
        };

        let message = 'Buscando propiedades';
        if (filter.ubicacion) message += ` en ${filter.ubicacion}`;
        if (filter.tipo) message += ` tipo ${filter.tipo}`;
        if (filter.precioMin > 0 || filter.precioMax < Infinity) {
            message += ` con precio entre $${filter.precioMin.toLocaleString('es-MX')} y $${filter.precioMax === Infinity ? '∞' : filter.precioMax.toLocaleString('es-MX')}`;
        }
        
        this.showToast(message + '...', 'info');
    }

    showClearMessage() {
        this.showToast('Filtros limpiados correctamente', 'success');
    }

    showToast(message, type = 'info') {
        // Remover toast anterior si existe
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            font-weight: 600;
            max-width: 300px;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentElement) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    renderImages() {
        const uploadFirstContainer = document.getElementById('upload-first-container');
        const imagesContainer = document.getElementById('images-container');
        const imagesGrid = document.getElementById('images-grid');

        if (!uploadFirstContainer || !imagesContainer || !imagesGrid) return;

        if (this.uploadedImages.length === 0) {
            uploadFirstContainer.style.display = 'block';
            imagesContainer.style.display = 'none';
            return;
        }

        uploadFirstContainer.style.display = 'none';
        imagesContainer.style.display = 'block';

        imagesGrid.innerHTML = this.uploadedImages.map((image, index) => `
            <div class="image-item ${index === 0 ? 'first-image' : ''}" 
                 draggable="true" 
                 data-image-id="${image.id}"
                 ondragstart="propertyManager.dragStart(event)"
                 ondragover="propertyManager.dragOver(event)"
                 ondrop="propertyManager.drop(event)">
                <img src="${image.dataUrl}" alt="${image.name}" class="image-preview">
                <div class="image-order">${index + 1}</div>
                ${index === 0 ? '<div class="first-badge">PRIMERA</div>' : ''}
                <div class="image-controls">
                    <button class="control-btn delete-btn" onclick="propertyManager.deleteImage('${image.id}')">×</button>
                </div>
            </div>
        `).join('');
    }

    dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.imageId);
        e.target.classList.add('dragging');
    }

    dragOver(e) {
        e.preventDefault();
    }

    drop(e) {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        const targetId = e.target.closest('.image-item')?.dataset.imageId;
        if (draggedId && targetId && draggedId !== targetId) {
            this.reorderImages(draggedId, targetId);
        }
        document.querySelectorAll('.image-item').forEach(item => item.classList.remove('dragging'));
    }

    reorderImages(draggedId, targetId) {
        const draggedIndex = this.uploadedImages.findIndex(img => img.id.toString() === draggedId);
        const targetIndex = this.uploadedImages.findIndex(img => img.id.toString() === targetId);
        if (draggedIndex !== -1 && targetIndex !== -1) {
            const [draggedImage] = this.uploadedImages.splice(draggedIndex, 1);
            this.uploadedImages.splice(targetIndex, 0, draggedImage);
            this.renderImages();
        }
    }

    deleteImage(imageId) {
        if (confirm('¿Eliminar esta imagen?')) {
            this.uploadedImages = this.uploadedImages.filter(img => img.id.toString() !== imageId);
            this.renderImages();
        }
    }

    initForm() {
        const form = document.getElementById('propiedadForm');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProperty(form);
        });
    }

    addProperty(form) {
        if (this.uploadedImages.length === 0) {
            alert('Debes subir al menos una imagen');
            return;
        }

        const formData = new FormData(form);
        const imageUrls = this.uploadedImages.map(img => img.dataUrl);

        const property = {
            id: Date.now(),
            nombre: formData.get('nombre'),
            tipo: formData.get('tipo'),
            precio: parseInt(formData.get('precio')),
            ubicacion: formData.get('ubicacion'),
            superficie: parseInt(formData.get('superficie')),
            habitaciones: parseInt(formData.get('habitaciones')) || 0,
            banos: parseInt(formData.get('banos')) || 0,
            estacionamientos: parseInt(formData.get('estacionamientos')) || 0,
            descripcion: formData.get('descripcion'),
            operacion: formData.get('operacion'),
            imagenes: imageUrls,
            fechaCreacion: new Date().toISOString()
        };

        this.properties.push(property);
        this.saveProperties(); // ← Faltaba esta función

        form.reset();
        this.uploadedImages = [];
        this.renderImages();
        this.displayAdminProperties();

        alert('¡Propiedad agregada exitosamente!');
    }

    displayProperties(filter = null) {
        const container = document.getElementById('properties-container');
        if (!container) {
            console.log('No se encontró el contenedor properties-container');
            return;
        }

        console.log('Mostrando propiedades, total:', this.properties.length);
        
        let propertiesToShow = filter ? this.filterProperties(filter) : this.properties;
        console.log('Propiedades después del filtro:', propertiesToShow.length);

        // Actualizar contador
        this.updateResultsCount(propertiesToShow.length);

        // Mostrar/ocultar mensaje de no hay propiedades
        const noPropertiesMessage = document.getElementById('no-properties-message');
        if (propertiesToShow.length === 0) {
            container.style.display = 'none';
            if (noPropertiesMessage) {
                noPropertiesMessage.style.display = 'block';
            }
            return;
        } else {
            container.style.display = 'grid';            if (noPropertiesMessage) {
                noPropertiesMessage.style.display = 'none';
            }
        }

        container.innerHTML = propertiesToShow.map(property => `
            <div class="property-card" onclick="propertyManager.viewProperty(${property.id})">
                <!-- Contenedor de imagen -->
                <div class="property-image-container">
                    <img class="property-img" src="${property.imagenes[0]}" alt="${property.nombre}">
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
                    <span class="price">$${this.formatPrice(property.precio)} MXN</span>
                    <span class="operation-badge">${property.operacion.toUpperCase()}</span>
                </div>
            </div>
        `).join('');
    }

    updateResultsCount(count) {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            if (count === 0) {
                resultsCount.textContent = 'No se encontraron propiedades';
            } else if (count === 1) {
                resultsCount.textContent = '1 propiedad encontrada';
            } else {
                resultsCount.textContent = `${count} propiedades encontradas`;
            }
        }
    }

    formatPrice(price) {
        return price.toLocaleString('es-MX');
    }    openPropertyModal(property) {
        // Ensure there's no existing modal
        this.closePropertyModal();

        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = "propertyModalOverlay";
        modal.className = 'property-modal-overlay';
        modal.innerHTML = `
            <div class="property-modal">
                <button class="modal-close" onclick="propertyManager.closePropertyModal()">&times;</button>
                
                <div class="modal-content">
                    <!-- Galería de fotos -->
                    <div class="modal-gallery">
                        <div class="gallery-main">
                            <img id="modal-main-image" src="${property.imagenes[0]}" alt="${property.nombre}">
                            ${property.imagenes.length > 1 ? `
                                <button class="gallery-nav prev" onclick="propertyManager.changeImage(-1)">&lt;</button>
                                <button class="gallery-nav next" onclick="propertyManager.changeImage(1)">&gt;</button>
                                <div class="image-counter">
                                    <span id="current-image">1</span> / ${property.imagenes.length}
                                </div>
                            ` : ''}
                        </div>
                        ${property.imagenes.length > 1 ? `
                            <div class="gallery-thumbnails">
                                ${property.imagenes.map((img, index) => `
                                    <img src="${img}" alt="Foto ${index + 1}" 
                                         class="thumbnail ${index === 0 ? 'active' : ''}" 
                                         onclick="propertyManager.setActiveImage(${index})">
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Información de la propiedad -->
                    <div class="modal-info">
                        <div class="modal-header">
                            <h2>${property.nombre}</h2>
                            <div class="modal-price">
                                <span class="price">$${this.formatPrice(property.precio)} MXN</span>
                                <span class="operation-badge">${property.operacion.toUpperCase()}</span>
                            </div>
                        </div>

                        <div class="modal-location">
                            📍 ${property.ubicacion}
                        </div>

                        <div class="modal-features">
                            <div class="feature">
                                🏠 <span>Superficie: ${property.superficie} m²</span>
                            </div>
                            ${property.habitaciones > 0 ? `
                                <div class="feature">
                                    🛏️ <span>Habitaciones: ${property.habitaciones}</span>
                                </div>
                            ` : ''}
                            ${property.banos > 0 ? `
                                <div class="feature">
                                    🚿 <span>Baños: ${property.banos}</span>
                                </div>
                            ` : ''}
                            ${property.estacionamientos > 0 ? `
                                <div class="feature">
                                    🚗 <span>Estacionamientos: ${property.estacionamientos}</span>
                                </div>
                            ` : ''}
                        </div>                        <div class="modal-description">
                            <h3>Descripción</h3>
                            <p>${property.descripcion}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Variables para galería
        this.currentImageIndex = 0;
        this.modalImages = property.imagenes;
        this.currentProperty = property;

        // Add modal to the DOM
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Ensure modal is visible
        setTimeout(() => {
            modal.style.opacity = "1";
        }, 10);

        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closePropertyModal();
            }
        });
    }

    viewProperty(id) {
        const property = this.properties.find(p => p.id === id);
        if (!property) return;
        this.openPropertyModal(property);
    }

    closePropertyModal() {
        const modal = document.getElementById('propertyModalOverlay');
        if (modal) {
            document.body.style.overflow = '';
            modal.remove();
        }
    }

    changeImage(direction) {
        this.currentImageIndex += direction;
        
        if (this.currentImageIndex >= this.modalImages.length) {
            this.currentImageIndex = 0;
        } else if (this.currentImageIndex < 0) {
            this.currentImageIndex = this.modalImages.length - 1;
        }

        this.updateModalImage();
    }

    setActiveImage(index) {
        this.currentImageIndex = index;
        this.updateModalImage();
    }

    updateModalImage() {
        const mainImage = document.getElementById('modal-main-image');
        const counter = document.getElementById('current-image');
        const thumbnails = document.querySelectorAll('.thumbnail');

        if (mainImage) {
            mainImage.src = this.modalImages[this.currentImageIndex];
        }

        if (counter) {
            counter.textContent = this.currentImageIndex + 1;
        }

        // Actualizar thumbnails activos
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentImageIndex);
        });
    }

    displayAdminProperties() {
        const container = document.getElementById('admin-properties-container');
        if (!container) return;

        container.innerHTML = this.properties.map(property => `
            <div class="admin-property-card">
                <img src="${property.imagenes[0]}" alt="${property.nombre}" class="admin-property-image">
                <div class="admin-property-info">
                    <h4>${property.nombre}</h4>
                    <p>$${this.formatPrice(property.precio)} - ${property.operacion}</p>
                    <p>${property.ubicacion}</p>
                </div>
                <button class="delete-btn" onclick="propertyManager.deleteProperty(${property.id})">
                    Eliminar
                </button>
            </div>
        `).join('');
    }

    deleteProperty(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
            this.properties = this.properties.filter(p => p.id !== id);
            this.saveProperties();
            this.displayAdminProperties();
        }
    }

    saveProperties() {
        localStorage.setItem('properties', JSON.stringify(this.properties));
        console.log('Propiedades guardadas:', this.properties.length);
    }

    // Actualizar propiedades por defecto con más variedad para probar filtros
    getDefaultProperties() {
        return [
            {
                id: 1,
                nombre: "Casa en Venta Cumbres Platinum",
                tipo: "casa",
                precio: 3590000,
                ubicacion: "Monterrey, Nuevo León",
                superficie: 231,
                habitaciones: 4,
                banos: 4,
                estacionamientos: 3,
                descripcion: "Hermosa casa en exclusivo fraccionamiento Cumbres Platinum con acabados de lujo y excelente ubicación.",
                operacion: "venta",
                imagenes: ["https://via.placeholder.com/400x200/0b71b9/ffffff?text=Casa+Cumbres+Platinum"],
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 2,
                nombre: "Terreno en Venta Marín N.L.",
                tipo: "terreno",
                precio: 4290000,
                ubicacion: "Marín, Nuevo León",
                superficie: 30437,
                habitaciones: 0,
                banos: 0,
                estacionamientos: 0,
                descripcion: "Excelente terreno en Hacienda Los Portones con gran potencial de desarrollo.",
                operacion: "venta",
                imagenes: ["https://via.placeholder.com/400x200/28a745/ffffff?text=Terreno+Marin"],
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 3,
                nombre: "Departamento en Renta San Pedro",
                tipo: "departamento",
                precio: 25000,
                ubicacion: "San Pedro Garza García, Nuevo León",
                superficie: 120,
                habitaciones: 2,
                banos: 2,
                estacionamientos: 1,
                descripcion: "Moderno departamento en zona residencial de San Pedro.",
                operacion: "renta",
                imagenes: ["https://via.placeholder.com/400x200/17a2b8/ffffff?text=Depto+San+Pedro"],
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 4,
                nombre: "Casa en Venta Santa Catarina",
                tipo: "casa",
                precio: 2800000,
                ubicacion: "Santa Catarina, Nuevo León",
                superficie: 180,
                habitaciones: 3,
                banos: 2,
                estacionamientos: 2,
                descripcion: "Casa familiar en excelente ubicación con jardín amplio.",
                operacion: "venta",
                imagenes: ["https://via.placeholder.com/400x200/fd7e14/ffffff?text=Casa+Santa+Catarina"],
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 5,
                nombre: "Local Comercial García",
                tipo: "local",
                precio: 18000,
                ubicacion: "García, Nuevo León",
                superficie: 85,
                habitaciones: 0,
                banos: 1,
                estacionamientos: 2,
                descripcion: "Local comercial en zona de alto tráfico vehicular.",
                operacion: "renta",
                imagenes: ["https://via.placeholder.com/400x200/6f42c1/ffffff?text=Local+Garcia"],
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 6,
                nombre: "Rancho en Doctor Arroyo",
                tipo: "rancho",
                precio: 8500000,
                ubicacion: "Doctor Arroyo, Nuevo León",
                superficie: 50000,
                habitaciones: 3,
                banos: 2,
                estacionamientos: 0,
                descripcion: "Amplio rancho con casa habitación y terreno para ganado.",
                operacion: "venta",
                imagenes: ["https://via.placeholder.com/400x200/20c997/ffffff?text=Rancho+Dr+Arroyo"],
                fechaCreacion: new Date().toISOString()
            }
        ];
    }
    
}

// Iniciar
document.addEventListener('DOMContentLoaded', () => {
    window.propertyManager = new PropertyManager();
});
