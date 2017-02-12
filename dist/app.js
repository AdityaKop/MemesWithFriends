const horizon = new Horizon()
const messages = horizon('messages')

const app = new Vue({
  el: '#app',
  template: `
    <div>
      <div id="chatMessages">
        <ul>
          <li v-for="message in messages">
            {{ message.text }}
          </li>
        </ul>
      </div>
      <div id="input">
        <input @keyup.enter="sendMessage"></input>
      </div>
      <button 
    </div>
  `,
  data: {
    // Our dynamic list of chat messages
    messages: []
  },
  created() {
    // Subscribe to messages
    messages.order('datetime', 'descending').limit(10).watch()
    .subscribe(allMessages => {
        // Make a copy of the array and reverse it, so newest images push into
        // the messages feed from the bottom of the rendered list. (Otherwise
        // they appear initially at the top and move down)
        this.messages = [...allMessages].reverse()
      },
      // When error occurs on server
      error => console.log(error)
    )

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
    sendMessage(event) {
      messages.store({
        text: event.target.value, // Current value inside <input> tag
        datetime: new Date() // Warning clock skew!
      }).subscribe(
          // Returns id of saved objects
          result => console.log(result),
          // Returns server error message
          error => console.log(error)
        )
        // Clear input for next message
        event.target.value = ''
    }
  }
});

const roulette = new Vue({
  el: '#roulette',
  template: `<!-- Add your HTML here -->`,
  data: {
    // Add any local variables you need here
  },
  created() {
    // Any code you want to run the first time your component loads, put it here
    // This code will run ONLY ONCE, when the object is initialized
    // Use this for things like retrieving info from the database to initialize your variables
  },
  methods: {
    // Add any Javascript funtions you need to use in your HTML here
    // Ex. If you have a function you want to run when a button is pressed
  }
})

const scoreboard = new Vue({
  el: '#scoreboard',
  template: `<!-- Add your HTML here -->`,,
  data: {
    // Add any local variables you need here
  },
  created() {
    // Any code you want to run the first time your component loads, put it here
    // This code will run ONLY ONCE, when the object is initialized
    // Use this for things like retrieving info from the database to initialize your variables
  },
  methods: {
    // Add any Javascript funtions you need to use in your HTML here
    // Ex. If you have a function you want to run when a button is pressed
  }
})

const chatbox = new Vue({
  el: '#chatbox',
  template: `<!-- Add your HTML here -->`,
  data: {
    // Add any local variables you need here
  },
  created() {
    // Any code you want to run the first time your component loads, put it here
    // This code will run ONLY ONCE, when the object is initialized
    // Use this for things like retrieving info from the database to initialize your variables
  },
  methods: {
    // Add any Javascript funtions you need to use in your HTML here
    // Ex. If you have a function you want to run when a button is pressed
  }
})

const voting = new Vue({
  el: '#voting',
  template: `<!-- Add your HTML here -->`,
  data: {
    // Add any local variables you need here
  },
  created() {
    // Any code you want to run the first time your component loads, put it here
    // This code will run ONLY ONCE, when the object is initialized
    // Use this for things like retrieving info from the database to initialize your variables
  },
  methods: {
    // Add any Javascript funtions you need to use in your HTML here
    // Ex. If you have a function you want to run when a button is pressed
  }
})

const memer = new Vue({
  el: '#memer',
  template: `<!-- Add your HTML here -->`,
  data: {
    // Add any local variables you need here
  },
  created() {
    // Any code you want to run the first time your component loads, put it here
    // This code will run ONLY ONCE, when the object is initialized
    // Use this for things like retrieving info from the database to initialize your variables
  },
  methods: {
    // Add any Javascript funtions you need to use in your HTML here
    // Ex. If you have a function you want to run when a button is pressed
  }
})