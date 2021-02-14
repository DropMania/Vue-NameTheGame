<template>
    <div class="container center-align all">
        <div class="row">
            <div class="col s12"></div>
        </div>
         

        <div class="imageContainer deep-purple darken-3 row valign-wrapper">
            <div v-if="gameStore.searching"  class="col s12">
                <div class="preloader-wrapper big active">
                    <div class="spinner-layer spinner-green-only">
                    <div class="circle-clipper left">
                        <div class="circle"></div>
                    </div><div class="gap-patch">
                        <div class="circle"></div>
                    </div><div class="circle-clipper right">
                        <div class="circle"></div>
                    </div>
                    </div>
                </div>
            </div>
            <div v-if="!gameStore.gameRunning" class="col s12">
                <a class="waves-effect waves-light btn" @click="startGame">start</a>
            </div>
            <div v-show="!gameStore.searching && gameStore.gameRunning">
                <img  @load="gameFound" :src="'https:'+gameStore.currentGame.screen" />
            </div>
        </div>
        <div class="progress">
            <div class="determinate" :style="`width:${gameStore.timeLeft}%`"></div>
        </div>
        <div >
            {{gameStore.currentGame.name}}
            <div class="input-field row">
                <input placeholder="Guess Game..." id="searchField" type="text" class="validate col s12" v-model="guessVal" @keyup="guessGameKeyup">
                <!-- <label for="searchField">First Name</label> -->
            </div>
            <div class="right-align row">
                <div class="scoredisplay col s6">{{gameStore.score}}</div>
                <a class="waves-effect waves-light btn col s2" @click="skipGame">Skip</a>
                <div class="col s1"></div>
                <a class="waves-effect waves-light btn col s3" @click="guessGame">Guess</a>
            </div>
        </div>
    </div>
</template>

<script setup>
    import gameStore from '../stores/gameStore'
    import gameApi from '../utils/gameApi'
    import {watchEffect, ref} from 'vue'
    import randomseed from 'random-seed';
    import leven from 'leven'

    let guessVal = ref('')
    let gamesPlayed = []
    let interval
    
    let startGame = () => {
        gameStore.gameRunning = true
        gameStore.searching = true
        interval = setInterval(()=>{
            gameStore.timeLeft-=1*(gameStore.difficulty/100)
        },100)
    };
   
    let gameFound = () => {
        gameStore.searching = false
        guessVal.value = ""
        interval = setInterval(()=>{
            gameStore.timeLeft-=1*(gameStore.difficulty/100)
        },100)
    }

    let endGame = () => {
        gameStore.gameRunning = false
        gameStore.searching = false
        gameStore.timeLeft = 100
        gameStore.score = 0
        clearInterval(interval)
    }


    let guessGame = () => {
        let score = 0;
        if(gameStore.currentGame.names.some(name=>{
            let nameLen = name.length
            let dist =leven(guessVal.value.toUpperCase(),name.toUpperCase())
            score = Math.floor((1 - (dist/nameLen))*100)
            console.log('score',score)
            return score >= 50
        })){
            gameStore.searching = true
            console.log('right')
            guessVal.value = ""
            gameStore.score += 100 + Math.floor((score - 50) / 10) * 10
            gameStore.timeLeft += gameStore.difficulty/10
        }else{
            console.log('wrong')
        }
    }
    let guessGameKeyup = (e) =>{
        if(e.key == 'Enter'){
            guessGame()
        }
        if(e.key == 'Alt'){
            e.preventDefault()
            skipGame()
        }
    }

    let skipGame = () => {
        gameStore.searching = true
        guessVal.value = ""
    }

    let rng = randomseed.create(Math.random())

    watchEffect(()=>{
        if(gameStore.timeLeft < 0){
            endGame()
        }
    })

    watchEffect(async ()=>{
        if(gameStore.searching){
            clearInterval(interval)
            let chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y']
            let rng1 = chars[rng(chars.length-1)]

            
            let games = await gameApi.search('games',`
            fields name,follows,screenshots.url,alternative_names.name; 
            where name = *"${rng1}"* 
            & follows > 50;
            limit 500;`)
            
            let gameidx = rng(games.length-1);
            if(games.length){
                let game = games[gameidx]
                gamesPlayed.push(game.id)
                if(game.hasOwnProperty('screenshots')){
                    let altNames = game.hasOwnProperty('alternative_names')?game.alternative_names.map(n=>n.name):[]
                    let screen = game.screenshots[rng(game.screenshots.length-1)].url.replace(/thumb/g,'screenshot_big')

                    gameStore.currentGame ={
                        names: [game.name,...altNames],
                        screen
                    }
                }else{
                    gameStore.searching = false
                    console.log('nothing found')
                    gameStore.searching = true
                }
            }else{
                gameStore.searching = false
                console.log('nothing found')
                gameStore.searching = true
            }
        }
    })
</script>

<style scoped>
.input-field  {
    color: #fff;
}
img{
    height: 100%;
    width: 100%;
    border: solid black;
}

.imageContainer{
    height: 502px;
    box-shadow: 10px 10px 15px  black;
}
.all{
    height: 100%;
}
.scoredisplay{
    color: white;
    text-align: center;
    font-size: 2rem;
}
</style>