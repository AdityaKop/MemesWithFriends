// Initialize Horizon and Collections
const horizon = new Horizon()
const messages = horizon('messages') // { id, username, text, datetime }
const players = horizon('players') // { id, username, score, active }
const tally = horizon('tally') // { id (same as player), points, memeUrl }
const selection = horizon('selection') // {id, meme, topic}

// Populate default values into the the Collections

/*selection.fetch().subscribe(
        result => selection.remove(result),
        err => console.log(err),
        () => console.log('done')
      )*/

selection.upsert({
    id: 1,
    meme: { text: 'Meme' },
    topic: 'Topic',
    memeID: 0
  })


// Constant topics array
const topics = 
[
  "School Struggles", "Just College Things", "Music", "Food/Cooking",
  "Overwatch", "CS:GO", "League of Legends", "Hackathons", "Sports",
  "Memes", "Pokemon Go", "Social Media", "Relationships/Dating", "Politics",
  "Brexit", "Trump", "Clinton", "Bernie", "Current Events", "Russia",
  "Male Struggles", "Female Struggles", "Programming", "Engineering"
]

const app = new Vue({
  el: '#app',
  template: `
    <h1><center>Memes With Friends</center></h1>

    <template v-if='active'>
     <form id="demo">
      <p>
        <input type="text" v-model="topText">
          {{topText}}
        <input type="text" v-model="bottomText">
          {{bottomText}}
      </p>
    </form>
    <button v-on:click="makeMeme">Press me</button>
    <img src= {{imgURL}}></img>
    </template>

    <template v-else>
      <button id="button1" v-on:click="buttonPressed(0)">{{button1_text}}</button>
      <button id="button2" v-on:click="buttonPressed(1)">{{button2_text}}</button>
      <p>score1={{score1}}</p>
      <p>score2={{score2}}</p>
    </template>

    <!-- Stuff that's always on everyone's screen goes below -->

    <!-- Chatbox -->
    <div><center>
      <div id="chatArea" style="overflow: scroll; border:1px solid gray; max-width: 50vw; max-height: 35vh; text-align: left">
          <p v-for="message in messages" style="padding-left:10px; padding-bottom:10px;">
            <b>{{ message.username }}</b>: {{ message.text }}
          </p>
      </div>
      <div id="input">
        <input @keyup.enter="sendMessage" placeholder="Enter message..."></input>
      </div>
       <button v-on:click='removeMessage'>Purge</button>
    </center></div>
    <!-- End Chatbox -->

    <!-- Roulettes -->
      <div id="container-tv">
        <div id="roulette-meme-tv">{{ currentMeme ? currentMeme.text : '' }}</div>
        <div id="roulette-topic-tv">{{ currentTopic }}</div>
        <div id="roulette-start-tv">
          <input type="button" value="Start" v-on:click="startSpin(50)"/>
        </div>
      </div>
    <!-- End Roulettes -->
  `,
  data: {
    // Our dynamic list of chat messages
    button1_text: "meme1",
    button2_text: "meme2",
    score1: 0,
    score2: 0,
    messages: [],
    topText: '',
    bottomText: '',
    imgURL: "",
    memer: false,
    voting: false,
    player: { username: 'Aditya', score: 0, active: false },
    currentMeme: { text: "Meme", url: "" },
    currentTopic: "Topic",
    json: []
  },
  created() {

    // Get the dank memes
    this.get("https://api.imgflip.com/get_memes", function(res) {
      this.json = JSON.parse(res).data.memes
      //console.log(this.json[0])
    })

    // Subscribe to messages
    messages.order('datetime', 'descending').limit(40).watch()
    .subscribe(allMessages => {
        // Make a copy of the array and reverse it, so newest images push into
        // the messages feed from the bottom of the rendered list. (Otherwise
        // they appear initially at the top and move down)
        this.messages = [...allMessages].reverse()
      },
      // When error occurs on server
      error => console.log(error)
    )

    selection.watch().subscribe( allSelection => {
      console.log(allSelection[0])
      this.currentMeme = allSelection[0].meme
      this.currentTopic = allSelection[0].topic
    })

    // Triggers when client successfully connects to server
    horizon.onReady().subscribe(
      () => console.log("Connected to Horizon server")
    )

    // Triggers when disconnected from server
    horizon.onDisconnected().subscribe(
      () => console.log("Disconnected from Horizon server")
    )
  },
  methods: {
     //starts spins for both roulettes
    startSpin: function(num){
      this.setRandomMeme(json)
      this.setRandomTopic(topics)
      selection.update({ id: 1, meme: this.currentMeme, topic: this.currentTopic })
      /*var thing = this
      for (var i = 0; i < num; i++) {
        setTimeout(
          function() { thing.setRandomMeme(this.json)
                       thing.setRandomTopic(topics)
                       selection.update({ id: 1, meme: this.currentMeme, 
                        topic: this.currentTopic })
                     }, 10*(i/2)*(i/2));
      }*/
    },
    getRandom: function(min,max){ 
      return Math.floor(Math.random() * (max-min) + min);
    },
    setRandomMeme: function(items) {
      var temp = items[this.getRandom(0, items.length)]
      //console.log(temp)
      this.currentMeme = { text: temp.name, url: temp.url, memeID: temp.id }
    },
    setRandomTopic: function(items) {
      this.currentTopic = items[this.getRandom(0, items.length)]
    },
    get: function(theUrl, callback){
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200 && callback)
            callback(xmlHttp.responseText);
      }
      xmlHttp.open("GET", theUrl, true); // true for asynchronous 
      xmlHttp.send(null);
    },
    removeMessage() {
      messages.fetch().subscribe(
        result => messages.remove(result),
        err => console.log(err),
        () => console.log('done')
      )
    },

    buttonPressed(num) {
      if(num == 0){
        this.button1_text = "voted"
        this.score1 += 1
      }
      else{
        this.button2_text = "voted"
        this.score2 += 1
      }
      document.getElementById("button1").disabled = true;
      document.getElementById("button2").disabled = true;
    },

    sendMessage(event) {
      messages.store({
        username: this.player.username,
        text: event.target.value,
        datetime: new Date()
      }).subscribe(
          result => console.log(result),
          error => console.log(error)
        )
        // Clear input for next message
        event.target.value = ''
    },

     makeMeme(){
        console.log(this.topText)
        console.log(this.bottomText)
          console.log("Test")
        var http = new XMLHttpRequest();
        var params = "template_id=" + "61579" + "&";
        params += "username=" + 'MemesWithFriends' + "&";
        params += "password=" + 'memepoly2017' + "&";
        params += "text0=" + this.topText + "&";
        params += "text1=" + this.bottomText;
        console.log(params)
        http.open("POST", "https:\/\/api.imgflip.com\/caption_image", true);
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8");

        http.onreadystatechange = function() {
            if(http.readyState == 4 && http.status == 200) {
                alert(http.responseText);
                imgURL = JSON.parse(http.responseText).data.url
                console.log(imgURL);
            }
        }
        http.send(params);
    },


  }
})