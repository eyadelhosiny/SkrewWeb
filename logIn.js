import { setRoomCode } from './socket.js'; // Import setRoomCode from socket.js

let playerName;

document.addEventListener('DOMContentLoaded', logIn);

function logIn() {
    addEventHandlers();
}

function addEventHandlers() {
    document.getElementById('join-room-btn').addEventListener('click', joinRoom);
    document.getElementById('create-room-btn').addEventListener('click', createRoom);
}

async function createRoom() {
    const playerName = getPlayerName();
    if (playerName === "") {
        alert('Name cannot be empty');
        return;
    }

    // Call the backend API to create a room
    const response = await fetch(`${process.env.BASE_URL}/api/room/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, maxPlayers: 4 }), // Adjust maxPlayers as needed
    });

    const data = await response.json();
    if (data.code) {
        setRoomCode(data.code); // Set the room code using socket.js
        goToWaitingRoom(data.code);
    } else {
        alert('Failed to create room');
    }
}

async function canJoinRoom(name, code) {
    if (name === "") {
        alert('Name cannot be empty');
        return false;
    }

    // Call the backend API to check if the room is valid
    const response = await fetch(`${process.env.BASE_URL}/api/room/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code }),
    });

    const data = await response.json();
    if (data.playerId) {
        setRoomCode(code); // Set the room code using socket.js
        return true;
    } else {
        alert('Room is full or does not exist');
        return false;
    }
}

async function joinRoom() {
    const playerName = getPlayerName();
    const code = getRoomCode();

    const canJoin = await canJoinRoom(playerName, code);
    if (!canJoin) {
        return;
    }

    goToWaitingRoom(code);
}

function getPlayerName() {
    return document.getElementById('player-name-txt').value;
}

function getRoomCode() {
    return document.getElementById('room-code-txt').value;
}

function goToWaitingRoom(code) {
    document.getElementById('main-container').style.visibility = 'visible';
    document.getElementById('dashboard').style.visibility = 'visible';
    document.getElementById('log-in-page').style.top = '-100%';
    document.getElementById('room-code').innerHTML += code;
}
