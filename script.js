const parkingData = [
    { id: 1, name: "Parking Główny - Kampus A", address: "ul. prof. Bohdana Stefanowskiego", zone: "A", price: "Darmowy", totalSpots: 10, img: "images (1).jpg", closingTime: "22:00" },
    { id: 2, name: "Parking Wydziału EEIA", address: "ul. Stefanowskiego 18/22", zone: "A", price: "Darmowy", totalSpots: 6, img: "images (2).jpg", closingTime: "20:00" },
    { id: 3, name: "Zatoka Sportu", address: "al. Politechniki 10", zone: "B", price: "2.00 zł/h", totalSpots: 12, img: "images (3).jpg", closingTime: "22:00" },
    { id: 4, name: "Parking WFTiMS", address: "ul. Wólczańska 215", zone: "B", price: "Darmowy", totalSpots: 8, img: "images(4).jpg", closingTime: "20:00" },
    { id: 5, name: "Parking przy Bibliotece", address: "ul. Wólczańska 223", zone: "C", price: "Darmowy", totalSpots: 10, img: "images(5).jpg", closingTime: "20:00" }
];

const parkingListContainer = document.getElementById('parking-list');
const zoneButtons = document.querySelectorAll('.zone-btn');

// Модальні вікна
const modal = document.getElementById('booking-modal');
const qrModal = document.getElementById('qr-modal');
const profileModal = document.getElementById('profile-modal');
const mapModal = document.getElementById('map-modal');
const timerModal = document.getElementById('timer-modal');
const notifModal = document.getElementById('notification-modal');

let currentParking = null;
let selectedSpot = null;

// Функції пам'яті для місць
function getBookedSpots(parkingId) {
    const data = localStorage.getItem(`bookedSpots_${parkingId}`);
    return data ? JSON.parse(data) : [];
}

// Рендер парковок
function renderParkings(filterZone = 'all') {
    parkingListContainer.innerHTML = '';
    const filteredData = filterZone === 'all' ? parkingData : parkingData.filter(p => p.zone === filterZone);

    filteredData.forEach(parking => {
        const bookedCount = getBookedSpots(parking.id).length;
        const available = parking.totalSpots - bookedCount;
        
        const card = document.createElement('div');
        card.className = 'parking-card';
        card.innerHTML = `
            <div class="card-image" style="background-image: url('${parking.img}')">
                <div class="status-badge ${available === 0 ? 'full' : ''}">
                    ${available === 0 ? 'Brak miejsc' : `${available} wolnych miejsc`}
                </div>
            </div>
            <div class="card-info">
                <h3>${parking.name}</h3>
                <p class="address">${parking.address} • Zamykany: ${parking.closingTime}</p>
                <p class="price">${parking.price}</p>
            </div>
        `;
        
        card.addEventListener('click', () => openBookingModal(parking));
        parkingListContainer.appendChild(card);
    });
}

function openBookingModal(parking) {
    currentParking = parking;
    selectedSpot = null;
    document.getElementById('modal-title').textContent = parking.name;
    document.getElementById('modal-price').textContent = parking.price;
    const spotsGrid = document.getElementById('spots-grid');
    spotsGrid.innerHTML = ''; 

    const bookedSpots = getBookedSpots(parking.id);

    for (let i = 1; i <= parking.totalSpots; i++) {
        const spotNum = 100 + i; 
        const isBooked = bookedSpots.includes(spotNum);
        const isTeacher = i <= 2; 
        
        const spotBtn = document.createElement('div');
        spotBtn.className = `spot-btn ${isBooked ? 'occupied' : ''} ${isTeacher ? 'teacher' : ''}`;
        
        let statusText = isBooked ? 'Zajęte' : (isTeacher ? 'Wykładowca' : 'Wolne');

        spotBtn.innerHTML = `
            <span>${spotNum}</span>
            <small>${statusText}</small>
        `;

        if (!isBooked) {
            spotBtn.addEventListener('click', () => {
                document.querySelectorAll('.spot-btn').forEach(btn => btn.classList.remove('selected'));
                spotBtn.classList.add('selected');
                selectedSpot = spotNum;
            });
        }
        spotsGrid.appendChild(spotBtn);
    }
    modal.classList.add('active');
}

// Підтвердження бронювання
document.getElementById('close-modal').addEventListener('click', () => modal.classList.remove('active'));

document.getElementById('confirm-btn').addEventListener('click', () => {
    if (selectedSpot && currentParking) {
        const booked = getBookedSpots(currentParking.id);
        booked.push(selectedSpot);
        localStorage.setItem(`bookedSpots_${currentParking.id}`, JSON.stringify(booked));
        
        const activeRes = {
            name: currentParking.name,
            spot: selectedSpot,
            closingTime: currentParking.closingTime
        };
        localStorage.setItem('activeReservation', JSON.stringify(activeRes));
        
        const notificationMsg = `Zarezerwowano miejsce ${selectedSpot} na ${currentParking.name}. Prosimy opuścić parking do godziny ${currentParking.closingTime}.`;
        localStorage.setItem('latestNotification', notificationMsg);
        document.getElementById('bell-dot').style.display = 'block'; 
        
        modal.classList.remove('active');
        renderParkings(document.querySelector('.zone-btn.active').getAttribute('data-zone')); 
        alert(`Sukces! Masz nowe powiadomienie.`);
    } else {
        alert('Wybierz miejsce parkingowe przed rezerwacją.');
    }
});

