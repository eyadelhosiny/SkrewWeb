import Card from "./cards.js";
import {
    setRoomCode,
    getRoomCode,
    fireCardClicked,
    fireSecondaryDeckClick,
    fireSaySkrew,
    fireShuffleCards,
    onCardClicked,
    onShuffleCards,
    onSaySkrew,
} from './socket.js';

// const cardNames = ['skrewDriver', '1', '2', '3', '4', '5','6', '7', '8', '9', '10', 'exchange', 'lookAll', 'pasra', '-1', '20', 'redSkrew']
//                 //       0         1    2    3    4    5   6    7    8    9    10       11         12         13     14    15       16
onCardClicked((cardIndex) => {
    cardClicked(cardIndex);
});

onShuffleCards((shuffledCards) => {
    reOrderCards(shuffledCards);
});

onSaySkrew(() => {
    saySkrew();
});

let cards = []
let primaryDeckcards = []
let secondaryDeckcards = []

let totalPlayersScore
let playersScore
export let playersName = []

const primaryDeckCardContainer = document.getElementById('primaryDeck')
const secondaryDeckCardContainer = document.getElementById('secondaryDeck')
const skrewButton = document.getElementById('skrew-button')
const dashboard = document.getElementById('dashboard')
const roundName = document.getElementById('round-name')
// const scoreTable = document.getElementById('score-table')
const rowToRight = document.querySelectorAll('.row-to-right')
const rowToLeft = document.querySelectorAll('.row-to-left')

// const skrewAudio = new Audio('audio/skrew1.m4a')
const skrewAudio = new Audio('audio/skrew2.mp3')
const selectAudio = new Audio('audio/select.m4a')
const goodAudio = new Audio('audio/good.m4a')
const badAudio = new Audio('audio/bad.m4a')
const introAudio = new Audio('audio/intro.m4a')
const scoreTableAudio = new Audio('audio/score-table.m4a')

let roundColumnIndex = 2

export let maxPlayersNum = 4
const maxRoundNum = 5
const minTurnsNumBeforSkrew = 3

let currentPlayer = 0
let turnPlayer = 0
let playerSaidSkrew = 0
let startTurn = 1

let primaryDeckClicked = 0
let secondaryDeckClicked = false
let cardChoodes = false
let gotCards = false
let cardsAdded = false

let playing = false
export let roundCounter = 0
let turnCounter = 0
let turnsAfterSkrew = -1

const waitUnitShufflingTime = 3000
let distributionsTime
const showCardsTime = 3000
const insertCardTime = 50
const dashBoardDelayTime = 500
const showRoundNameTime = 3000
const showScoreTableTime = 10000
const showPlayersCardsTime = 5000
const audioDelayTime = 300

let commandCardActivated = ''
// let inCommand = false

function wait(Function, ms) {
    return new Promise(resoleve => {
        Function()
        setTimeout(() => {
            resoleve()
        }, ms)
    })
} 

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function setter(str, value) {
    if(str === 'currentPlayer'){
        currentPlayer = value
    }
    else if(str === 'gotCards'){
        gotCards = value
    }
    else if('maxPlayersNum'){
        maxPlayersNum = value
    }

}

export function getter(str){
    if(str === 'currentPlayer'){
        return currentPlayer
    }
}

function tempCreateCards() {
    let cardIndex = 0
    for(let i=1; i<=57; ++i){
        initCard(`3`, 3, getOwnerContainer(0), cardIndex++)
    }
}
// loadGame()
export function loadGame() {

    //console.log('currentPlayer =', currentPlayer)

    attatchClickEventHandler()
    
    createCards()
    // tempCreateCards()
    
    startGame()
}

function startGame() {
    initGame()
    startRound()
}

function initGame() 
{
    // initPlayerNameContainer()
    initScoreTable()
    document.getElementById('room-code-div').classList.add('hide-room-code')
    totalPlayersScore = new Array(maxPlayersNum).fill(0);
    roundCounter = 0
    distributionsTime = maxPlayersNum*4*350
    // startTurn = 0
    // initturnPlayer()

    //==============================================
    playersScore = new Array(maxPlayersNum).fill(0);
    turnPlayer = 0
    turnCounter = 0
    turnsAfterSkrew = -1
    commandCardActivated = ''
    flagChangeTurn = true
    //==============================================
}

// function initturnPlayer() {
//     if(currentPlayer == 1){
//         startTurn = 1
//     }
//     else if(currentPlayer == 2){
//         startTurn = 4
//     }
//     else if(currentPlayer == 3){
//         startTurn = 3
//     }
//     else if(currentPlayer == 4){
//         startTurn = 2
//     }
//     currentPlayer = startTurn
// }
window.addEventListener('beforeunload', ()=>{
    if(roundCounter <= maxRoundNum)
        playerLeaves()
})

async function endGame(){
    if(++roundCounter <= maxRoundNum)
    {
        return false
    }
    if(currentPlayer == 1)
    {
        addToHistory(totalPlayersScore)
        removeRoom()
    }
    //console.log('ending game')
    let waitTime = dashBoardDelayTime + dashBoardDelayTime + showScoreTableTime + 2000
    await wait(() => {
        showDashBoard(true, false)
    }, waitTime)
    // alert("game is finished")
    document.getElementById('log-in-page').style.top = '0'
    setTimeout(() => {
        location.reload()
    }, 3000)
        
    return true
}

