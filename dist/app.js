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

tally.upsert([{ id: 1, points: 0 }, { id: 2, points: 0 }])


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
    <input type="text" v-if="in" @keyup.enter="setUsername" placeholder="Enter username">
    <template v-if='player.active'>
     <form id="demo">
      <p>
        <input type="text" v-model="topText" placeholder="Type top text...">
          {{topText}}
        <input type="text" v-model="bottomText" placeholder="Type bottom text...">
          {{bottomText}}
      </p>
    </form>
    <button v-on:click="makeMeme">Press me</button>
    <table>
    <tr>
    <td><div id='photo-1'></div></td>
    <td><div id='photo-2'></div></td>
    </tr>
    </table>
    </template>

    <template v-else>
      <button id="button1" v-on:click="buttonPressed(1)">{{button1_text}}</button>
      <button id="button2" v-on:click="buttonPressed(2)">{{button2_text}}</button>
      <p>Tally1={{tally1}}</p>
      <p>Tally2={{tally2}}</p>
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
    <input type="button" value="Reset buttons" v-on:click="buttonReset"/>
  `,
  data: {
    // Our dynamic list of chat messages
    in: true,
    username: 'Guest',
    button1_text: "Vote for me!",
    button2_text: "Vote for me!",
    tally1: 0,
    tally2: 0,
    messages: [],
    topText: '',
    bottomText: '',
    imgURL: "",
    memer: false,
    voting: false,
    player: { username: 'Guest', score: 0, active: true },
    currentMeme: { text: "Meme", url: "" },
    currentTopic: "Topic",
    json: [],
    temp_id: 0
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
        var chatObj = document.getElementById("chatArea")
        chatObj.scrollTop = chatObj.scrollHeight
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
    setUsername(event) {
      this.username = event.target.value
      if (this.username == '') {
        this.username = 'Guest'
      }
      this.in = false
      this.player.username = this.username
     //starts spins for both roulettes
    },
    startSpin: function(num){
      this.setRandomMeme(json)
      this.setRandomTopic(topics)
      selection.update({ id: 1, meme: this.currentMeme, topic: this.currentTopic, memeID: this.currentMeme.memeID })
      /*var thing = this
      for (var i = 0; i < num; i++) {
        setTimeout(
          function() { thing.setRandomMeme(this.json)
                       thing.setRandomTopic(topics)
                       selection.update({ id: 1, meme: this.currentMeme, 
                        topic: this.currentTopic })
                     }, 10*(i/2)*(i/2));
      }*/
      this.makeMemeTemplate();
    },
    getRandom: function(min,max){ 
      return Math.floor(Math.random() * (max-min) + min);
    },
    setRandomMeme: function(items) {
      var temp = items[this.getRandom(0, items.length)]
      //console.log(temp)
      this.currentMeme = { text: temp.name, url: temp.url, memeID: temp.id }
      this.temp_id = temp.id
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
      document.getElementById("button1").disabled = true;
      document.getElementById("button2").disabled = true;
      if(num == 1){
        this.button1_text = "voted"
        this.tally1 += 1
        tally.update({
            id: 1,
            points: points+1
        })
      }
      else{
        this.button2_text = "voted"
        this.tally2 += 1
        tally.update({
            id: 2,
            points: points+1
        })
      }
    },

    voteCompare(){
        var tally1 = 0;
        var tally2 = 0;
        tally1 = tally.find({id: 1}).points.fetch()
        tally2 = tally.find({id: 2}).points.fetch()
        if (tally1 > tally2){
            players.update({
                id: 1,
                score: score+1
            })
        }
        else if(tally1 == tally2){
            players.update({
                id: 1,
                score: score+1
            })
            players.update({
                id: 2,
                score: score+1
            })
        }
        else{
            players.update({
                id:2,
                score: score+1
            })
        }
    },

    buttonReset(){
        document.getElementById("button1").disabled = false;
        document.getElementById("button2").disabled = false;
        this.button1_text = "Vote for me!"
        this.button2_text = "Vote for me!"
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
        var chatObj = document.getElementById("chatArea")
        chatObj.scrollTop = chatObj.scrollHeight
    },

     makeMeme(){
        console.log(this.topText)
        console.log(this.bottomText)
          console.log("Test")
        var http = new XMLHttpRequest();
        var params = "template_id=" + this.temp_id + "&";
        params += "username=" + 'MemesWithFriends' + "&";
        params += "password=" + 'memepoly2017' + "&";
        params += "text0=" + this.topText + "&";
        params += "text1=" + this.bottomText;
        console.log(params)
        http.open("POST", "https:\/\/api.imgflip.com\/caption_image", true);
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8");

        http.onreadystatechange = function() {
            if(http.readyState == 4 && http.status == 200) {
                //alert(http.responseText);
                imgURL = JSON.parse(http.responseText).data.url
                console.log(imgURL);
                document.getElementById('photo-1').innerHTML = '<img src="' + imgURL + '" alt="Image" />';
                //document.getElementById('photo-2').innerHTML = '<img src="' + imgURL + '" alt="Image" />';
            }
        }
        http.send(params);
    },
    makeMemeTemplate(){
      document.getElementById('photo-1').innerHTML = '<img src="' + this.currentMeme.url + '"alt="Image" />'; 
      document.getElementById('photo-2').innerHTML = '<img src="' + this.currentMeme.url + '"alt="Image" />';     
    }

  }
})