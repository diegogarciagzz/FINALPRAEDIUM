class PropertyManager {
    constructor() {
        this.properties = JSON.parse(localStorage.getItem('properties')) || this.getDefaultProperties();
        this.init();
    }

    // Propiedades de ejemplo como en la imagen
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
                descripcion: "Hermosa casa en exclusivo fraccionamiento Cumbres Platinum",
                operacion: "venta",
                imagenes: ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="],
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 2,
                nombre: "Terreno en Venta Marín N.L. (Hacienda Los Portones)",
                tipo: "terreno",
                precio: 4290000,
                ubicacion: "Marín, Nuevo León",
                superficie: 30437.45,
                habitaciones: 0,
                banos: 0,
                estacionamientos: 0,
                descripcion: "Excelente terreno en Hacienda Los Portones",
                operacion: "venta",
                imagenes: ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="],
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 3,
                nombre: "Rancho en Venta Doctor Arroyo N.L.",
                tipo: "rancho",
                precio: 10290000,
                ubicacion: "Dr. Arroyo, Nuevo León",
                superficie: 118,
                habitaciones: 1,
                banos: 4,
                estacionamientos: 0,
                descripcion: "Hermoso rancho en Doctor Arroyo",
                operacion: "venta",
                imagenes: ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="],
                fechaCreacion: new Date().toISOString()
            }
        ];
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
        const form = document.getElementById('propiedadForm');
        const imageInput = document.getElementById('imagenes');
        const previewContainer = document.getElementById('preview-container');

        imageInput?.addEventListener('change', (e) => {
            this.previewImages(e.target.files, previewContainer);
        });

        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProperty(form);
        });

        this.displayAdminProperties();
    }

    initProperties() {
        this.displayProperties();
        this.initFilters();
    }

    displayProperties(filter = null) {
        const container = document.getElementById('properties-container');
        if (!container) return;

        let propertiesToShow = filter ? this.filterProperties(filter) : this.properties;

        if (propertiesToShow.length === 0) {
            container.innerHTML = '<p class="no-properties">No se encontraron propiedades.</p>';
            return;
        }

        container.innerHTML = propertiesToShow.map(property => `
            <div class="property-card">
                <div class="property-images">
                    <button class="favorite-btn" onclick="propertyManager.toggleFavorite(${property.id})">
                        ♡
                    </button>
                    <img src="${property.imagenes[0]}" alt="${property.nombre}" class="property-main-image">
                    <div class="property-badge ${property.operacion}">${property.operacion}</div>
                    <div class="property-price">$${this.formatPrice(property.precio)} MXN</div>
                </div>
                <div class="property-info">
                    <h3>${property.nombre}</h3>
                    <div class="property-location">
                        📍 ${property.ubicacion}
                    </div>
                    <div class="property-details">
                        <span class="superficie">🏠 ${property.superficie} m²</span>
                        ${property.habitaciones > 0 ? `<span class="habitaciones">🛏️ ${property.habitaciones}</span>` : ''}
                        ${property.banos > 0 ? `<span class="banos">🚿 ${property.banos}</span>` : ''}
                        ${property.estacionamientos > 0 ? `<span class="estacionamientos">🚗 ${property.estacionamientos}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    formatPrice(price) {
        return price.toLocaleString('es-MX');
    }

    toggleFavorite(id) {
        // Aquí podrías implementar la funcionalidad de favoritos
        console.log('Toggled favorite for property:', id);
    }

    previewImages(files, container) {
        container.innerHTML = '';
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '100px';
                img.style.height = '100px';
                img.style.objectFit = 'cover';
                img.style.margin = '5px';
                img.style.borderRadius = '5px';
                container.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }

    addProperty(form) {
        const formData = new FormData(form);
        const images = Array.from(document.getElementById('imagenes').files);
        
        const imagePromises = images.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(imagePromises).then(imageDataUrls => {
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
                imagenes: imageDataUrls,
                fechaCreacion: new Date().toISOString()
            };

            this.properties.push(property);
            this.saveProperties();
            form.reset();
            document.getElementById('preview-container').innerHTML = '';
            this.displayAdminProperties();
            
            alert('Propiedad agregada exitosamente!');
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

    initFilters() {
        const applyBtn = document.getElementById('apply-filters');

        applyBtn?.addEventListener('click', () => {
            const filter = {
                ubicacion: document.getElementById('filter-ubicacion').value,
                tipo: document.getElementById('filter-tipo').value,
                precioMin: this.parsePrice(document.getElementById('filter-precio-min').value) || 0,
                precioMax: this.parsePrice(document.getElementById('filter-precio-max').value) || Infinity
            };
            this.displayProperties(filter);
        });
    }

    parsePrice(priceString) {
        if (!priceString) return 0;
        return parseInt(priceString.replace(/[^0-9]/g, ''));
    }

    filterProperties(filter) {
        return this.properties.filter(property => {
            return (!filter.ubicacion || property.ubicacion.toLowerCase().includes(filter.ubicacion.toLowerCase())) &&
                   (!filter.tipo || property.tipo === filter.tipo) &&
                   (property.precio >= filter.precioMin) &&
                   (property.precio <= filter.precioMax);
        });
    }

    saveProperties() {
        localStorage.setItem('properties', JSON.stringify(this.properties));
    }
}

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    window.propertyManager = new PropertyManager();
});