async function startRound() {

    let waitTime = dashBoardDelayTime + showRoundNameTime/* + 2000*/
    if(await endGame()){
        //console.log('game ended')
        return
    }

    if(roundCounter > 1) {
        waitTime += dashBoardDelayTime + showScoreTableTime
    }
    else{
        waitTime += dashBoardDelayTime + 2000
    }
    await wait(() => {
        showDashBoard(roundCounter > 1, true)
        // showDashBoard(true, true)
    }, waitTime)
    
    
    // await wait(initRound, waitUnitShufflingTime + distributionsTime + showPlayersCardsTime + 2000)
    await initRound()
    await sleep(2000)
    
    putFirstCard()
    // roundStarted = true
    // roundCounter++

    changeTurn(800)
}

function waitUnitShuffling(){
    return new Promise(resolve => {
        const id = setInterval(() => {
            if(gotCards && cardsAdded){
                clearInterval(id)
                gotCards = false
                cardsAdded = false
                setTimeout(() =>{
                    resolve()
                }, 1500)
            }
        }, 200)
    })
}

async function initRound() {
    
    // playersScore = new Array(maxPlayersNum).fill(0);
    // turnPlayer = 0
    // // currentPlayer = 0
    // turnCounter = 0
    // turnsAfterSkrew = -1
    // commandCardActivated = ''
    // // inCommand = false
    if(currentPlayer == 1){
        fireSaySkrew(false)
        // fireplayersActionCnt(true)
        // await sleep(1000)
        shuffleCards(cards.length)
    }
    // await wait(waitUnitShuffling, waitUnitShufflingTime)
    await waitUnitShuffling()

    // addCardsToPrimaryDeck()
    //console.log('distribute')
    await wait(distributeCards, distributionsTime)
    await sleep(900)
    //console.log('initial players scores =', playersScore)
    if(roundCounter < maxRoundNum){
        await wait(showFirstTwoCards, showPlayersCardsTime)
    }
}

async function changeTurn(ms = 1500) {
    //console.log(secondaryDeckcards)
    
    primaryDeckClicked = 0
    secondaryDeckClicked = false
    cardChoodes = false
    commandCardActivated = ''
    playing = false

    // if(currentPlayer == 1){
    //     fireSecondaryDeckClick(false)
    //     fireCardClicked(-1)
    // }
    // console.log("change turn.. turnsAfterSkrew=", turnsAfterSkrew)
    if(turnsAfterSkrew != -1 && turnsAfterSkrew++ == maxPlayersNum-1){
        turnOffturnPlayerLine()
        endRound()
        return
    }

    if(primaryDeckcards.length == 0){
        shuffleCards(secondaryDeckcards.length - 1)
        // await wait(waitUnitShuffling, waitUnitShufflingTime)
        await waitUnitShuffling()
    }
    turnCounter++
    
    setTimeout(() => {
        
        if(turnPlayer == 0){
            turnPlayer = startTurn
        }
        else {
            turnOffturnPlayerLine()
            turnPlayer = turnPlayer % maxPlayersNum + 1
        }

        if(currentPlayer == turnPlayer){
            fireSecondaryDeckClick(false)
            fireCardClicked(-1)
        }
        // currentPlayer = turnPlayer
        
        // primaryDeckClicked = 0
        // secondaryDeckClicked = false
        // cardChoodes = false
        // commandCardActivated = ''
        // playing = false
    
        // console.log(`player ${turnPlayer} turn`)
        getturnPlayerLine(turnPlayer).style.animation = 'glow 2.5s ease-in-out infinite'
    }, ms)
}

function turnOffturnPlayerLine() {
    // for(let i=1; i<=maxPlayersNum; ++i){
    //     getturnPlayerLine(i).style.animation = ''
    // }
    // console.log("turnPlayer=", turnPlayer)
    getturnPlayerLine(turnPlayer).style.animation = ''
}

function getturnPlayerLine(playerIndex) {
    return document.getElementById(`player${playerIndex}-turn-line`)
}

function showRoundName() {
    const imgPath = `url('images/round${roundCounter}-background.png')`
    //console.log(imgPath)
    roundName.style.backgroundImage = (imgPath)

    setTimeout(() => {
        roundName.style.height = 'var(--round-name-size)'
        roundName.style.width = 'var(--round-name-size)'
    }, 500)

    const waitTime = roundCounter>1? showRoundNameTime + 200: showRoundNameTime + 1800
    setTimeout(() => {
        roundName.style.height = '0'
        roundName.style.width = '0'
    }, waitTime)
}

function showScoreTable() {
    rowToRight.forEach(function(element) {
        element.style.right = '0';
    });
    rowToLeft.forEach(function(element) {
        element.style.left = '0';
    });

    setTimeout(() => {
        rowToRight.forEach(function(element) {
            element.style.right = '-150%';
        });
        rowToLeft.forEach(function(element) {
            element.style.left = '-150%';
        });
    }, showScoreTableTime)
}

async function showDashBoard(displayScoreTable = false, displayRoundName = true) {
    // dashboard.style.top = '0'
    displayScoreTable? playAudio('score-table'): playAudio('intro');
    
    await sleep(600)
    dashboard.style.bottom = '0'
    await sleep(dashBoardDelayTime)
    
    let waitTime = showRoundNameTime + dashBoardDelayTime + 200

    if(displayScoreTable) {
        // playAudio('score-table')
        await wait(showScoreTable, showScoreTableTime + dashBoardDelayTime)
    }
    else {
        // playAudio('intro')
        waitTime += 1800
    }

    if(displayRoundName){
        await wait(showRoundName, waitTime)
    }

    // dashboard.style.top = '-100%'
    dashboard.style.bottom = '-100%'
}

