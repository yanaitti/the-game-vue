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
        <ul>
          <li v-for="(value, key) in client.holdcards" :key="key">
            <template v-if='turn'>
              <v-btn v-on:click='putCard(value)' class='list'>
                {{ value }}
              </v-btn>
            </template>
            <template v-else>
              <v-btn class='list'>
                {{ value }}
              </v-btn>
            </template>
          </li>
        </ul>
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
      <ul>
        <li v-for="(hightolow, key) in game.hightolow" :key="key">
          <ul v-on:click='setArea(key)'>
            <li v-for="(card, key) in hightolow" :key="key" class='list'>
              {{ card }} =>
            </li>
          </ul>
          <br/>
          <br/>
        </li>
      </ul>
      <ul>
        <li v-for="(lowtohigh, key) in game.lowtohigh" :key="key">
          <ul v-on:click='setArea(key+2)'>
            <li v-for="(card, key) in lowtohigh" :key="key" class='list'>
              {{ card }} =>
            </li>
          </ul>
          <br/>
          <br/>
        </li>
      </ul>
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
  },
  // created: function() {
  //   this.game_id = this.$route.params.gameid != undefined ? this.$route.params.gameid : false;
  // },
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
      // axios.get('http://localhost:5000/create/'+this.cName_inp).then((res) => {
      axios.get('/create/'+this.cName_inp).then((res) => {
        this.game_id = res.data;
        this.client_id = this.game_id;
        this.guest = false;
        // this.uriWgId = 'http://localhost:5000/?game_id='+this.game_id;
        this.uriWgId = 'https://the-game-vue.herokuapp.com/?game_id='+this.game_id;
        console.log(res.data);
        setInterval(() => {
          this.status_check();
        }, 1000);
      })
    },
    joinGame: function() {
      // axios.get('http://localhost:5000/'+this.game_id+'/join/'+this.cName_inp).then((res) => {
      axios.get(this.game_id+'/join/'+this.cName_inp).then((res) => {
        console.log(res.data);
        this.client_id = res.data.split(',')[0].trim();
        this.guest = true;
        setInterval(() => {
          this.status_check();
        }, 1000);
      })
    },
    startGame: function() {
      // console.log('--'+this.rule_type);
      // axios.get('http://localhost:5000/'+this.game_id+'/start'+(this.rule_type?'/original':'')).then((res) => {
      axios.get(this.game_id+'/start'+(this.rule_type?'/original':'')).then((res) => {
        this.game = res.data;
        // console.log(this.game);
      })
    },
    nextPlayer: function() {
      // axios.get('http://localhost:5000/'+this.game_id+'/next');
      axios.get(this.game_id+'/next');
      this.error_message = '';
    },
    putCard: function(value) {
      // alert(value);
      // axios.get('http://localhost:5000/'+this.game_id+'/'+this.client_id+'/set/'+this.sel_area+'/'+value)
      axios.get(this.game_id+'/'+this.client_id+'/set/'+this.sel_area+'/'+value)
      .then(res => {
        this.error_message = res.data;
      })
    },
    setArea: function(value) {
      // alert(value);
      this.sel_area = value;
    },
    status_check: function() {
      // console.log(this.gameid);
      // axios.get('http://localhost:5000/'+this.game_id+'/status').then((res) => {
      axios.get(this.game_id+'/status').then((res) => {
        this.game = res.data;
        // console.log(this.game);

        this.client = res.data.players.find((v) => v.playerid.trim() == this.client_id.trim());
        this.nick_name = this.client.nickname;
        this.turn = (this.game.routelist[this.game.routeidx].playerid == this.client_id? true: false);
        // console.log(this.game.routeidx+'/'+this.game.routelist[this.game.routeidx].playerid+'/'+this.client_id);
      })
    },
  },
}
</script>
