import {reactive} from 'vue'

export default reactive({
    gameRunning : false,
    searching: false,
    score: 0,
    timeLeft: 100,
    difficulty: 30,
    currentGame: {
        names: [],
        screen: ''
    }
})