// function editScoreTableCell(table, column, value) {
//     table.rows[0].cells[column].textContent = value
// }

export function replacePlayersContainers()
{
    const containersId = ['bottom', 'right', 'top', 'left']
    for(let j=0, i=currentPlayer; j<4; i=(i+1)%4, ++j)
    {
        const index = (i ? i: 4)
        const parentContainer = document.getElementById(`${containersId[j]}-container`)
        parentContainer.appendChild(getOwnerContainer(index, true))
        parentContainer.appendChild(getOwnerContainer(index, false))
        parentContainer.appendChild(document.getElementById(`player${index}-name-container`))
        parentContainer.appendChild(document.getElementById(`player${index}-turn-line`))
    }

    if(maxPlayersNum == 2)
    {
        const index = currentPlayer == 1? 2: 1
        let parentContainer = document.getElementById('top-container')
        parentContainer.appendChild(getOwnerContainer(index, true))
        parentContainer.appendChild(getOwnerContainer(index, false))
        parentContainer.appendChild(document.getElementById(`player${index}-name-container`))
        parentContainer.appendChild(document.getElementById(`player${index}-turn-line`))
        
        const oldContainer = currentPlayer == 1? 'right': 'left'
        parentContainer = document.getElementById(`${oldContainer}-container`)
        const topPlayerIndex = currentPlayer == 1? 3: 4

        parentContainer.appendChild(getOwnerContainer(topPlayerIndex, true))
        parentContainer.appendChild(getOwnerContainer(topPlayerIndex, false))
        parentContainer.appendChild(document.getElementById(`player${topPlayerIndex}-name-container`))
        parentContainer.appendChild(document.getElementById(`player${topPlayerIndex}-turn-line`))
    }
}

export function initPlayerNameContainer() {
    for(let i=1; i<=maxPlayersNum; ++i){
        document.getElementById(`player${i}-name-container`).firstChild.innerHTML = playersName[i-1].replace(/\s/g, '&nbsp;&nbsp;');
    }
}

function initScoreTable() {
    roundColumnIndex = 5
    for(let i=1; i<=maxPlayersNum; ++i){
        const playerScoreRow = getPlayerScoreRow(i)
        playerScoreRow.rows[0].cells[6].textContent = playersName[i-1]
    }
}

function getScore(arr, min) {
    let ScorePlayerIndex = [0]
    let Score = arr[ScorePlayerIndex[0]]

    for(let i = 1; i<maxPlayersNum; ++i) 
    {
        const score = arr[i]
        if(min && score < Score){
            ScorePlayerIndex = [i]
        }
        else if(!min && score > Score){
            ScorePlayerIndex = [i]
        }
        else if(score == Score){
            ScorePlayerIndex.push(i)
        }
        Score = arr[ScorePlayerIndex[0]]
        //console.log(score)
    }

    return Score
}

// function getMinScores(arr) {
//     let minScorePlayerIndex = [0]
//     let minScore = arr[minScorePlayerIndex[0]]

//     for(let i = 1; i<maxPlayersNum; ++i) 
//     {
//         const score = arr[i]
//         if(score < minScore){
//             minScorePlayerIndex = [i]
//         }
//         else if(score == minScore){
//             minScorePlayerIndex.push(i)
//         }
//         minScore = arr[minScorePlayerIndex[0]]
//         // console.log(score)
//     }

//     return minScore
// }

function colorScoreTableCells(columnsIndex) {

    const arr = columnsIndex == 0? totalPlayersScore: playersScore 

    const maxScore = getScore(arr, false)
    //console.log('max score is', maxScore)
    const minScore = getScore(arr, true)

    for(let index = 0; index<maxPlayersNum; ++index)
    {
        const score = arr[index]
        if(score == minScore)
        {
            // const wonPlayerRow = document.getElementById(`player${index+1}-score-row`)
            const wonPlayerRow = getPlayerScoreRow(index+1)
            wonPlayerRow.rows[0].cells[columnsIndex].style.backgroundColor = '#51A500'

            if(columnsIndex == 0){
                for(let i=1; i<7; ++i){
                    wonPlayerRow.rows[0].cells[i].style.backgroundColor = '#51A500'
                }
            }

        }
        else if(score == maxScore)
        {
            const losePlayerRow = document.getElementById(`player${index+1}-score-row`)
            losePlayerRow.rows[0].cells[columnsIndex].style.backgroundColor = '#6A0102'
        }
    }
}

function getPlayerScoreRow(playerNum){
    return document.getElementById(`player${playerNum}-score-row`)
}

function updateScoreTable() {
    for(let i=1; i<=maxPlayersNum; ++i){
        const playerScoreRow = getPlayerScoreRow(i)
        playerScoreRow.rows[0].cells[roundColumnIndex].textContent = playersScore[i-1]
        playerScoreRow.rows[0].cells[0].textContent = totalPlayersScore[i-1]
    }
    
    colorScoreTableCells(roundColumnIndex)
    if(roundCounter == maxRoundNum){
        colorScoreTableCells(0)
    }
    roundColumnIndex--
}

