// import * as React from 'react'
import React, {Component} from 'react'
import styled from 'styled-components'
import fire from '../database/firebase'
import copy from 'copy-to-clipboard';
import moment from 'moment'
import shortid from 'shortid'
import axios from 'axios'

const Styles = styled.div `

    // - - PAGE - - //

.mainpage {
    margin-top: 1.75%;
    margin-bottom: 0px;
}

.mainpage h3 {
    font-family: Mukta;
    margin-bottom: 0px;
}

.mainpage h4 {
    font-family: Mukta;
    margin-bottom: 0px;
}


.mainpage h5 {
    color: purple;
}

    // - - NEXT GAME - - //

.nextGame {
    font-weight: bold;
    color: purple;
    font-size: 20px;
}

    // - - FLASHCARD - - //

.flashcard {
    display: inline-block;
    width: 250px;
    height: 250px;
    background-color: purple;
    margin-top: 3%;
    margin-bottom: 2%;
    border-radius: 8px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.5), 0 6px 20px 0 rgba(0, 0, 0, 0.5);
}

.flashcard h1 {
    font-size: 100px;
    margin-top: 0px;
    background-color: transparent;
    height: 100%;
    line-height: 250px;
    border-radius: 8px;
}

.flashcard img {
    margin-top: 4%;
    width: 90%;
}

    // - - WIN DISPLAY - - //

.winDisplay h1 {

}

.winDisplay button {
    background-color: purple;
    color: yellow;
    font-family: Mukta;
    font-size: 21px;
    padding-left: 3.5%;
    padding-right: 3.5%;
    border: 2px solid transparent;
    border-radius: 8px;
    padding-top: 0.5%;
    padding-bottom: 0.5%;
    cursor: pointer;
    margin-bottom: 0%;
}

.winDisplay img {
    margin-top: 5%;
    width: 12.5%;
    margin-left: 2%;
}

.winDisplay p {
    font-family: Mukta;
    font-weight: bold;
    color: purple;
    font-size: 18.5px;
}

    // - - CONTACT - - //

.contact p {
    font-family: Mukta;
    color: purple;
    font-weight: bold;
    cursor: pointer;
    margin-top: 2.5%;
    margin-bottom: 2%;
}

.contact h6 {
    // margin-bottom: 0px;
}

.contact label {
    color: black;
}

// - - - - - - - - - - - PHONE DIMENSIONS - - - - - - - - - - - - - //

@media screen and (max-width: 800px) {


        // - - MAINPAGE - - //

    .mainpage h3 {
        margin-left: 4%;
        margin-right: 4%;
    }
    
    .mainpage h4 {
        margin-left: 4%;
        margin-right: 4%;
    }


    // - - NEXT GAME - - //

    .nextGame {
        margin-left: 4%;
        margin-right: 4%;
        font-size: 17px;
    }

        // - - WIN DISPLAY - - //

    .winDisplay button {
        margin-bottom: 3%;
    }

        // - - CONTACT - - //

    .contact p {
        margin-bottom: 4%;
    }

}

`


export default class GamePage extends Component  {
    constructor(props) {
        super(props)
        this.state = {
            swipe1: 0,
            swipe2: 0,
            zeroCounter: 0,
            maxSwipes: 40,
            dailyImg: "",
            missedOpps: 0,
            winningStatus: false,
            endGameTxt: "",
            copiedTxt: "",
            loadedImg: "",
            loadedGameNum: 0,
            user: "",
            userCountry: "",
            played: false,
            nextGame: false
        }
    }

    componentDidMount = () => {
        this.getData()
        this.getDatabaseDate()
        fire.firestore().collection("siteInfo")
        .doc("dailyStuff")
        .get().then(doc => {
            if (doc.exists) {
                this.setState({
                    loadedImg: doc.data().img,
                    loadedGameNum: doc.data().number
                })
            }
        })
        this.checkPlayed()
    }

