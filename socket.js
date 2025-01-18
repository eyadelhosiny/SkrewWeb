// import { io } from 'socket.io-client';

// Initialize Socket.IO
const socket = io(process.env.BASE_URL); // Replace with your backend URL

// Room code (shared across the app)
let roomCode;

// Set the room code
export function setRoomCode(code) {
    roomCode = code;
}

// Get the room code
export function getRoomCode() {
    return roomCode;
}

// Emit card clicked event
export function fireCardClicked(cardIndex) {
    socket.emit('card-clicked', { roomCode, cardIndex });
}

// Emit secondary deck click event
export function fireSecondaryDeckClick(value = true) {
    socket.emit('secondary-deck-click', { roomCode, value });
}

// Emit say Skrew event
export function fireSaySkrew(value = true) {
    socket.emit('say-skrew', { roomCode, value });
}

// Emit shuffle cards event
export function fireShuffleCards(shuffledCards) {
    socket.emit('shuffle-cards', { roomCode, shuffledCards });
}

// Listen for card clicked events
export function onCardClicked(callback) {
    socket.on('card-clicked', (data) => {
        if (data.roomCode === roomCode) {
            callback(data.cardIndex);
        }
    });
}

// Listen for shuffle cards events
export function onShuffleCards(callback) {
    socket.on('shuffle-cards', (data) => {
        if (data.roomCode === roomCode) {
            callback(data.shuffledCards);
        }
    });
}

// Listen for say Skrew events
export function onSaySkrew(callback) {
    socket.on('say-skrew', (data) => {
        if (data.roomCode === roomCode) {
            callback();
        }
    });
}

// Export the socket instance (optional, if needed elsewhere)
export { socket };