function winOrPunish() {
    // playersScore = [5, 7, 1, 0]
    let minScore = getScore(playersScore, true)
    //console.log('min score is', minScore)

    for(let i = maxPlayersNum-1 ; i>=0; --i) {
        if(playersScore[i] == minScore){
            playersScore[i] = 0
            startTurn = i+1
        }
    }

    if(roundCounter == maxRoundNum) {
        for(let i=0; i<maxPlayersNum; ++i){
            playersScore[i] *= 2
        }
        //console.log('roundCounter = maxRoundNum = ', maxRoundNum)
    }

    if(playersScore[playerSaidSkrew] != 0) {
        // double
        playersScore[playerSaidSkrew] *= 2
    }
    else{
        startTurn = playerSaidSkrew+1
    }

    //console.log('round scores is', playersScore)
}

function calculateScores() {
    
    winOrPunish()
    
    playersScore.forEach((score, index) => {
        totalPlayersScore[index] += score
    })

    updateScoreTable()

    //console.log("total players scores =", totalPlayersScore)
}

function showCards(parentDiv) {
    for (let i = 0; i < parentDiv.children.length; ++i) {
        const card = parentDiv.children[i]
        getCardClass(card).flipCard()
    }
}

function showPlayersCards() {
    for(let i=1; i<=maxPlayersNum; ++i) {
        showCards(document.getElementById(`player${i}-cards-container`))
        showCards(document.getElementById(`player${i}-cards-container2`))
    }
    
    setTimeout(() => {
        for(let i=1; i<=maxPlayersNum; ++i) {
            showCards(document.getElementById(`player${i}-cards-container`))
            showCards(document.getElementById(`player${i}-cards-container2`))
        }
    }, showPlayersCardsTime)
}

async function endRound() 
{
    await sleep(showCardsTime)
    await wait(showPlayersCards, showPlayersCardsTime + 100)
    await sleep(1000)
    // playersScore = [20, 25, 1, 20]
    //console.log('round scores is', playersScore)
    calculateScores()
    turnOffturnPlayerLine()

    removeCardsFrom(primaryDeckCardContainer)
    removeCardsFrom(secondaryDeckCardContainer, true)
    primaryDeckcards = [] 
    secondaryDeckcards = []
    //==============================================
    playersScore = new Array(maxPlayersNum).fill(0);
    turnPlayer = 0
    turnCounter = 0
    turnsAfterSkrew = -1
    commandCardActivated = ''
    flagChangeTurn = true
    //==============================================
    for(let i=1; i<=maxPlayersNum; ++i) {
        removeCardsFrom(document.getElementById(`player${i}-cards-container`))
        removeCardsFrom(document.getElementById(`player${i}-cards-container2`))
    }
    // await wait(showDashBoard, 6000)  // show score table

    // fireSaySkrew(false)
    // fireShuffleCards([])

    startRound()
    //console.log("primary deck lenght", primaryDeckCardContainer.children.length)
}

function canSaySkrew() {
    return !playing && turnPlayer == currentPlayer && turnsAfterSkrew == -1 && turnCounter/maxPlayersNum > minTurnsNumBeforSkrew
}

let flagChangeTurn = true
export async function saySkrew() {

    turnsAfterSkrew = 0
    // console.log("change saySkrew.. turnsAfterSkrew=", turnsAfterSkrew)
    playerSaidSkrew = turnPlayer - 1
    await wait(() => {
        playAudio('skrew')
    }, 2000)
    if(flagChangeTurn){
        changeTurn(0)
    }
}

function removeCardsFrom(parentDiv, flip = false) {
    while (parentDiv.firstChild) {
        if(flip){
            getCardClass(parentDiv.firstChild).flipCard()
        }
        parentDiv.removeChild(parentDiv.firstChild);
    }
}

function animationShuffleCards(){
    let i=0
    const id = setInterval(() =>
    {
        //console.log(primaryDeckCardContainer.children[i])
        //console.log(primaryDeckCardContainer.children[i].style)
        primaryDeckCardContainer.children[i].style.animation = 'shuffle 0.5s infinite ease-in-out;'
        //console.log(primaryDeckCardContainer.children[i].style)
        if(++i==57){
            clearInterval(id)
        }
    }, 700)
    setTimeout(() => {
        i = 0
        const id = setInterval(() =>
        {
            primaryDeckCardContainer.children[i].style.animation = 'none'
            if(++i==57){
                clearInterval(id)
            }
        }, 200)
    }, 10000)
}

function addCardsToPrimaryDeck() {
    primaryDeckcards.forEach((card) => {
        // primaryDeckcards.push(card)
        card.setOwnerContainer(primaryDeckCardContainer)
        card.assignCardToOwner()
    })
    // primaryDeckcards = cards
    cardsAdded = true
}

async function showFirstTwoCards() {
    const cardsContainer = getOwnerContainer(currentPlayer)
    const firstChild = getDivChild(cardsContainer, 0)
    const secondChild = getDivChild(cardsContainer, 1)

    await wait( () => {
            getCardClass(firstChild).flipCard()
            getCardClass(secondChild).flipCard()
    },showPlayersCardsTime)

    getCardClass(firstChild).flipCard()
    getCardClass(secondChild).flipCard()
}

function getDivChild(paretDiv, index) {
    return paretDiv.children.item(index)
}

function getCardClass(cardElem) {
    return cards[cardElem.dataset.value]
}

function putFirstCard() {
    const firstCard = primaryDeckcards.pop()
    secondaryDeckcards.push(firstCard)
    changeCardOwner(firstCard, secondaryDeckCardContainer, true)
}

