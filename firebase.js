// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get, update, remove, onValue, child,
        // set, onDisconnect, onChildRemoved, onChildChanged
        } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
// import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
  
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBwDL3yypzhVQ8ibWewlY4AnGK7nuvvKzE",
    authDomain: "skreweb.firebaseapp.com",
    databaseURL: "https://skreweb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "skreweb",
    storageBucket: "skreweb.appspot.com",
    messagingSenderId: "122835235907",
    appId: "1:122835235907:web:99248a8fc4761c9b6cd0f6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase()
// const auth = getAuth(app)

// let newRoomCodeRef = ref(db, 'Rooms/newRoomCode')
let roomRef

let gameInfoRef
let clickedCardIndexRef
let shuffledCardsRef
let playersActionCntRef
let secondaryDeckClickedRef
let saidSrewRef

let playersRef
let playersCntRef
let maxPlayersNumRef
let playersNameRef

let currentPlayer
let playerName
let roomCode
let startTime

const fireSafeTime = 2000

/*
clickedCardIndex: -1,
playersCnt: 0,
shuffledCards: "",
secondaryDeckClicked: 0,
*/

//==================================================================================

import {loadGame, setter, getter,
        cardClicked, playersName,
        maxPlayersNum, reOrderCards, 
        secondaryDeckClick, saySkrew,
        initPlayerNameContainer,
        replacePlayersContainers,
        roundCounter,
        } from './main.js'

// document.addEventListener('DOMContentLoaded', () => {
//     testListener()
// })

// function testListener() {
//     onValue(ref(db, 'test'), (snapshot) => {
//         //////console.log(snapshot.val())
//     })
// }

// export function fireTest(){
//     update(ref(db), {test: true})
// }

document.getElementById('copy').addEventListener('click', copyCode)

function copyCode(){
    // alert('here')
    // navigator.clipboard.writeText(roomCode)
    // .then(() => {
    //     // Provide feedback to the user
    //     alert("Text copied to clipboard: " + textToCopy);
    //   })
    //   .catch((error) => {
    //     alert('Could not copy text: ', error);
    //   });
    // Create a temporary input field
    const tempInput = document.createElement("input");
    tempInput.setAttribute("value", roomCode);
    document.body.appendChild(tempInput);

    // Select the text
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text to the clipboard
    document.execCommand("copy");

    // Remove the temporary input field
    document.body.removeChild(tempInput);
}

function addLeftZero(time){
    return time >= 10? `${time}`: `0${time}`
}

function setStartTime(){
    const currentDate = new Date();
    // Get the current date
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // Months are zero-based (0 for January, 11 for December)
    const day = currentDate.getDate();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();

    const time = `${addLeftZero(hours)}:${addLeftZero(minutes)}:${addLeftZero(seconds)}`

    startTime = {
        year: year,
        month: month,
        day: day,
        time: time,
    }
    // console.log(startTime)
}

export function addToHistory(totalScore)
{
    const result = {};
    for (let i = 0; i < maxPlayersNum; i++) {
        const player = playersName[i];
        const score = totalScore[i];
        result[player] = score;
    }

    const dayRef = ref(db, `History/${startTime.year}/${startTime.month}/${startTime.day}/`)
    update(dayRef, { [startTime.time]: result })
}

export function removeRoom(){
    // if(currentPlayer == 1){
        // setTimeout(()=>{
            // remove(roomRef)
        // }, 600)
    // }
    remove(roomRef)
}

export function playerLeaves(){
    if(roomRef !== undefined){
        firePlayersCnt(-1)
        // removeRoom()
        if(roundCounter == 0)
            removeRoom()
        else 
            update(roomRef, { roundsPlayed: roundCounter })
    }
}

function setMaxPlayersNum(){
    let radioButtons = document.getElementsByName('players-num');
    for (let i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            // ////console.log('Checked option:', radioButtons[i].value);
            setter('maxPlayersNum', Number(radioButtons[i].value))
            break; 
        }
    }
}

async function getMaxPlayersNum(){
    if(currentPlayer == 1){
        return
    }

    await get(maxPlayersNumRef).then((snapshot) => {
        setter('maxPlayersNum', snapshot.val())
    })
}

