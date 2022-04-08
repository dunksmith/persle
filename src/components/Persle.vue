<template>
  <div id="main">

    <h3>
      <span class="material-icons">face</span>
      PERSLE
      &nbsp; &nbsp;
      <span class="subtitle">Guessing people's names</span>
    </h3>

    <a class="top-button" href='#'>
      <span class="material-icons">settings</span>
    </a>


    <a class="top-button" href='#'>
      <span class="material-icons">leaderboard</span>
    </a>

    <a class="top-button" href='#'>
      P+
    </a>

    <a class="top-button" href='#'>
      GU
    </a>

    <div v-for="(guess,i) in guesses" :key="i">
      <span v-for="(letter,j) in guess" :key="j+10">
        <span class="letter" :id="'G'+i+'L'+j">{{letter}} </span>
      </span>
    </div>

    <br />

    <div v-for="(row,i) in keyboard" :key="i+100" :class="{'disabled': disable}">
      <span v-for="(key,j) in row" :key="j+1000">
        <a
          href='#'
          class="key" :class="i===2 ? (j === 0 ? 'danger' : (j === 8 ? 'action' : null)) : null"
          @click="typeLetter(key)"
        >{{key}}</a>
      </span>
    </div>

    <div class="msg" v-if="msg" :class="msgColour">
      {{msg}}
    </div>

  </div>
</template>

<script>
import wordChecker from './wordChecker';
import workChecker from "./wordChecker";

export default {
  data () {
    return {
      numOfLetters: 5,
      numOfGuesses: 6,
      guesses:[],
      keyboard: [],
      iGuess: 0,
      iLetter: 0,
      msg: null,
      msgColour: null,
      disable: false,
    }
  },

  mounted: function() {
    for(var i=1; i<=this.numOfGuesses; i++)
    {
      var guess = Array(this.numOfLetters);
      
      this.guesses.push(guess);
    }

    this.keyboard[0] = "QWERTYUIOP";
    this.keyboard[1] = "ASDFGHJKL";
    this.keyboard[2] = "←ZXCVBNM↵";
  },

  methods: {
    typeLetter: function(key) {

      this.clearMsg();

      if (key === "←") {
        if (this.iLetter === 0) return;
        this.guesses[this.iGuess][this.iLetter-1] = "";
        this.iLetter--;
        this.$forceUpdate();
        return;
      }

      if (key === "↵") {
        if (this.iLetter !== this.numOfLetters) return;
        
        if (!this.checkWord()) return;
        
        this.iGuess++;
        this.iLetter = 0;

        if (this.iGuess >= this.numOfGuesses) {
          this.lose();
        }

        return;
      }

      if (this.iLetter >= this.numOfLetters) return;

      this.guesses[this.iGuess][this.iLetter++] = key;

      this.$forceUpdate();
    },

    checkWord: function() {
      var word = this.guesses[this.iGuess].join("");

      var result = workChecker.checkWord(word);

      if (!result) {
        this.msg = "Not a name";
        this.msgColour = "warn";
        this.clearWord();
        return false;
      }

      for(var i=0;i<result.length;i++) {
        var css = result[i] === 0 ? 'no' : (result[i] === 1 ? 'nearly' : 'yes');

        document.getElementById(`G${this.iGuess}L${i}`).classList.add(css);
      }

      if (result.every(x => x === 2)) {
        this.win();
        return fasle;
      }

      return true;
    },

    clearMsg: function() {
      this.msg = null;
      this.msgColour = null;
    },

    clearWord: function() {
      for(var i=0;i<this.numOfLetters; i++) {
        this.guesses[this.iGuess][i] = null;
      }
      this.iLetter = 0;
      this.$forceUpdate();
    },

    win: function() {
      this.msg = "Well done!";
      this.msgColour = "success";
      this.disable = true;
    },

    lose: function() {
      this.msg = "Bad luck! It was " + wordChecker.getName();
      this.msgColour = "warn";
      this.disable = true;
    },
  }

}
</script>

<style scoped>
h3 {
  text-align: center;
  margin-bottom: 10px;
}
h3 span.material-icons {
  vertical-align: bottom;
}
h3 span.subtitle {
  font-size: 80%;
  color: #999999;
}

.letter {
  height: 40px;
  width: 40px;
  border: #666666 solid 1px;
  display: inline-block;
  margin-left: 5px;
  margin-bottom: 5px;
  border-radius: 5px;
  vertical-align: bottom;
  line-height: 1.8;
  font-size: 23px;
}

.letter.yes, .letter.nearly, .letter.no {
  color: white;
}

.letter.yes {
  background: #22c55e;
}
.letter.nearly {
  background: #fbbf24;
}
.letter.no {
  background: #9ca3af;
}

.top-button {
  color: #0074d9;
  margin: 0 0px 15px;
  text-decoration: none;
  display: inline-block;
  font-size: 22px;
  padding-left: 8px;
}
.top-button span {
  font-size: 20px;
}

.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.key {
  border: #666666 solid 1px;
  padding: 3px;
  text-decoration: none;
  margin: 3px 3px;
  width:20px;
  display: inline-block;
}
.key:active {
  animation-name: flash;
  animation-duration: .3s;
  color: black;
}
.key.action {
  background: #22c55e;
}
.key.danger {
  background: #fca5a5;
}

.msg {
  color: #9ca3af;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
}

.warn {
  color: #fbbf24;
}

.success {
  color: #22c55e;
}

@keyframes flash {
  from {background-color: #999999;}
  to {background-color: transparent;}
}

</style>