function distributeCards() {

    //console.log('cards before distributing', cards)
    let ctr = startTurn - 1
    let maxCards = maxPlayersNum * 4
    const id = setInterval(() => 
    {
        const card = primaryDeckcards.pop()
        //console.log(card)
        const playerIndex = ctr++ % maxPlayersNum
        playersScore[playerIndex] += card.cardValue
        const playerContainer = getOwnerContainer(playerIndex + 1)
        //console.log('playerIndex + 1=',playerIndex + 1)
        changeCardOwner(card, playerContainer, false)
        // addchildElement(playerContainer, card)
        if(--maxCards == 0) {
            clearInterval(id)
            //console.log('cards after distributing', cards)
            // putFirstCard()
        }
    }, distributionsTime/(4*maxPlayersNum))
}

function initCard(name, value, owner, cardIndex) {
    const card = new Card(name, value, owner, cardIndex)
    cards.push(card)
    attatchClickEventHandlerToCard(card)
}

export function reOrderCards(cardsIndex) {
    //console.log(cardsIndex)
    //console.log("turnCounter=", turnCounter);
    if(turnCounter == 0){
        const length = cards.length
        for(let i=0; i<length; ++i) {
            const index = cardsIndex[i]
            primaryDeckcards.push(cards[index])
        }
    }
    else {
        //console.log(secondaryDeckcards)
        const length = secondaryDeckcards.length-1
        for(let i=0; i<length; ++i) {
            const index = cardsIndex[i]
            const card = secondaryDeckcards[index]
            //console.log(card)
            card.flipCard()
            primaryDeckcards.push(card)
        }
        secondaryDeckcards = [secondaryDeckcards[length]]
    }
    //console.log(primaryDeckcards)
    addCardsToPrimaryDeck()
}

function shuffleCards(maxIndex) {
    // if(currentPlayer != 1){
    //     return
    // }
    //console.log("shuffling")
    let cardsIndex = []
    for(let i=0; i<maxIndex; ++i){
        cardsIndex.push(i)
    }
    // ////console.log(cardsIndex)
    let ctr = 1000
    while(ctr-- > 0)
    {
        const random1 = Math.floor(Math.random() * maxIndex)
        const random2 = Math.floor(Math.random() * maxIndex)

        const temp = cardsIndex[random1]
        cardsIndex[random1] = cardsIndex[random2]
        cardsIndex[random2] = temp

        // cardsIndex[random1].setDataValue(random1)
        // cardsIndex[random2].setDataValue(random2)
    }
    //console.log(cards)
    //console.log(cardsIndex)
    fireShuffleCards(cardsIndex)
}

function createCards() {
    let cardIndex = 0
    // normal cards
    for(let j=1; j<=4; ++j) 
    {
        for(let i=1; i<=10; ++i) 
        {
            initCard(`${i}`, i, getOwnerContainer(0), cardIndex++)
        }
    }

    // command cards
    for(let i=1; i<=4; ++i) 
    {
        initCard("exchange", 10, getOwnerContainer(0), cardIndex++)

        initCard("20", 20, getOwnerContainer(0), cardIndex++)
    }

    for(let i=1; i<=2; ++i) 
    {
        initCard("lookAll", 10, getOwnerContainer(0), cardIndex++)

        initCard("pasra", 10, getOwnerContainer(0), cardIndex++)

        initCard("redSkrew", 25, getOwnerContainer(0), cardIndex++)

        initCard("skrewDriver", 0, getOwnerContainer(0), cardIndex++)
    }

    initCard('-1', -1, getOwnerContainer(0), cardIndex++)

    // Card.shuffle()
}

function updateScore(playerIndex, valueToAdd) {
    // if(valueToAdd > 0){
    //     playAudio('bad', toAll)
    // }
    // else if(valueToAdd < 0){
    //     playAudio('good', toAll)
    // }
    playersScore[playerIndex] += valueToAdd
}

export function getOwnerContainer(ownerId, secondContainer = false) {
    if(ownerId == 0) {
        return primaryDeckCardContainer
    }
    else if(ownerId == 5) {
        return secondaryDeckCardContainer
    }
    else {
        if(!secondContainer)
            return document.getElementById(`player${ownerId}-cards-container`)
        else
            return document.getElementById(`player${ownerId}-cards-container2`)
    }
}

function getPlayerIndex(playerCardsContainer) {
    return playerCardsContainer.id[6] - 1
}

export function cardClicked(cardIndex) 
{
    // console.log("primaryDeckClicked", primaryDeckClicked)
    // console.log("secondaryDeckClicked", secondaryDeckClicked)
    // console.log("cardChoodes" ,cardChoodes)

    const card = cards[cardIndex]
    //console.log('card clicked')
    const cardOwnerElem = card.cardOwnerContainer
    if(commandCardActivated !== ''){
        //console.log('in command')
        commandActivate(card)
    }
    else if(!cardChoodes && (card.cardOwnerContainer === getOwnerContainer(turnPlayer)
        || card.cardOwnerContainer === getOwnerContainer(turnPlayer, true)))
    {
        // console.log('call choosCard')
        chooseCard(card)
    }
    else if(!secondaryDeckClicked && !cardChoodes && cardOwnerElem === primaryDeckCardContainer){
        // console.log('primaryDeckClick()')
        primaryDeckClick()
    }
    // else if(cardOwnerElem === secondaryDeckCardContainer){
    //     secondaryDeckClick()
    // }
}