export async function initPlayer(name, code) {
    setRefrences(code)
    await getMaxPlayersNum()
    setter('currentPlayer', currentPlayer)
    replacePlayersContainers()
    playerName = name
    // playersName = new Array(maxPlayersNum).fill('');
    await firePlayerName()
    addEventListeners()
    firePlayersCnt()
}

export function fireCardClicked(cardIndex) {
    update(gameInfoRef, { clickedCardIndex: cardIndex })
}

export function fireSecondaryDeckClick(value = true){
    update(gameInfoRef, { secondaryDeckClicked: value })
}

export function fireSaySkrew(value = true){
    update(gameInfoRef, { saidSrew: value })
}

export function fireShuffleCards(shuffledCards)
{
    // fireplayersActionCnt(false, true)
    update(gameInfoRef, { shuffledCards: shuffledCards })
}

// let actionCnt = 0
// export function fireplayersActionCnt(toAll = false){
//     if(toAll){
//         // actionCnt = 0
//         // const ActionCnts = {};
//         // for(let i=1; i<=maxPlayersNum; ++i){
//         //     ActionCnts[`cnt${i}`] = 0
//         // }
//         // update(gameInfoRef, { playersActionCnt: ActionCnts })
//     }
//     else {
//         update(playersActionCntRef, { [`cnt${currentPlayer}`]: ++actionCnt })
//     }
// }

async function firePlayerName(){
    let names
    await get(playersNameRef).then((snapshot) => {
        if (snapshot.exists()) {
            names = snapshot.val()
        }
    })
    names[currentPlayer-1] = playerName
    update(playersRef, { playersName: names })
}

function firePlayersCnt(value = currentPlayer){
    update(playersRef, { playersCnt: value })
}

// async function incrementNewRoomCode(){
//     let newRoomCode
//     await get(newRoomCodeRef).then((snapshot) => {
//         if (snapshot.exists()) {
//             newRoomCode = snapshot.val()
//             //////console.log(newRoomCode)
//             update(ref(db, 'Rooms/'), { newRoomCode: newRoomCode+1 })
//         }
//     })
//     return newRoomCode
// }

function generateCode()
{
    const codeLength = Math.floor(Math.random() * 3) + 4 //4,5,6
    let roomCode = "";
    for(let i=1; i<=codeLength; ++i)
    {
        // const letterOrdigit = Math.floor(Math.random() * 2) //0,1
        // if(letterOrdigit == 0){
        //     //letter
        //     // const upperOrlower = Math.floor(Math.random() * 2)
        //     // if(upperOrlower == 0){
        //     //     //upper
        //     //     const asciiCode = Math.floor(Math.random() * 26) + 65
        //     //     const char = String.fromCharCode(asciiCode)
        //     //     roomCode += char
        //     // }
        //     // else {
        //         //lower
        //         const asciiCode = Math.floor(Math.random() * 26) + 97  //a-z
        //         const char = String.fromCharCode(asciiCode)
        //         roomCode += char
        //     // }
        // }
        // else {
            //digit
            roomCode += Math.floor(Math.random() * 10)
        // }
    }

    return roomCode
}

export async function initRoom(name) {
    currentPlayer = 1
    setMaxPlayersNum()
    setStartTime()
    // const newRoomCode = await incrementNewRoomCode()
    const newRoomCode = generateCode()
    //console.log(newRoomCode)
    // const ActionCnts = {};
    // for(let i=1; i<=maxPlayersNum; ++i){
    //     ActionCnts[`cnt${i}`] = 0
    // }
    const names = new Array(maxPlayersNum).fill('');
    names[0] = name
    const newRoom = {
        createTime: startTime.time,
        players: {
            playersCnt: 1,
            maxPlayersNum: maxPlayersNum,
            playersName: names,
        },
        gameInfo: {
            // playersActionCnt: ActionCnts,
            clickedCardIndex: -1,
            secondaryDeckClicked: false,
            saidSrew: false,
            shuffledCards: [],
        },
    };
    //////console.log(newRoom)
    update(ref(db, 'Rooms/'), { [newRoomCode]: newRoom })
    return newRoomCode
}

function addEventListeners() {
    // maxPlayersNumListener()
    setTimeout(() =>{
        playersNamesListerner()
        playersCntListener()
    }, 1000)

    cardClickedIndexListener()
    shuffledCardsListener()
    // playersActionCntListener()
    secondaryDeckClickedListener()
    saidSrewListener()
}