    getData = async () => {
        const res = await axios.get('https://geolocation-db.com/json/')
        this.setState({
            user: res.data.IPv4,
            userCountry: res.data.country_name
        })
        console.log(res.data)
    }

    authListener = () => {
        fire.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({user})
            } else {
                this.setState({user:null})
            }
        })
    }

    getCurrentDate = () => {
        var date = new Date();
        date = date.toLocaleString('en-GB')
        date = date.split(',')[0]
        return date
    }

    getDatabaseDate = async () => {
        const res = await axios.get('https://geolocation-db.com/json/')
        fire.firestore().collection("players")
        .doc(res.data.IPv4)
        .get().then(doc => {
            console.log(`Last Played: ${doc.data().date}`)
            console.log(`Last Played: ${this.getCurrentDate()}`)
            if(doc.exists) {
                if (!(doc.data().date === this.getCurrentDate())) {
                    this.restartGame()
                    console.log("we restarted the game")
                } else if (doc.data().played == true) {
                    this.setState({
                        nextGame: true
                    })
                }
            }
        })
    }

    checkPlayed = async () => {
        const res = await axios.get('https://geolocation-db.com/json/')
        fire.firestore().collection("players")
        .doc(res.data.IPv4)
        .get().then(doc => {
            if(doc.exists) {
                if (doc.data().played == true) {
                   this.setState({
                       dailyImg: doc.data().dailyImg,
                       maxSwipes: doc.data().swipes,
                       shareBtn: true,
                       played: true
                   })
                }
            }
        })
    }

    restartGame = async () => {
        var date = new Date();
        date = date.toLocaleString('en-GB')
        date = date.split(',')[0]
        const res = await axios.get('https://geolocation-db.com/json/')
        fire.firestore().collection("players")
        .doc(res.data.IPv4)
        .set({
            userID: this.state.user,
            userCountry: this.state.userCountry,
            played: false,
            dailyImg: "",
            swipes: 0,
            date: date
        })
        this.setState({
            nextGame: false
        })
    }

    changeBackground = (e) => {
        var first = new Date()
        var second = new Date()
        var firstSec = first.getMilliseconds() 
        var secondSec = second.getMilliseconds()
        var diff
        if (this.state.maxSwipes != 0 && this.state.played == false) {
            if (e.target.style.background == "purple") {
                e.target.style.background = 'orange';
                this.state.swipe1 = firstSec
                this.state.maxSwipes = this.state.maxSwipes-1
                diff = (this.state.swipe2 - this.state.swipe1)
                if (diff >= -75 && diff <= 75) {
                    this.state.zeroCounter = this.state.zeroCounter+1
                    this.setState({
                        dailyImg: this.state.loadedImg,
                        winnerDisplay: true,
                        winningStatus: true
                    })
                }
            }  else {
                e.target.style.background = 'purple';
                this.state.swipe2 = secondSec
                this.state.maxSwipes = this.state.maxSwipes-1
                this.setState({
                    dailyImg: "",
                    winnerDisplay: false,
                    winningStatus: false,
                    missedOpps: this.state.missedOpps + 1
                })
            }
        } else if (this.state.maxSwipes == 0) {
            // create account
            this.savePlayer()
            if (this.state.dailyImg != "") {
                this.setState({
                    winnerDisplay: false
                })
                alert("You won!")
            } else {
                alert("Game Over 👾")
            }
            this.setState({
                shareBtn: true,
                nextGame: true
            })
        } else if (this.state.played == true) {
            alert("You already played today ⚡️")
        }
    }

    savePlayer = () => {
        var date = new Date();
        date = date.toLocaleString('en-GB')
        date = date.split(',')[0]
        fire.firestore().collection("players")
        .doc(this.state.user)
        .set({
            userID: this.state.user,
            userCountry: this.state.userCountry,
            played: true,
            swipes: this.state.maxSwipes,
            dailyImg: this.state.dailyImg,
            date: date
        })
    }

    doneClicked = () => {
        this.setState({
            winnerDisplay: false,
            shareBtn: true
        })
        this.savePlayer()
    }

    copyShareTxt = (wTxt, lTxt) => {
    var winTxt 
        var win1 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

${this.state.dailyImg}

https://flashcrd.com
`
        var win2 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨${this.state.dailyImg}

https://flashcrd.com
`
        var win3 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win4 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨${this.state.dailyImg}

https://flashcrd.com
`
        var win5 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win6 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
${this.state.dailyImg}

https://flashcrd.com
`
        var win7 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win8 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨${this.state.dailyImg}

https://flashcrd.com
`
        var win9 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win10 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨${this.state.dailyImg}`
        var win11 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
${this.state.dailyImg}

https://flashcrd.com
`
        var win12 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨${this.state.dailyImg}

https://flashcrd.com
`
        var win13 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win14 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨${this.state.dailyImg}

https://flashcrd.com
`
        var win15 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win16 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
${this.state.dailyImg}

https://flashcrd.com
`
        var win17 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win18 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨${this.state.dailyImg}

https://flashcrd.com
`
        var win19 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win20 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨${this.state.dailyImg}

https://flashcrd.com
`
        var win21 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
${this.state.dailyImg}

https://flashcrd.com
`
        var win22 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨${this.state.dailyImg}`
        var win23 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win24 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨${this.state.dailyImg}

https://flashcrd.com
`
        var win25 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win26 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
${this.state.dailyImg}

https://flashcrd.com
`
        var win27 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win28 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨${this.state.dailyImg}

https://flashcrd.com
`
        var win29 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win30 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨${this.state.dailyImg}

https://flashcrd.com
`
        var win31 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
${this.state.dailyImg}

https://flashcrd.com
`
        var win32 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨${this.state.dailyImg}

https://flashcrd.com
`
        var win33 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win34 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨${this.state.dailyImg}

https://flashcrd.com
`
        var win35 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win36 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
${this.state.dailyImg}

https://flashcrd.com
`
        var win37 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win38 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨${this.state.dailyImg}

https://flashcrd.com
`
        var win39 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪${this.state.dailyImg}

https://flashcrd.com
`
        var win40 = `f l a⚡️h c r d #${this.state.loadedGameNum} 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨${this.state.dailyImg}

https://flashcrd.com
`


if (this.state.dailyImg != "") {
    if (this.state.maxSwipes == "39") {
        copy(win1)
    } else if (this.state.maxSwipes == "38") {
        copy(win2)
    } else if (this.state.maxSwipes == "37") {
        copy(win3)
    } else if (this.state.maxSwipes == "36") {
        copy(win4)
    } else if (this.state.maxSwipes == "35") {
        copy(win5)
    } else if (this.state.maxSwipes == "34") {
        copy(win6)
    } else if (this.state.maxSwipes == "33") {
        copy(win7)
    } else if (this.state.maxSwipes == "32") {
        copy(win8)
    } else if (this.state.maxSwipes == "31") {
        copy(win9)
    } else if (this.state.maxSwipes == "30") {
        copy(win10)
    } else if (this.state.maxSwipes == "29") {
        copy(win11)
    } else if (this.state.maxSwipes == "28") {
        copy(win12)
    } else if (this.state.maxSwipes == "27") {
        copy(win13)
    } else if (this.state.maxSwipes == "26") {
        copy(win14)
    } else if (this.state.maxSwipes == "25") {
        copy(win15)
    } else if (this.state.maxSwipes == "24") {
        copy(win16)
    } else if (this.state.maxSwipes == "23") {
        copy(win17)
    } else if (this.state.maxSwipes == "22") {
        copy(win18)
    } else if (this.state.maxSwipes == "21") {
        copy(win19)
    } else if (this.state.maxSwipes == "20") {
        copy(win20)
    } else if (this.state.maxSwipes == "19") {
        copy(win21)
    } else if (this.state.maxSwipes == "18") {
        copy(win22)
    } else if (this.state.maxSwipes == "17") {
        copy(win23)
    } else if (this.state.maxSwipes == "16") {
        copy(win24)
    } else if (this.state.maxSwipes == "15") {
        copy(win25)
    } else if (this.state.maxSwipes == "14") {
        copy(win26)
    } else if (this.state.maxSwipes == "13") {
        copy(win27)
    } else if (this.state.maxSwipes == "12") {
        copy(win28)
    } else if (this.state.maxSwipes == "11") {
        copy(win29)
    } else if (this.state.maxSwipes == "10") {
        copy(win30)
    } else if (this.state.maxSwipes == "9") {
        copy(win31)
    } else if (this.state.maxSwipes == "8") {
        copy(win32)
    } else if (this.state.maxSwipes == "7") {
        copy(win33)
    } else if (this.state.maxSwipes == "6") {
        copy(win34)
    } else if (this.state.maxSwipes == "5") {
        copy(win35)
    } else if (this.state.maxSwipes == "4") {
        copy(win36)
    } else if (this.state.maxSwipes == "3") {
        copy(win37)
    } else if (this.state.maxSwipes == "2") {
        copy(win38)
    } else if (this.state.maxSwipes == "1") {
        copy(win39)
    } else if (this.state.maxSwipes == "0") {
        copy(win40)
    }
} else {
    copy(lTxt)
}
this.setState({
    copiedTxt: "Your score has been copied!"
})
}

