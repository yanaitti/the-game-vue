<template>
  <v-container>
    <v-flex xs10>
    <v-card-title class="font-weight-bold">THE GAME</v-card-title>
    <v-card-text>このゲームは１～５人用となっています。</v-card-text>
      <br/>
    <div v-if="game == '***'">
      <v-text-field v-model="cName_inp" label="ニックネームを入力してください" filled></v-text-field><br/>
      <div v-if="!game_id">
        <v-btn v-on:click='createGame'>ゲームを作る(Make a Game)</v-btn><br/>
      </div>
      <div v-else>
        <v-btn v-on:click="joinGame">ゲームに参加する(Join the Game)</v-btn><br/>
      </div>
    </div>
    <div v-else>
      <!-- {{ game }} -->
      <div v-if="game.status == 'waiting'">
        Your ID: {{ client_id }}<br/>
        Your Name: {{ nick_name }}<br/>
        <!-- clint:{{ client }} -->
        <div v-if="!guest">
          <v-row>
            <v-col cols='12' sm='6'>
              <v-text-field v-model='uriWgId' readonly></v-text-field>
            </v-col>
            <v-col cols='12' sm='6'>
              <v-btn @click='clickCopy'>copy</v-btn>
            </v-col>
          </v-row>
          <br/>
          <v-btn v-on:click="startGame">ゲームを始める(Let's start the Game)</v-btn><br/>
          <v-checkbox v-model='rule_type'>
            <template v-slot:label>
              オリジナルルール(Use Original Rule)<br/>
              1.&nbsp;直前がぞろ目ならぞろ目を出せる(大小制限なし)<br/>
              2.&nbsp;10単位での戻りが無制限(大小制限なし)<br/>
            </template>
          </v-checkbox>
        </div>
      </div>
      <div v-else-if="game.status == 'started'">
        Your ID: {{ client_id }}<br/>
        Your Name: {{ nick_name }}<br/>
        Last cards: {{ game.stocks.length }}<br/>
        <br/>
        Your Turn: {{ (turn? 'Your turn':'Not your turn') }}
        <br/>
        Your Cards:<br/>
        <table>
          <tr>
            <td v-for="(value, key) in client.holdcards" :key="key">
              <template v-if='turn'>
                <div v-on:click='putCard(value)' class='card'>
                  {{ value }}
                </div>
              </template>
              <template v-else>
                <div class='card'>
                  {{ value }}
                </div>
              </template>
            </td>
          </tr>
        </table>
        <br/>
        <br/>
        <template v-if="turn">
          <v-btn v-on:click="nextPlayer">次の人へ(Go on Next user)</v-btn><br/>
        </template>
      </div>
      <hr/>
      <br/>
      <h2>Member Applying</h2>
      <span v-for="(player, key) in game.players" :key="key">
        {{ player.nickname }}({{ player.playerid }})&nbsp;
      </span>
      <br/>
      <h2>Game Cards</h2>
      <table>
        <tr v-for="(hightolow, key) in game.hightolow" :key="key">
          <td v-on:click='setArea(key)'>
            <div v-for="(card, key) in hightolow" :key="key" class='card'>
              {{ card }}
            </div>
          </td>
        </tr>
      </table>
      <table>
        <tr v-for="(lowtohigh, key) in game.lowtohigh" :key="key">
          <td v-on:click='setArea(key+2)'>
            <span v-for="(card, key) in lowtohigh" :key="key" class='card'>
              {{ card }}
            </span>
          </td>
        </tr>
      </table>
    </div>
    {{ error_message }}
    </v-flex>
  </v-container>
</template>

<script>
const axios = require('axios');

export default {
  data: function(){
    return {
      cName_inp: '',
      game: '***',
      error_message: '',
      guest: false,
      turn: false,
      rule_type: false,
      game_id: '',
      uriWgId: 'aaaa',
      area: '',
      sel_area: '',
    }
  },
  mounted() {
    this.game_id = this.$route.query.game_id;
    this.guest = (this.$route.query.game_id != ''? true : false);
    console.log(process.env.NODE_ENV);
  },
  methods: {
    clickCopy: function() {
      navigator.clipboard.writeText(this.uriWgId)
      .then(() => {
          // console.log("copied!");
          alert('copied!');
      })
      .catch(e => {
          console.error(e);
      })
    },
    createGame: function() {
      axios.get(process.env.VUE_APP_API_BASE_URL+'create/'+this.cName_inp).then((res) => {
        this.game_id = res.data;
        this.client_id = this.game_id;
        this.guest = false;
        // this.uriWgId = 'http://localhost:5000/?game_id='+this.game_id;
        this.uriWgId = window.location.href+'?game_id='+this.game_id;
        console.log(res.data);
        setInterval(() => {
          this.status_check();
        }, 1000);
      })
    },
    joinGame: function() {
      axios.get(process.env.VUE_APP_API_BASE_URL+this.game_id+'/join/'+this.cName_inp).then((res) => {
        console.log(res.data);
        this.client_id = res.data.split(',')[0].trim();
        this.guest = true;
        setInterval(() => {
          this.status_check();
        }, 1000);
      })
    },
    startGame: function() {
      axios.get(process.env.VUE_APP_API_BASE_URL+this.game_id+'/start'+(this.rule_type?'/original':'')).then((res) => {
        this.game = res.data;
        // console.log(this.game);
      })
    },
    nextPlayer: function() {
      axios.get(process.env.VUE_APP_API_BASE_URL+this.game_id+'/next');
      this.error_message = '';
    },
    putCard: function(value) {
      axios.get(process.env.VUE_APP_API_BASE_URL+this.game_id+'/'+this.client_id+'/set/'+this.sel_area+'/'+value)
      .then(res => {
        this.error_message = res.data;
      })
    },
    setArea: function(value) {
      this.sel_area = value;
    },
    status_check: function() {
      axios.get(process.env.VUE_APP_API_BASE_URL+this.game_id+'/status').then((res) => {
        this.game = res.data;
        // console.log(this.game);

        this.client = res.data.players.find((v) => v.playerid.trim() == this.client_id.trim());
        this.nick_name = this.client.nickname;
        if(this.game.status == 'started'){
          this.turn = (this.game.routelist[this.game.routeidx].playerid == this.client_id? true: false);
        }
      })
    },
  },
}
</script>