function cardClickedIndexListener() {
    onValue(clickedCardIndexRef, (snapshot) => {
        // cardClickIndex
        const cardIndex = snapshot.val()
        //////console.log('cardClickedIndex =', cardIndex)
        if(cardIndex >= 0){
            cardClicked(cardIndex)
        }
    })  
}

function playersCntListener() {
    onValue(playersCntRef, async (snapshot) => {
        //playerCnt
        const playersCnt = snapshot.val()
        if(playersCnt == maxPlayersNum){
            setTimeout(()=>{
                loadGame()
            },2000)
        }
        else if(playersCnt == -1){
            alert('someone lift the room')
            // removeRoom()
            location.reload()
        }
    })
}

function playersNamesListerner() {
    onValue(playersNameRef, (snapshot) => {
        if(snapshot.exists()){
            let names
            names = snapshot.val()
            for(let i=0; i<maxPlayersNum; ++i){
                playersName[i] = names[i]
            }
            initPlayerNameContainer()
        }
    }) 
}

function shuffledCardsListener() {
    onValue(shuffledCardsRef, (snapshot) => {
        //shuffleCards
        const shuffledCards = snapshot.val()
        if(shuffledCards != null){
            // fireplayersActionCnt(false)
            reOrderCards(shuffledCards)
            setter('gotCards', true)
        }
    })
}

// function fact(index){
//     let sum = 0;
//     for(let i=1; i<=index; ++i){
//         sum += i
//     }
//     return sum
// }

// let sum = 0
// function playersActionCntListener() {
//     for(let i=1; i<=maxPlayersNum; ++i)
//     {
//         const actionCntRef = child(playersActionCntRef, `cnt${i}`)
//         onValue(actionCntRef, (snapshot) => {
//             const val = snapshot.val()
//             if(val == 0) return
//             sum += val
//             if(sum == maxPlayersNum*actionCnt){
//                 sum = 0
//                 setter('gotCards', true)
//             }
//         })
//     }
// }

function secondaryDeckClickedListener(){
    onValue(secondaryDeckClickedRef, (snapshot) => {
        //secondaryDeckClickedRef
        if(snapshot.val() != false){
            secondaryDeckClick()
        }
    })
}

function saidSrewListener(){
    onValue(saidSrewRef, (snapshot) => {
        //saidSrewRef
        if(snapshot.val() == true){
            saySkrew()
        }
    })
}

export async function isRoomValid(code) {
    const roomCodeRef = ref(db, `Rooms/${code}/`)
    let valid = false
    await get(roomCodeRef).then((snapshot) => {
        // const exists = snapshot.exists()
        //////console.log('snapshot.exists()=', exists)
        if(snapshot.exists()){
            const playersCnt = snapshot.val().players.playersCnt
            const playersMax = snapshot.val().players.maxPlayersNum
            //////console.log('playersCnt=', playersCnt)
            if(playersCnt > -1 && playersCnt < playersMax){
                currentPlayer = playersCnt + 1
                valid = true
            }
        }
    })
    return valid
}

function setRefrences(code) {
    roomCode = code
    roomRef = ref(db, `Rooms/${code}/`)

    gameInfoRef = ref(db, `Rooms/${code}/gameInfo/`)
    clickedCardIndexRef = ref(db, `Rooms/${code}/gameInfo/clickedCardIndex`)
    shuffledCardsRef = ref(db, `Rooms/${code}/gameInfo/shuffledCards`)
    playersActionCntRef = ref(db, `Rooms/${code}/gameInfo/playersActionCnt`)
    secondaryDeckClickedRef = ref(db, `Rooms/${code}/gameInfo/secondaryDeckClicked`)
    saidSrewRef = ref(db, `Rooms/${code}/gameInfo/saidSrew`)

    playersRef = ref(db, `Rooms/${code}/players/`)
    playersCntRef = ref(db, `Rooms/${code}/players/playersCnt`)
    maxPlayersNumRef = ref(db, `Rooms/${code}/players/maxPlayersNum`)
    playersNameRef = ref(db, `Rooms/${code}/players/playersName`)
}
