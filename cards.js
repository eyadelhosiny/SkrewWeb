// import { currentPlayer, playerTurn, getOwnerContainer, secondaryDeckCardContainer } from "./main";

const commands = {
    '7': 'lookYours',
    '8': 'lookYours',
    '9': 'lookOthers',
    '10': 'lookOthers',
    'exchange': 'exchange',
    'lookAll': 'lookAll',
    'pasra': 'pasra'
}

function getImagePath(metaData) {
    return `images/${metaData}.png`
}

export default class Card {
    constructor(name, value, owner, index) {
        this.name = name
        this.value = value
        this.owner = owner
        this.index = index
        this.isFlipped = true // back is up

        this.command = this.setCardCommand()
        this.cardElem = this.creatCard()
        // this.cardFrontImg = null
        // this.assignCardToOwner()
    }

    creatCard() {

        // <div class="card" id="this.name">
        //     <div class="card-inner">
        //         <div class="card-front">
        //             <img src="images/-1.png" alt="king image" class="card-img">
        //         </div>
        //         <div class="card-back">
        //             <img src="images/back.png" alt="back image" class="card-img">
        //         </div>
        //     </div>
        // </div> 
        
        // <div class="card" id="this.name">
        const newCardElem = createElement('div')
        addClassToElement(newCardElem, 'card')
        // addIdToElement(newCardElem, this.name)
        addDataValueToElement(newCardElem, this.index)
        
        // <div class="card-inner">
        const cardInnerElem = createElement('div')
        addClassToElement(cardInnerElem, 'card-inner')
        
        // <div class="card-front">
        const cardFrontElem = createElement('div')
        addClassToElement(cardFrontElem, 'card-front')
        // updateInnerHTML(cardFrontElem, this.name)
        
        // <div class="card-back">
        const cardBackElem = createElement('div')
        addClassToElement(cardBackElem, 'card-back')
        
        // <img src="images/card-JackClubs.png" class="card-img">
        const cardFrontImg = createElement('img')
        this.cardFrontImg = cardFrontImg
        // const imagePath = getImagePath('surprise-mf')
        let imagePath = getImagePath(this.name)
        addSrcToImageElem(cardFrontImg, imagePath)
        addClassToElement(cardFrontImg, 'card-img')
        
        // <img src="images/card-back-Blue.png" class="card-img">
        const cardBackImg = createElement('img')
        this.cardBackImg = cardBackImg
        imagePath = getImagePath('back')
        addSrcToImageElem(cardBackImg, imagePath)
        addClassToElement(cardBackImg, 'card-img')

        // Add childs
        addchildElement(cardFrontElem, cardFrontImg)
        addchildElement(cardBackElem, cardBackImg)

        addchildElement(cardInnerElem, cardFrontElem)
        addchildElement(cardInnerElem, cardBackElem)
        
        addchildElement(newCardElem, cardInnerElem)

        return newCardElem
    }

    setCardCommand() {
        if(this.value >= 7 && this.value <=10)
        {
            return commands[this.name]
        }
        return ''
    }
    
    assignCardToOwner() {
        addchildElement(this.owner, this.cardElem)
    }

    flipCard(flip = true) 
    {
        const innerCardElem = this.cardElem.firstChild

        if(this.isFlipped) {
            if(flip){
                const imagePath = getImagePath(this.name)
                addSrcToImageElem(this.cardFrontImg, imagePath)
                
                // setTimeout(() => {
                //     innerCardElem.style.transform = 'rotateY(180deg)'
                // }, 500)
                innerCardElem.style.transform = 'rotateY(180deg)'
            }
            else {
                //put eye
                const imagePath = getImagePath('eye')
                addSrcToImageElem(this.cardBackImg, imagePath)
            }
        }
        else {
            if(flip)
            {
                innerCardElem.style.transform = ''
                
                setTimeout(() => {
                    // const imagePath = getImagePath('surprise-mf')
                    const imagePath = getImagePath('white-card')
                    addSrcToImageElem(this.cardFrontImg, imagePath)
                }, 500)
            }
            else {
                //remove eye
                const imagePath = getImagePath('back')
                addSrcToImageElem(this.cardBackImg, imagePath)
            }
        }
        this.isFlipped = !this.isFlipped
    }

    setOwnerContainer(owner) {this.owner = owner}

    setDataValue(value) {
        this.index = value
        addDataValueToElement(this.cardElem, this.index)
    }
    
    get cardName() {return this.name}
    get cardValue() {return this.value}
    get cardIndex() {return this.index}
    get cardDivElem() {return this.cardElem}
    get cardOwnerContainer() {return this.owner}
    get cardIsFlipped() {return this.isFlipped}
    get cardCommand() {return this.command}
}


// function updateInnerHTML(elem, innerHTML) {
//     elem.innerHTML = innerHTML
// }

function createElement(elemType) {
    return document.createElement(elemType)
}

function addClassToElement(elem, className) {
    elem.classList.add(className)
}

function addIdToElement(elem, id) {
    elem.id = id
}

function addDataValueToElement(elem, value) {
    elem.dataset.value = value
}

function addSrcToImageElem(imgElem, src) {
    imgElem.src = src
}

export function addchildElement(parentElem, childElem) {
    parentElem.appendChild(childElem)
}

// function addCardToGridCell(card) {
//     const cardPositionClassName = mapCardIdToGridCell(card.id)
//     const cardPosElem = document.querySelector(cardPositionClassName)
//     addchildElement(cardPosElem, card)
// }