function cheating(card) {

    // if(card.cardOwnerContainer === getOwnerContainer(currentPlayer)
    // || card.cardOwnerContainer === getOwnerContainer(currentPlayer, true))
    // {
    //     alert(`player ${currentPlayer} is cheating`)
        // ////console.log(playersScore)
    //     playersScore[currentPlayer-1] += 10
        // ////console.log(playersScore)
    // }
}

function attatchClickEventHandlerToCard(card) {
    card.cardDivElem.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        cheating(card)
    })
    card.cardDivElem.addEventListener('click', () => { 
        if(canChooseCard() && card.cardOwnerContainer !== secondaryDeckCardContainer){
            // console.log("fireCardClicked")
            fireCardClicked(card.cardIndex) 
        }
    })
}

function attatchClickEventHandler() {
    // primaryDeckCardContainer.addEventListener('click', primaryDeckClick)
    secondaryDeckCardContainer.addEventListener('click', () => {
        if(canChooseCard() && (secondaryDeckcards.length > 0 && commandCardActivated === '' || primaryDeckClicked == 1)) {
            // console.log("fireSecondaryDeckClick")
            fireSecondaryDeckClick()
        }
    })
    skrewButton.addEventListener('click', () => {
        if(canSaySkrew()){
            fireSaySkrew()
            // saySkrew()
        }
    })
}

function changeCardOwner(card, owner, flip, assign = true, hide = false) {
    if(flip){
        card.flipCard()
    }

    card.setOwnerContainer(owner)
    //console.log('hide=', hide)
    //console.log(card)
    if(hide){
        const cardInnerElem = card.cardDivElem.firstChild
        cardInnerElem.style.height = '0'
        cardInnerElem.style.width = '0'
    }

    if(assign){
        card.assignCardToOwner()
    }
}

function canChooseCard() {
    //console.log('turnPlayer =', turnPlayer)
    //console.log('currentPlayer =', currentPlayer)
    // console.log('turnsAfterSkrew =', turnsAfterSkrew)
    return (turnsAfterSkrew != 0 && /*turnPlayer != 0 &&*/ currentPlayer == turnPlayer/* && commandCardActivated === ''*/)
}

function primaryDeckClick() {
    // if(!canChooseCard()){
    //     return
    // }
    playing = true
    if(commandCardActivated === '' && primaryDeckClicked == 0 && primaryDeckcards.length > 0) {
        playAudio('select')
        const card = primaryDeckcards[primaryDeckcards.length - 1]
        if(currentPlayer == turnPlayer){
            setTimeout(()=>{
                card.flipCard()
            }, audioDelayTime)
        }
        primaryDeckClicked = 1
    }
    //console.log('in primaryDeckClick primaryDeckClicked =', primaryDeckClicked)
}

function addCardsToSecondaryDeck(myCard, choosedCard) 
{
    //from primary to player and from player to secondary
    //or 
    //from secondary to player and from player to secondary

    const playerContainer = myCard.cardOwnerContainer
    const myCardIndex = Array.from(playerContainer.children).indexOf(myCard.cardDivElem)
    
    const flip = (currentPlayer==turnPlayer || choosedCard.cardOwnerContainer == secondaryDeckCardContainer)
    changeCardOwner(choosedCard, playerContainer, flip, false, true) 
    insertCardInIndex(choosedCard, playerContainer, myCardIndex)
    
    secondaryDeckcards.push(myCard)
    changeCardOwner(myCard, secondaryDeckCardContainer, true, true, false) 

    const valueToAdd = choosedCard.cardValue - myCard.cardValue
    goodOrBadAudio(valueToAdd, false)
    updateScore(turnPlayer - 1, valueToAdd)
}

function chooseCard(card) 
{
    // if(!canChooseCard()) {
        ////console.log('cant choose')
    //     return
    // }

    //console.log('in chooseCard primaryDeckClicked =', primaryDeckClicked)
    playing = true
    if(primaryDeckClicked == 1) {
        cardChoodes = true
        //console.log('from primary deck to player', turnPlayer)
        const choosedCard = primaryDeckcards.pop()
        primaryDeckClicked = 2
    
        addCardsToSecondaryDeck(card, choosedCard)
        changeTurn(300)
    }
    else if (secondaryDeckcards.length > 0)
    {
        cardChoodes = true
        //console.log('secondary size =', secondaryDeckcards.length)
        //console.log('secondaryDeckClicked =', secondaryDeckClicked)    
        if(secondaryDeckClicked)
        {
            const choosedCard = secondaryDeckcards.pop()
            secondaryDeckClicked = false

            addCardsToSecondaryDeck(card, choosedCard)
            changeTurn(300)
        }
        else {
            //pasra
            const lastSecondaryCard = secondaryDeckcards[secondaryDeckcards.length - 1]
            card.flipCard()
            setTimeout(() => {
                if(pasraSucceded())
                {
                    //console.log('pasra succeded') 
                    //succeded
                    goodOrBadAudio(- card.cardValue, true)
                    setTimeout(() => {
                        secondaryDeckcards.push(card)
                        changeCardOwner(card, secondaryDeckCardContainer, false)
                        afterPasra()
                        updateScore(turnPlayer - 1, - card.cardValue)
                        // changeTurn(1500)
                        changeTurn(300)
                    }, audioDelayTime)
                }
                else {
                    //console.log('pasra failed') 
                    // failed
                    goodOrBadAudio(lastSecondaryCard.cardValue, true)
                    setTimeout(()=>{
                        card.flipCard()
                        secondaryDeckcards.pop()
                        changeCardOwner(lastSecondaryCard, getOwnerContainer(turnPlayer, true), true)
                        updateScore(turnPlayer - 1, lastSecondaryCard.cardValue)
                        // changeTurn(1500)
                        changeTurn(300)
                    }, audioDelayTime)
                }
                // changeTurn(1500)
            }, 1300)

            function pasraSucceded(){
                //console.log(card.cardName)
                //console.log(card.cardName === ' redSkrew')
                //console.log(lastSecondaryCard.cardName)
                //console.log(lastSecondaryCard.cardName === 'skrewDriver')
                return card.cardName === lastSecondaryCard.cardName
                    || card.cardName === 'redSkrew' && lastSecondaryCard.cardName === 'skrewDriver'
                    || card.cardName === 'skrewDriver' && lastSecondaryCard.cardName === 'redSkrew'
            }
        }
    }
}

