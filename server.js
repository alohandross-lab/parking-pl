const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Вказуємо серверу роздавати файли з нашої папки
app.use(express.static(__dirname));

// Наша "База даних" у пам'яті сервера (які місця зайняті)
let bookedSpots = {
    1: [], 2: [], 3: [], 4: [], 5: []
};

// Коли хтось підключається (відкриває програму)
io.on('connection', (socket) => {
    console.log('Новий користувач підключився!');
    
    // Одразу відправляємо йому актуальні зайняті місця
    socket.emit('updateSpots', bookedSpots);

    // Коли хтось натискає "Резервувати"
    socket.on('bookSpot', (data) => {
        const { parkingId, spot } = data;
        
        // Якщо місце ще не зайняте, записуємо його
        if (!bookedSpots[parkingId].includes(spot)) {
            bookedSpots[parkingId].push(spot);
            
            // РОЗСИЛАЄМО ОНОВЛЕННЯ ВСІМ ТЕЛЕФОНАМ ОДНОЧАСНО!
            io.emit('updateSpots', bookedSpots);
        }
    });
});

// Запускаємо сервер на порту 3000
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер працює! Відкрий http://localhost:${PORT} на комп'ютері.`);
});