// Кнопки вибору Кампусу
zoneButtons.forEach(button => {
    button.addEventListener('click', () => {
        zoneButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        renderParkings(button.getAttribute('data-zone'));
    });
});

// === ПРОФІЛЬ (ОБЛІКОВИЙ ЗАПИС) ===
const registerSection = document.getElementById('register-section');
const userInfoSection = document.getElementById('user-info-section');
const userNameInput = document.getElementById('user-name');
const carPlateInput = document.getElementById('car-plate');

function checkProfile() {
    const savedName = localStorage.getItem('userName');
    const savedPlate = localStorage.getItem('carPlate');

    if (savedName && savedPlate) {
        registerSection.style.display = 'none';
        userInfoSection.style.display = 'block';
        document.getElementById('display-name').textContent = savedName;
        document.getElementById('display-plate').textContent = `Nr rej: ${savedPlate}`;
    } else {
        registerSection.style.display = 'block';
        userInfoSection.style.display = 'none';
    }
}

document.getElementById('save-profile-btn').addEventListener('click', () => {
    const name = userNameInput.value.trim();
    const plate = carPlateInput.value.trim();
    if (name && plate) {
        localStorage.setItem('userName', name);
        localStorage.setItem('carPlate', plate);
        checkProfile(); 
    } else {
        alert("Wypełnij wszystkie pola!");
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('carPlate');
    userNameInput.value = '';
    carPlateInput.value = '';
    checkProfile();
});

// === НИЖНЄ МЕНЮ ===
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach((nav, index) => {
    nav.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        nav.classList.add('active'); 

        qrModal.classList.remove('active');
        profileModal.classList.remove('active');
        mapModal.classList.remove('active');
        timerModal.classList.remove('active');

        if (index === 0) {
            mapModal.classList.add('active'); 
        } else if (index === 1) {
            qrModal.classList.add('active'); 
        } else if (index === 2) {
            updateTimer(); 
            timerModal.classList.add('active'); 
        } else if (index === 3) {
            checkProfile(); 
            profileModal.classList.add('active'); 
        }
    });
});

// Закриття вікон з нижнього меню
document.getElementById('close-map').addEventListener('click', () => mapModal.classList.remove('active'));
document.getElementById('close-timer').addEventListener('click', () => timerModal.classList.remove('active'));
document.getElementById('close-qr').addEventListener('click', () => qrModal.classList.remove('active'));
document.getElementById('close-qr-btn').addEventListener('click', () => qrModal.classList.remove('active'));
document.getElementById('close-profile').addEventListener('click', () => profileModal.classList.remove('active'));

// === КАРТА (ВЕРХНЯ КНОПКА) ===
document.getElementById('top-map-btn').addEventListener('click', () => {
    mapModal.classList.add('active');
});

// === СПОВІЩЕННЯ (ДЗВІНОЧОК) ===
document.getElementById('bell-btn').addEventListener('click', () => {
    notifModal.classList.add('active');
    document.getElementById('bell-dot').style.display = 'none'; 
    
    const notif = localStorage.getItem('latestNotification');
    if(notif) {
        document.getElementById('notification-list').innerHTML = 
            `<div style="padding:15px; background:#1c1c1c; border-radius:10px; border-left: 4px solid #ff3b30;">${notif}</div>`;
    }
});
document.getElementById('close-notification').addEventListener('click', () => notifModal.classList.remove('active'));

// === ЖИВИЙ ТАЙМЕР ===
function updateTimer() {
    const resData = localStorage.getItem('activeReservation');
    if (!resData) {
        document.getElementById('countdown-display').textContent = "-- : -- : --";
        return;
    }
    const res = JSON.parse(resData);
    document.getElementById('timer-parking-name').textContent = `${res.name} (Miejsce: ${res.spot})`;
    document.getElementById('timer-deadline-text').textContent = `Musisz opuścić parking do ${res.closingTime}`;
    
    const now = new Date();
    const [hours, minutes] = res.closingTime.split(':');
    const deadline = new Date();
    deadline.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    let diff = deadline - now;
    if (diff < 0) {
        document.getElementById('countdown-display').textContent = "CZAS MINĄŁ!";
        return;
    }
    
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('countdown-display').textContent = 
        `${h.toString().padStart(2, '0')} : ${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
}
setInterval(updateTimer, 1000); 

// Запуск
renderParkings();