export function secondaryDeckClick() {
    // if(!canChooseCard()) {
    //     return
    // }

    
    // console.log('in secondaryDeckClick primaryDeckClicked =', primaryDeckClicked, " commandCardActivated=", commandCardActivated)
    playing = true
    if(primaryDeckClicked == 1) {
        //console.log('from primary deck to secondary deck')
        const victimCard = primaryDeckcards.pop()
        changeCardOwner(victimCard, secondaryDeckCardContainer, currentPlayer!=turnPlayer)
        secondaryDeckcards.push(victimCard)
        primaryDeckClicked = 3
        
        commandCardActivated = victimCard.cardCommand
        
        if(commandCardActivated === '' /*|| getOwnerContainer(turnPlayer).children.length == 0**/){
            //console.log('not command then change turn')
            changeTurn(300)
        }
        else 
        {
            setHintMsg(commandCardActivated)
        }
    }
    else if(secondaryDeckcards.length > 0 /*&& commandCardActivated === ''*/)
    {
        //console.log('secondary deck clicked')
        secondaryDeckClicked = true
    }
    // else {
        ////console.log('secondaryDeckcards.length =', secondaryDeckcards.length)
        ////console.log('commandCardActivated =', commandCardActivated)
    // }
}

const hintMsgElem = document.getElementById('hint-msg')

function setHintMsg(commandCardActivated){
    if(commandCardActivated === 'lookYours'){
        hintMsgElem.innerHTML = 'بص في ورقتك'
        hintMsgElem.style.visibility = 'visible'
    }
    else if(commandCardActivated === 'lookOthers'){ 
        hintMsgElem.innerHTML = 'بص في ورقة غيرك'
        hintMsgElem.style.visibility = 'visible'
    }
}

async function commandActivate(selectedCard) {
    //console.log('command is', commandCardActivated)
    await wait(() => 
    {
        if(commandCardActivated === 'lookYours') {
            commandLookYours(selectedCard)
        }
        else if(commandCardActivated === 'lookOthers') {
            commandLookOthers(selectedCard)
        }
        else if(commandCardActivated === 'exchange') {
            commandExchangeCard(selectedCard)
        }
        else if(commandCardActivated === 'lookAll') {
            commandLookAll(selectedCard)
        }
        else if(commandCardActivated === 'pasra') {
            commandPasra(selectedCard)
        }
    }, 0)
}

function finishCommand(ms) {
    //console.log('command finished')
    setTimeout(() => {
        commandCardActivated = ''
        hintMsgElem.style.visibility = 'hidden'
        // inCommand = false
        changeTurn(0)
    }, ms)
}

async function commandLookYours(card) {
    if(card.cardOwnerContainer !== getOwnerContainer(turnPlayer) 
        && card.cardOwnerContainer !== getOwnerContainer(turnPlayer, true))
    {
        return
    }

    // inCommand = true
    commandCardActivated = 'wait'
    
    card.flipCard(currentPlayer == turnPlayer)
    await wait(() => {
        setTimeout(() => {
            card.flipCard(currentPlayer == turnPlayer)
        }, showCardsTime)
    },showCardsTime)

    finishCommand(0)
}

async function commandLookOthers(card) {
    if( card.cardOwnerContainer === getOwnerContainer(turnPlayer)
        || card.cardOwnerContainer === getOwnerContainer(turnPlayer, true)
        || card.cardOwnerContainer === primaryDeckCardContainer
        || card.cardOwnerContainer === secondaryDeckCardContainer)
    {
        return
    }

    // inCommand = true
    commandCardActivated = 'wait'

    card.flipCard(currentPlayer == turnPlayer)
    await wait(() => {
        setTimeout(() => {
            card.flipCard(currentPlayer == turnPlayer)
        }, showCardsTime)
    },showCardsTime)

    finishCommand(0)
}

// async function animationExchange(card1, card2)
// {
//     card1.cardDivElem.style.transform = 'rotateZ(20deg)'
//     card2.cardDivElem.style.transform = 'rotateZ(20deg)'
//     await wait(() => {
//         setTimeout(() => {
//             card1.cardDivElem.style.transform = ''
//             card2.cardDivElem.style.transform = ''
//         }, 1500)
//     }, 2000)
// }