goToEmail = () => {
    window.location.href='mailto:support@flashcrd.com'
}


    render () {

        var win40 = {

        }

        var winningText = `f l a⚡️h c r d 🏅 - w/ ${this.state.maxSwipes} swipe(s) left

🟨🟪🟨🟪🟨
🟪${this.state.dailyImg}${this.state.dailyImg}${this.state.dailyImg}🟪
🟨${this.state.dailyImg}${this.state.dailyImg}${this.state.dailyImg}🟨
🟪🟨🟪🟨🟪`

        var losingText = `f l a⚡️h c r d #${this.state.loadedGameNum} - w/ ${this.state.zeroCounter} missed chance(s)

🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪
🟨🟪🟨🟪🟨
🟪🟨🟪🟨🟪 

https://flashcrd.com
`



        let coStyle = {
            color: "orange"
        }

        let mStyle = {
            color: "purple"
        }


        return (
            // You must provide the ref to the element you're tracking the
            // mouse position of
            <Styles>
                <div className='mainpage'>
                    <h1>fla<label>⚡️</label>hcrd</h1>
                    {this.state.nextGame && 
                        <p className='nextGame'>[ You can play again @ midnight your time ]</p>
                    }
                    <h3>Swipe over the card until you land on the image</h3>
                    <h4>On mobile/tablets - tap the card then any white space for a swipe</h4>
                    <h5>(Pro tip - swipe fast!)</h5>
                    <h3>Swipes Left: {this.state.maxSwipes}</h3>
                    <div 
                    onMouseOver={this.changeBackground}
                    className='flashcard'>
                        {/* <img
                        src={this.state.imgSrc}
                        /> */}
                        <h1>{this.state.dailyImg}</h1>
                    </div>
                    {this.state.winnerDisplay && 
                        <div className='winDisplay'>
                            <h1>Woohoo! 🎉</h1>
                            <button
                            onClick={this.doneClicked}
                            ><strong>Done</strong></button>
                        </div>
                    }
                    {this.state.shareBtn && 
                        <div className='winDisplay'>
                            <p>{this.state.copiedTxt}</p>
                            <button
                            onClick={() => this.copyShareTxt(winningText, losingText)}
                            ><strong>Share <label><img src="assets/shareImg.png"/></label></strong></button>  
                        </div>
                    }
                    <div className='contact'>
                        {/* <h6>(inspired by Wordle)</h6> */}
                        <p onClick={this.goToEmail}><label>Contact - </label>support@flashcrd.com</p>
                    </div>
                </div>
            </Styles>
          )
    }

}