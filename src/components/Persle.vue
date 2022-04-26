<template>
  <div id="main">

    <h3>
      <span class="material-icons">face</span>
      PERSLE
      &nbsp; &nbsp;
      <span class="subtitle">Guess people's names</span>
    </h3>

    <a class="top-button" href='#' @click="help()">
      <span class="material-icons">help</span>
    </a>


    <a class="top-button" href='#' @click="chart()">
      <span class="material-icons">leaderboard</span>
    </a>

    <a class="top-button" href='#' @click="lose()">
      GU
    </a>

    <div v-for="(guess,i) in guesses" :key="i">
      <span v-for="(letter,j) in guess" :key="j+10">
        <span class="letter" :id="'G'+i+'L'+j">{{letter}} </span>
      </span>
    </div>

    <div style="margin-top: 10px"></div>

    <div v-for="(row,i) in keyboard" :key="i+100" :class="{'disabled': disable}">
      <span v-for="(key,j) in row" :key="j+1000">
        <a
          href='#'
          class="key" :class="i===2 ? (j === 0 ? 'danger' : (j === 8 ? 'action' : null)) : null"
          @click="typeLetter(key)"
          :id="'key-' + key"
        >{{key}}</a>
      </span>
    </div>

    <div class="msg" v-if="msg" :class="msgColour">
      {{msg}}
    </div>

    <div class="dialog-container" v-if="dialog.show">
      <div class="dialog-bg"></div>
      <div class="dialog">
        <div class="close" @click="dialog.show=false">+</div>
        <!-- dialog content -->
        <h4>STATISTICS</h4>
        <table>
          <tr class="data">
            <td>{{totalPlays}}</td>
          </tr>
          <tr class="header">
            <td>played</td>
          </tr>
        </table>

        <div v-if="won">
          <a class="share-button" @click="share()">
            <span class="material-icons">share</span>
            Share
          </a>
          <div class="share-text" v-html="dialog.shareText"></div>
          <div class="share-confirm" v-if="dialog.shared">Copied!</div>
        </div>
      </div>
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
      matches:[],
      keyboard: [],
      iGuess: 0,
      iLetter: 0,
      msg: null,
      msgColour: null,
      disable: false,
      won: false,

      dialog: {
        show: false,
        shared: false,
        shareText: null,
      },
    }
  },
  computed: {
    totalPlays: function () {
      return parseInt(localStorage.getItem("persle_plays")) || 0;
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
        var msgs = ["UK baby names only", "Not a popular baby name", "Sorry I don't know that one"];
        var rand = Math.floor((Math.random() * 3));

        this.msg = msgs[rand];
        this.msgColour = "warn";
        this.clearWord();
        return false;
      }

      for(var i=0;i<result.length;i++) {
        var css = result[i] === 0 ? 'no' : (result[i] === 1 ? 'nearly' : 'yes');

        document.getElementById(`G${this.iGuess}L${i}`).classList.add(css);
      }

      this.matches.push(result);

      this.updateKeyboard(result, word);

      if (result.every(x => x === 2)) {
        this.win();
        return false;
      }

      return true;
    },

    updateKeyboard: function(result, word) {

      for(var i=0;i<result.length;i++) {
        var css = result[i] === 0 ? 'no' : (result[i] === 1 ? 'nearly' : 'yes');

        document.getElementById(`key-${word[i]}`).classList.add(css);
      }
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
      this.won = true;

      var lastPlayed = parseInt(localStorage.getItem("persle_lastDayPlayed")) || 0;
      
      var day = this.getDayOfPlay();
      localStorage.setItem("persle_lastDayPlayed", day);

      // Don't play twice in day!
      if (day > lastPlayed) {
        var plays = parseInt(localStorage.getItem("persle_plays")) || 0;
        localStorage.setItem("persle_plays", plays + 1);
      }

      setTimeout(() => {
        this.showDialog();
      }, 1000);
    },

    lose: function() {
      this.msg = "Bad luck! It was " + wordChecker.getName();
      this.msgColour = "warn";
      this.disable = true;
    },

    getDayOfPlay: function() {
      var ms = new Date() - new Date("2022-04-26T00:00"); // Day 0!
      var day = Math.floor(ms / 1000 / 60 / 60 / 24);
      return day;
    },

    showDialog: function() {
      this.dialog.show = true;

      // 🤯🤩😎😊😜🙂
      var faces = ['\u{1F92F}','\u{1F929}','\u{1F60E}','\u{1F60A}','\u{1F61C}','\u{1F642}']
      
      //⬜🟨🟩
      var results = ['\u{2B1C}','\u{1F7E8}','\u{1F7E9}']

      var day = this.getDayOfPlay();

      var shareText = "persle.com "
        + day + " "
        + (this.iGuess+1) + "/6 "
        + faces[this.iGuess];

      for(var i=0; i<this.iGuess+1; i++) {
        shareText += `
`;
        for(var j=0; j<this.numOfLetters; j++) {
          var r = this.matches[i][j];

          shareText += results[r];
        }
      }

      this.dialog.shareText = shareText;
    },

    help: function() {
      alert("Guess today's name by typing on the keyboard. Green = right place, Yellow = wrong place, Grey = not in word.")
    },
    
    chart: function() {
      this.dialog.show = true;
    },

    share: function() {    
      navigator.clipboard.writeText(this.dialog.shareText);

      this.dialog.shared = true;
    }
  }

}
</script>

<style scoped>
h3 {
  text-align: center;
  margin-bottom: 6px;
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

.key.no {
  background: #e2e8f0;
}
.key.nearly {
  background: #fde68a;
}
.key.yes {
  background: #bbf7d0 !important;
}

.msg {
  color: #9ca3af;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-top: 10px;
}

.warn {
  color: #fbbf24;
}

.success {
  color: #22c55e;
}

.dialog-container {
  position: absolute;
  inset: 0;
}

.dialog-bg {
  position: absolute;
  inset: 0;
  background: black;
  opacity: 0.2;
}

.dialog {
    width: 240px;
    border-radius: 12px;
    background: white;
    min-height: 250px;
    margin: 180px auto 0 auto;
    margin-left: auto;
    margin-right: auto;
    position: relative;
}

.dialog .close {
  position: absolute;
  right: 12px;
  top: 3px;
  transform: rotate(45deg);
  font-size: 28px;
  color: #999999;
}

.dialog h4 {
  padding-top: 30px;
  color: #777777;
}

.dialog table {
  margin: 0 auto;
}

.dialog table tr.data {
  font-weight: bold;
  font-size: 30px;
}

.dialog table tr.header {
  color: #666666;
  font-size: 14px;
}

.share-button {
  background: #22c55e;
  padding: 6px 18px;
  border-radius: 4px;
  color: #ffffff;
  font-size: 24px;
  margin-top: 30px;
  display: inline-block;
  cursor: pointer;
}

.share-button > span {
  vertical-align: text-top;
}

.share-text {
 white-space: pre;
 display: none;
}

.share-confirm {
  margin-top: 5px;
  color: #666666;
}

@keyframes flash {
  from {background-color: #999999;}
  to {background-color: transparent;}
}

/* iPhone 5/SE */
@media screen and (max-width: 666px) {
    
  .letter {
    height: 38px;
    width: 38px;
  }

  .key {
    width:17px;
    margin: 2px 2px;
  }
}

</style>

