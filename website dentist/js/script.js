document.addEventListener('DOMContentLoaded', () => {

    // === Smooth Scrolling for Nav Links ===
    document.querySelectorAll('header nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // === App State ===
    let map;
    let userMarker;
    let clinicMarkers = [];
    let currentUserPosition = { lat: -6.2088, lng: 106.8456 }; // Default to Jakarta
    let lastOpenedPopup = null;

    // === DOM Elements ===
    const findNearbyBtn = document.getElementById('find-nearby-btn');
    const clinicList = document.getElementById('clinic-list');
    const resultsInfo = document.getElementById('results-info');
    const modal = document.getElementById('clinic-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('modal-close-btn');

    // === Rich Dummy Data for Clinics ===
    const dummyClinics = [
        // Jakarta
        { 
            id: 1, name: 'Klinik Gigi Sehat Sentosa', lat: -6.229728, lng: 106.827149, city: 'Jakarta', address: 'Jl. Jenderal Sudirman Kav. 52-53', rating: 4.8, reviews: 120, hours: '09:00-21:00', open: true,
            details: {
                gallery: ['https://via.placeholder.com/400x300.png?text=Lobby', 'https://via.placeholder.com/400x300.png?text=Ruang+Periksa', 'https://via.placeholder.com/400x300.png?text=Alat+Canggih'],
                services: ['Scaling', 'Tambal Gigi', 'Behel (Orthodontics)', 'Implant Gigi', 'Gigi Tiruan'],
                doctors: ['Drg. Budi Hartono, Sp.Ort', 'Drg. Citra Lestari'],
                userReviews: [{ author: 'Ahmad', comment: 'Pelayanan sangat memuaskan dan tempatnya bersih!' }]
            }
        },
        { id: 2, name: 'Smile Bright Dental Care', lat: -6.21462, lng: 106.84513, city: 'Jakarta', address: 'Jl. Menteng Raya No.62', rating: 4.9, reviews: 150, hours: '10:00-20:00', open: true, details: { services: ['Scaling', 'Veneer'] } },
        { id: 3, name: 'Klinik Gigi Keluarga Ceria', lat: -6.241586, lng: 106.822456, city: 'Jakarta', address: 'Jl. Kemang Raya No. 1', rating: 4.7, reviews: 95, hours: '08:00-19:00', open: false, details: { services: ['Perawatan Gigi Anak'] } },
        { id: 4, name: 'Pusat Gigi Modern', lat: -6.175392, lng: 106.827153, city: 'Jakarta', address: 'Jl. Medan Merdeka Barat', rating: 4.6, reviews: 88, hours: '11:00-22:00', open: true, details: { services: ['Implant', 'Behel', 'Scaling'], doctors: ['Drg. Sari'], userReviews: [{ author: 'Dewi', comment: 'Tempatnya nyaman.' }] } },
        { id: 5, name: 'Dental Pro Clinic', lat: -6.261493, lng: 106.810620, city: 'Jakarta', address: 'Pondok Indah Mall 2', rating: 4.9, reviews: 210, hours: '10:00-21:00', open: true, details: { services: ['Bleaching', 'Crown', 'Gigi Palsu'], doctors: ['Drg. Rendy'], userReviews: [{ author: 'Rina', comment: 'Pelayanan cepat.' }] } },
        { id: 6, name: 'Orchid Dental', lat: -6.194749, lng: 106.786316, city: 'Jakarta', address: 'Central Park Mall', rating: 4.8, reviews: 180, hours: '10:00-21:00', open: true, details: { services: ['Scaling', 'Tambal'], doctors: ['Drg. Lilis'], userReviews: [{ author: 'Budi', comment: 'Dokternya ramah.' }] } },
        { id: 7, name: 'Kelapa Gading Dental Center', lat: -6.156917, lng: 106.908480, city: 'Jakarta', address: 'Jl. Boulevard Raya, Kelapa Gading', rating: 4.7, reviews: 155, hours: '09:00-20:00', open: false, details: { services: ['Behel', 'Implant'], doctors: ['Drg. Andi'], userReviews: [{ author: 'Sinta', comment: 'Hasil rapi.' }] } },
        { id: 8, name: 'East Jakarta Dental Care', lat: -6.224100, lng: 106.900100, city: 'Jakarta', address: 'Jl. Pemuda No. 1, Rawamangun', rating: 4.5, reviews: 75, hours: '09:00-17:00', open: true, details: { services: ['Scaling', 'Gigi Anak'], doctors: ['Drg. Fajar'], userReviews: [{ author: 'Tono', comment: 'Cocok untuk anak-anak.' }] } },
        // Bandung
        { id: 9, name: 'Bandung Smile Center', lat: -6.90389, lng: 107.61861, city: 'Bandung', address: 'Jl. Asia Afrika No.1', rating: 4.9, reviews: 190, hours: '09:00-20:00', open: true, details: { gallery: ['https://via.placeholder.com/400x300.png?text=Tampak+Depan', 'https://via.placeholder.com/400x300.png?text=Ruang+Tunggu'], services: ['Veneer', 'Bleaching (Pemutihan Gigi)', 'Bedah Mulut Minor'], doctors: ['Drg. Rina Wulandari, Sp.KG', 'Drg. Dedi Setiawan'], userReviews: [{ author: 'Siti', comment: 'Dokter dan perawatnya ramah-ramah.' }] } },
        { id: 10, name: 'Gigi Sehat Dago', lat: -6.8833, lng: 107.615, city: 'Bandung', address: 'Jl. Ir. H. Juanda No. 100', rating: 4.8, reviews: 150, hours: '10:00-21:00', open: false, details: { services: ['Scaling', 'Behel'], doctors: ['Drg. Dadan'], userReviews: [{ author: 'Ayu', comment: 'Tempat strategis.' }] } },
        { id: 11, name: 'Klinik Pasteur Dental', lat: -6.894, lng: 107.591, city: 'Bandung', address: 'Jl. Dr. Djunjunan No. 150', rating: 4.7, reviews: 110, hours: '08:00-18:00', open: true, details: { services: ['Implant', 'Crown'], doctors: ['Drg. Nia'], userReviews: [{ author: 'Rizky', comment: 'Harga terjangkau.' }] } },
        { id: 12, name: 'Bandung Dental Care', lat: -6.9175, lng: 107.6191, city: 'Bandung', address: 'Jl. Braga No. 10', rating: 4.6, reviews: 80, hours: '09:00-17:00', open: true, details: { services: ['Scaling', 'Gigi Anak'], doctors: ['Drg. Sari'], userReviews: [{ author: 'Dian', comment: 'Anak saya suka.' }] } },
        { id: 13, name: 'Dago Dental Clinic', lat: -6.8875, lng: 107.6131, city: 'Bandung', address: 'Jl. Dago No. 50', rating: 4.7, reviews: 95, hours: '10:00-20:00', open: true, details: { services: ['Behel', 'Bleaching'], doctors: ['Drg. Rina'], userReviews: [{ author: 'Fahmi', comment: 'Proses cepat.' }] } },
        // Surabaya
        { id: 14, name: 'Surabaya Dental Clinic', lat: -7.2575, lng: 112.7521, city: 'Surabaya', address: 'Jl. Basuki Rahmat No. 8-12', rating: 4.9, reviews: 250, hours: '10:00-22:00', open: true, details: { gallery: ['https://via.placeholder.com/400x300.png?text=Interior+Modern', 'https://via.placeholder.com/400x300.png?text=Peralatan+Modern'], services: ['Perawatan Saluran Akar', 'Gigi Palsu Premium', 'Dental Spa'], doctors: ['Drg. Eko Prasetyo, Sp.Pros', 'Drg. Wati Halim'], userReviews: [{ author: 'Bambang', comment: 'Hasilnya sangat bagus, melebihi ekspektasi.' }] } },
        { id: 15, name: 'Klinik Gigi Dharmahusada', lat: -7.2699, lng: 112.766, city: 'Surabaya', address: 'Jl. Dharmahusada Indah Timur', rating: 4.8, reviews: 175, hours: '09:00-20:00', open: true, details: { services: ['Scaling', 'Implant'], doctors: ['Drg. Sinta'], userReviews: [{ author: 'Lina', comment: 'Tempatnya luas.' }] } },
        { id: 16, name: 'Tunjungan Dental Center', lat: -7.255, lng: 112.74, city: 'Surabaya', address: 'Jl. Tunjungan No. 50', rating: 4.7, reviews: 130, hours: '10:00-20:00', open: false, details: { services: ['Behel', 'Bleaching'], doctors: ['Drg. Dwi'], userReviews: [{ author: 'Rudi', comment: 'Dekat mall.' }] } },
        { id: 17, name: 'Surabaya Smile Clinic', lat: -7.265, lng: 112.734, city: 'Surabaya', address: 'Jl. Pemuda No. 20', rating: 4.6, reviews: 90, hours: '09:00-18:00', open: true, details: { services: ['Scaling', 'Gigi Anak'], doctors: ['Drg. Fajar'], userReviews: [{ author: 'Maya', comment: 'Anak-anak nyaman.' }] } },
        { id: 18, name: 'Gigi Sehat Surabaya', lat: -7.275, lng: 112.75, city: 'Surabaya', address: 'Jl. Diponegoro No. 100', rating: 4.8, reviews: 120, hours: '10:00-21:00', open: true, details: { services: ['Implant', 'Crown'], doctors: ['Drg. Rina'], userReviews: [{ author: 'Dewi', comment: 'Pelayanan ramah.' }] } },
        // Medan
        { id: 19, name: 'Medan Dental Center', lat: 3.5952, lng: 98.6722, city: 'Medan', address: 'Jl. Gatot Subroto No. 1', rating: 4.7, reviews: 110, hours: '09:00-20:00', open: true, details: { services: ['Scaling', 'Behel'], doctors: ['Drg. Andi'], userReviews: [{ author: 'Putri', comment: 'Tempat bersih.' }] } },
        { id: 20, name: 'Smile Medan Clinic', lat: 3.5897, lng: 98.6742, city: 'Medan', address: 'Jl. Sisingamangaraja No. 10', rating: 4.6, reviews: 80, hours: '10:00-19:00', open: true, details: { services: ['Bleaching', 'Gigi Anak'], doctors: ['Drg. Sari'], userReviews: [{ author: 'Rizal', comment: 'Anak saya suka.' }] } },
        { id: 21, name: 'Klinik Gigi Medan Sehat', lat: 3.5912, lng: 98.6782, city: 'Medan', address: 'Jl. Iskandar Muda No. 5', rating: 4.8, reviews: 95, hours: '09:00-17:00', open: false, details: { services: ['Implant', 'Scaling'], doctors: ['Drg. Nia'], userReviews: [{ author: 'Dian', comment: 'Hasil memuaskan.' }] } },
        // Semarang
        { id: 22, name: 'Semarang Dental Care', lat: -6.9667, lng: 110.4167, city: 'Semarang', address: 'Jl. Pandanaran No. 20', rating: 4.7, reviews: 100, hours: '09:00-20:00', open: true, details: { services: ['Scaling', 'Behel'], doctors: ['Drg. Rina'], userReviews: [{ author: 'Bima', comment: 'Tempat strategis.' }] } },
        { id: 23, name: 'Klinik Gigi Simpang Lima', lat: -6.9845, lng: 110.4181, city: 'Semarang', address: 'Jl. Simpang Lima No. 2', rating: 4.6, reviews: 85, hours: '10:00-19:00', open: true, details: { services: ['Bleaching', 'Gigi Anak'], doctors: ['Drg. Sari'], userReviews: [{ author: 'Rina', comment: 'Dekat pusat kota.' }] } },
        { id: 24, name: 'Smile Semarang Clinic', lat: -6.9900, lng: 110.4200, city: 'Semarang', address: 'Jl. Gajahmada No. 15', rating: 4.8, reviews: 120, hours: '09:00-17:00', open: true, details: { services: ['Implant', 'Crown'], doctors: ['Drg. Nia'], userReviews: [{ author: 'Dewi', comment: 'Pelayanan ramah.' }] } },
        // Bali
        { id: 25, name: 'Bali Dental Clinic', lat: -8.6500, lng: 115.2167, city: 'Denpasar', address: 'Jl. Teuku Umar No. 30', rating: 4.9, reviews: 140, hours: '09:00-21:00', open: true, details: { services: ['Scaling', 'Behel'], doctors: ['Drg. Putu'], userReviews: [{ author: 'Wayan', comment: 'Sangat profesional.' }] } },
        { id: 26, name: 'Denpasar Smile Center', lat: -8.6700, lng: 115.2120, city: 'Denpasar', address: 'Jl. Diponegoro No. 25', rating: 4.8, reviews: 110, hours: '10:00-20:00', open: true, details: { services: ['Bleaching', 'Gigi Anak'], doctors: ['Drg. Ayu'], userReviews: [{ author: 'Komang', comment: 'Tempat nyaman.' }] } },
        { id: 27, name: 'Klinik Gigi Kuta', lat: -8.7237, lng: 115.1750, city: 'Kuta', address: 'Jl. Kartika Plaza No. 88', rating: 4.7, reviews: 90, hours: '09:00-18:00', open: true, details: { services: ['Implant', 'Scaling'], doctors: ['Drg. Made'], userReviews: [{ author: 'Ketut', comment: 'Dekat pantai.' }] } },
        { id: 28, name: 'Ubud Dental Care', lat: -8.5190, lng: 115.2630, city: 'Ubud', address: 'Jl. Raya Ubud No. 10', rating: 4.8, reviews: 100, hours: '10:00-19:00', open: false, details: { services: ['Behel', 'Bleaching'], doctors: ['Drg. Gede'], userReviews: [{ author: 'Nyoman', comment: 'Suasana asri.' }] } },
        { id: 29, name: 'Sanur Dental Clinic', lat: -8.6938, lng: 115.2533, city: 'Sanur', address: 'Jl. Danau Tamblingan No. 50', rating: 4.6, reviews: 80, hours: '09:00-17:00', open: true, details: { services: ['Scaling', 'Gigi Anak'], doctors: ['Drg. Rai'], userReviews: [{ author: 'Desak', comment: 'Cocok untuk keluarga.' }] } },
        { id: 30, name: 'Nusa Dua Dental Center', lat: -8.8081, lng: 115.2252, city: 'Nusa Dua', address: 'Jl. Nusa Dua No. 1', rating: 4.7, reviews: 95, hours: '10:00-20:00', open: true, details: { services: ['Implant', 'Crown'], doctors: ['Drg. Oka'], userReviews: [{ author: 'Agus', comment: 'Pelayanan memuaskan.' }] } },
    ];

    function initMap(lat, lng) {
        currentUserPosition = { lat, lng };
        
        if (map) {
            map.setView([lat, lng], 13);
        } else {
            map = L.map('map').setView([lat, lng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }

        // Add or update user location marker
        if (userMarker) {
            userMarker.setLatLng([lat, lng]);
        } else {
            userMarker = L.marker([lat, lng], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).addTo(map)
                .bindPopup('<b>Lokasi Anda</b>')
                .openPopup();
        }

        filterAndDisplayClinics();
    }

    function addClinicMarkers(clinics) {
        // Clear previous clinic markers
        clinicMarkers.forEach(marker => map.removeLayer(marker));
        clinicMarkers = [];

        clinics.forEach(clinic => {
            const distance = calculateDistance(currentUserPosition.lat, currentUserPosition.lng, clinic.lat, clinic.lng).toFixed(1);
            const marker = L.marker([clinic.lat, clinic.lng]).addTo(map);
            const popupContent = `<b>${clinic.name}</b><br>${clinic.address}, ${clinic.city}<br>Jarak: ${distance} km`;
            marker.bindPopup(popupContent);

            marker.on('click', () => {
                highlightCard(clinic.id, true);
                lastOpenedPopup = marker;
            });
            
            clinic.marker = marker; // Associate marker with clinic data
            clinicMarkers.push(marker);
        });
        
        map.on('click', () => {
             unhighlightAllCards();
        });
    }

    function updateClinicList(clinics) {
        clinicList.innerHTML = ''; // Clear existing list
        clinicList.classList.add('loading');

        setTimeout(() => { // Simulate network delay
            resultsInfo.textContent = `Menampilkan ${clinics.length} dari ${dummyClinics.length} klinik.`;
            if (clinics.length === 0) {
                clinicList.innerHTML = '<p style="text-align: center; width: 100%;">Tidak ada klinik yang ditemukan sesuai kriteria Anda.</p>';
            } else {
                clinics.forEach(clinic => {
                    const distance = calculateDistance(currentUserPosition.lat, currentUserPosition.lng, clinic.lat, clinic.lng).toFixed(1);
                    const card = document.createElement('div');
                    card.className = 'clinic-card';
                    card.dataset.clinicId = clinic.id;
                    card.innerHTML = `
                        <img src="${clinic.details?.gallery?.[0] || 'https://via.placeholder.com/300x200.png?text=Klinik'}" alt="Foto ${clinic.name}">
                        <div class="clinic-card-content">
                            <h3>${clinic.name}</h3>
                            <div class="clinic-meta">
                                <span class="distance"><i class="fas fa-road"></i> ${distance} km</span>
                                <span class="rating"><i class="fas fa-star"></i> ${clinic.rating} (${clinic.reviews} reviews)</span>
                            </div>
                            <div class="clinic-hours">
                                <i class="fas fa-clock"></i> ${clinic.open ? 'Buka' : 'Tutup'}: ${clinic.hours}
                            </div>
                            <div class="card-buttons">
                                <button class="btn-secondary btn-detail">Detail</button>
                                <button class="btn-primary" onclick="alert('Mengarahkan ke ${clinic.name}...')">Arahkan</button>
                            </div>
                        </div>
                    `;
                    clinicList.appendChild(card);
                });
            }
            clinicList.classList.remove('loading');
        }, 300); // 300ms delay
    }

    function filterAndDisplayClinics() {
        const radius = parseFloat(document.getElementById('radius-filter').value);
        const minRating = parseFloat(document.getElementById('rating-filter').value);
        const openNow = document.getElementById('open-now-filter').checked;
        const searchTerm = document.getElementById('search-input').value.toLowerCase();

        const filteredClinics = dummyClinics.filter(clinic => {
            const distance = calculateDistance(currentUserPosition.lat, currentUserPosition.lng, clinic.lat, clinic.lng);

            const inRadius = distance <= radius;
            const hasGoodRating = clinic.rating >= minRating;
            const isOpen = !openNow || clinic.open;
            const matchesSearch = clinic.name.toLowerCase().includes(searchTerm) ||
                                  clinic.address.toLowerCase().includes(searchTerm) ||
                                  clinic.city.toLowerCase().includes(searchTerm);

            return inRadius && hasGoodRating && isOpen && matchesSearch;
        });

        addClinicMarkers(filteredClinics);
        updateClinicList(filteredClinics);
    }

    // === Event Delegation for Clinic Cards ===
    clinicList.addEventListener('click', e => {
        const card = e.target.closest('.clinic-card');
        if (!card) return;

        const clinicId = parseInt(card.dataset.clinicId);
        const clinic = dummyClinics.find(c => c.id === clinicId);

        if (e.target.classList.contains('btn-detail')) {
            showClinicModal(clinic);
        } else {
            // Fly to location on map
            map.flyTo([clinic.lat, clinic.lng], 15);
            clinic.marker.openPopup();
            highlightCard(clinicId, false);
            lastOpenedPopup = clinic.marker;
        }
    });

    // === Modal Logic ===
    function showClinicModal(clinic) {
        modalBody.innerHTML = `
            <div class="modal-clinic-header">
                <h2>${clinic.name}</h2>
                <p>${clinic.address}, ${clinic.city}</p>
            </div>
            ${clinic.details.gallery ? `
            <div class="modal-section">
                <h4>Galeri</h4>
                <div class="clinic-gallery">
                    ${clinic.details.gallery.map(img => `<img src="${img}" alt="Galeri ${clinic.name}">`).join('')}
                </div>
            </div>` : ''}
            ${clinic.details.services ? `
            <div class="modal-section">
                <h4>Layanan Unggulan</h4>
                <ul>${clinic.details.services.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>` : ''}
            ${clinic.details.doctors ? `
            <div class="modal-section">
                <h4>Dokter Praktik</h4>
                <ul>${clinic.details.doctors.map(d => `<li>${d}</li>`).join('')}</ul>
            </div>` : ''}
            ${clinic.details.userReviews ? `
            <div class="modal-section">
                <h4>Ulasan Pasien</h4>
                ${clinic.details.userReviews.map(r => `
                    <div class="review">
                        <p>"${r.comment}"</p>
                        <p class="review-author">- ${r.author}</p>
                    </div>`).join('')}
            </div>` : ''}
        `;
        modal.classList.add('active');
    }

    function hideClinicModal() {
        modal.classList.remove('active');
    }

    closeModalBtn.addEventListener('click', hideClinicModal);
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            hideClinicModal();
        }
    });

    // === Card Highlighting Logic ===
    function highlightCard(clinicId, fromMarker) {
        unhighlightAllCards();
        const card = document.querySelector(`.clinic-card[data-clinic-id="${clinicId}"]`);
        if (card) {
            card.classList.add('active');
            if (!fromMarker) { // If click from card, scroll it into view
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }

    function unhighlightAllCards() {
        document.querySelectorAll('.clinic-card.active').forEach(c => c.classList.remove('active'));
    }

    // === Geolocation API ===
    findNearbyBtn.addEventListener('click', () => {
        if ('geolocation' in navigator) {
            findNearbyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari lokasi...';
            findNearbyBtn.disabled = true;
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                initMap(latitude, longitude);
                findNearbyBtn.style.display = 'none'; // Hide button after use
            }, error => {
                console.error('Error getting location:', error);
                alert('Tidak bisa mendapatkan lokasi. Menampilkan lokasi default (Jakarta).');
                initMap(-6.2088, 106.8456);
                findNearbyBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Gunakan Lokasi Saya';
                findNearbyBtn.disabled = false;
            });
        } else {
            alert('Geolocation tidak didukung oleh browser Anda.');
            initMap(-6.2088, 106.8456);
        }
    });

    // === Filter Event Listeners ===
    const filterElements = ['radius-filter', 'rating-filter', 'open-now-filter'];
    filterElements.forEach(id => document.getElementById(id).addEventListener('change', filterAndDisplayClinics));
    document.getElementById('search-btn').addEventListener('click', filterAndDisplayClinics);
    document.getElementById('search-input').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            filterAndDisplayClinics();
        }
    });

    document.getElementById('clear-filters-btn').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        document.getElementById('radius-filter').selectedIndex = 0;
        document.getElementById('rating-filter').selectedIndex = 0;
        document.getElementById('open-now-filter').checked = false;
        filterAndDisplayClinics();
    });

    // === Helper Function to Calculate Distance (Haversine formula) ===
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // === Initial state (show map of Jakarta by default) ===
    function showDefaultView() {
        initMap(currentUserPosition.lat, currentUserPosition.lng);
    }
    
    showDefaultView();

});
