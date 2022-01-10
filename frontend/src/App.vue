<template>
  <section class='container'>
    このゲームは１～５人用となっています。<br/>
    <h1 id='sec2' >test</h1>
    <p v-html="game_id">no message</p>
    <div v-if="game == '***'">
      <input v-model="cName_inp" placeholder="ニックネームを入力してください"><br/>
      <div v-if="!game_id">
        <button v-on:click='createGame'>ゲームを作る(Make a Game)</button><br/>
      </div>
      <div v-else>
        <button v-on:click="joinGame">ゲームに参加する(Join the Game)</button><br/>
      </div>
    </div>
    <div v-else>
      {{ game }}
      <div v-if="game.status == 'waiting'">
        Your ID: {{ client_id }}<br/>
        Your Name: {{ nick_name }}<br/>
        <!-- clint:{{ client }} -->
        <div v-if="!guest">
          <button v-on:click="startGame">ゲームを始める(Let's start the Game)</button><br/>
          <input type='checkbox' v-model='rule_type' id="rule_type" value='original'>オリジナルルール(Use Original Rule)<br/>
          1.&nbsp;直前がぞろ目ならぞろ目を出せる(大小制限なし)<br/>
          2.&nbsp;10単位での戻りが無制限(大小制限なし)<br/>
        </div>
      </div>
      <div v-else-if="game.status == 'started'">
        {{ game.stocks.length }}<br/>
        Your Turn: {{ (turn? 'Your turn':'Not your turn') }}
        <br/>
        Your Cards:<br/>
        {{ client.holdcards }}
        <br/>
        <button v-on:click="nextPlayer">次の人へ(Go on Next user)</button><br/>
      </div>
      <hr/>
      <h2>Member Applying</h2>
      <!-- <span v-for="player in game.players">{{ player.nickname }}({{ player.playerid }})&nbsp;</span> -->
    </div>
    {{ error_message }}
  </section>
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
    createGame: function() {
      // axios.get('http://localhost:5000/create/'+this.cName_inp).then((res) => {
      axios.get('/create/'+this.cName_inp).then((res) => {
        this.game_id = res.data;
        this.client_id = this.game_id;
        this.guest = false;
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
        this.client_id = res.data.split(',')[0];
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
      // axios.get('http://localhost:5000/'+this.game_id+'/next').then((res) => {
      //   this.game = res.data;
      // })
    },
    status_check: function() {
      // console.log(this.gameid);
      // axios.get('http://localhost:5000/'+this.game_id+'/status').then((res) => {
      axios.get(this.game_id+'/status').then((res) => {
        this.game = res.data;
        // console.log(this.game);

        this.client = res.data.players.find((v) => v.playerid.trim() == this.client_id.trim());
        this.nick_name = this.client.nickname;
        this.turn = (this.client.playerid == this.client_id? true: false);
      })
    },
  },
}
</script>