function insertCardInIndex(card, parent, index) {

    //console.log(card.cardDivElem)
    const cardInnerElem = card.cardDivElem.firstChild
    // cardInnerElem.style.height = '0'
    // cardInnerElem.style.width = '0'
    
    const referenceNode = parent.children.item(index);
    // Insert the new child before the reference node
    parent.insertBefore(card.cardDivElem, referenceNode);
    setTimeout(() => {
        cardInnerElem.style.width = '100%'
        cardInnerElem.style.height = '100%'
    }, insertCardTime)
}

function exchangeTwoCards(card1, card2, flip = true) {

    const card1Container = card1.cardOwnerContainer
    const card2Container = card2.cardOwnerContainer
    
    const card1CurrentIndex = Array.from(card1Container.children).indexOf(card1.cardDivElem)
    const card2CurrentIndex = Array.from(card2Container.children).indexOf(card2.cardDivElem)
    
    changeCardOwner(card1, card2Container, flip, false, true) 
    insertCardInIndex(card1, card2Container, card2CurrentIndex)
    
    changeCardOwner(card2, card1Container, flip, false, true)
    insertCardInIndex(card2, card1Container, card1CurrentIndex)
}

let card1 = null
function commandExchangeCard(card) {

    if(card.cardOwnerContainer === primaryDeckCardContainer
        || card.cardOwnerContainer === secondaryDeckCardContainer)
    {
        return
    }

    if(card1 == null)
    {
        card1 = card
        return
    }
    let card2 = card

    const playerContainer1 = getOwnerContainer(turnPlayer)
    const playerContainer2 = getOwnerContainer(turnPlayer, true)
    const card1Container = card1.cardOwnerContainer
    const card2Container = card2.cardOwnerContainer

    const noOneOfThemIsHis = (card2Container !== playerContainer1 
                            && card1Container !== playerContainer1 
                            && card2Container !== playerContainer2 
                            && card1Container !== playerContainer2)

    if(card2Container === card1Container || noOneOfThemIsHis)
    {
         return
    }

    // inCommand = true
    commandCardActivated = 'wait'

    const value1 = card1.cardValue - card2.cardValue
    const value2 = card2.cardValue - card1.cardValue

    if(card1Container === playerContainer1 || card1Container === playerContainer2) {
        updateScore(turnPlayer - 1, value2)
        updateScore(getPlayerIndex(card2Container), value1)
    }
    else {
        updateScore(turnPlayer - 1, value1)
        updateScore(getPlayerIndex(card1Container), value2)
    }

    exchangeTwoCards(card1, card2, false)

    // animationExchange(card1, card)

    card1 = null
    finishCommand(500)
}

function getOwnerId(cardContainer)
{
    // player${ownerId}-cards-container
    const containerId = cardContainer.id
    // console.log("containerId=", containerId)
    return containerId[6]
}

let lookedCards = []
function commandLookAll(card) {
    const cardOwner = card.cardOwnerContainer
    if( cardOwner === primaryDeckCardContainer
        || cardOwner === secondaryDeckCardContainer)
    {
        return
    }

    const ownerId = getOwnerId(cardOwner)
    let can = true
    lookedCards.forEach((lookedCardOwnerId) => {
        if(lookedCardOwnerId === ownerId){
            //console.log('card owner is', lookedCardParent)
            //console.log('cant not look here again')
            can = false
            return
        }
    })

    if(!can){
        return
    }
    
    card.flipCard(currentPlayer == turnPlayer)
    setTimeout(() => {
        card.flipCard(currentPlayer == turnPlayer)
    }, showCardsTime)
    
    if(lookedCards.length == maxPlayersNum-1){
        // inCommand = true
        commandCardActivated = 'wait'
        lookedCards = []
        finishCommand(3000)
        return
    }
    // lookedCards.push(cardOwner)
    lookedCards.push(ownerId)
}

function commandPasra(card) {
    if(card.cardOwnerContainer !== getOwnerContainer(turnPlayer)
        && card.cardOwnerContainer !== getOwnerContainer(turnPlayer, true)){
        return
    }

    // inCommand = true
    commandCardActivated = 'wait'

    // card.flipCard()
    secondaryDeckcards.push(card)
    changeCardOwner(card, secondaryDeckCardContainer, true)
    goodOrBadAudio(- card.cardValue, true)
    afterPasra()
    updateScore(turnPlayer - 1, - card.cardValue)

    finishCommand(500)
}

function afterPasra()
{
    const card1Container = getOwnerContainer(turnPlayer)
    const card2Container = getOwnerContainer(turnPlayer, true)
    const cardsNum = card1Container.children.length + card2Container.children.length
    if(cardsNum == 0){
        flagChangeTurn = false
        fireSaySkrew()
    }
}

function playAudio(audioFileName, toAll = false)
{
    if(audioFileName === "select"){
        selectAudio.play()
    }
    else if(audioFileName === "skrew"){
        skrewAudio.play()
    }
    else if(audioFileName === "score-table"){
        scoreTableAudio.play()
    }
    else if(audioFileName === "intro"){
        introAudio.play()
    }
    else if(toAll || currentPlayer == turnPlayer)
    {
        if(audioFileName === "good"){
            goodAudio.play()
        }
        else if(audioFileName === "bad"){
            badAudio.play()
        }
    }
}

function goodOrBadAudio(valueToAdd, toAll = false){
    if(valueToAdd > 0){
        playAudio('bad', toAll)
    }
    else if(valueToAdd < 0){
        playAudio('good', toAll)
    }
}
