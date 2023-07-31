// Import required dependencies
const { App, Message } = require("@slack/bolt");
const { default: axios } = require("axios");
const dotenv = require("dotenv");
const { env } = require("process");
const fs = require("fs");
dotenv.config();

// Create a new instance of the Slack bot
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
});

// Start the Slack bot and listen on the specified port (default is 3000)
app.start(process.env.PORT || 3000).then(() => {
  console.log("Bolt App started!!");
});

// Function to convert UTC time to IST
function convertUTCToIST() {
  // Get the current date and time in UTC
  const nowUTC = new Date();

  // Extract hours and minutes from the UTC time
  const utcHour = nowUTC.getUTCHours();
  const utcMinutes = nowUTC.getUTCMinutes();

  // Convert to IST by adding 5 hours and 30 minutes
  let istHour = utcHour + 5;
  let istMinutes = utcMinutes + 30;

  // Handle overflow for minutes
  if (istMinutes >= 60) {
    istMinutes -= 60;
    istHour += 1;
  }

  //to convert in 24 hours format
  istHour = istHour % 24;

  return {
    hour: istHour,
    minutes: istMinutes,
  };
}

// Object to store bot commands and their descriptions
const botCommands = {
  hello : "Say hello to the bot",
  bye: "Say goodbye to the bot",
  time: "Get current time in IST",
  help: "details of all commands",
  weather: "Get weather details",
};

// Function to respond to the "time" command
async function time(sentence, say) {

    const { hour, minutes } = convertUTCToIST();

    if (hour < 12) {     
        await say(`Time is ${hour}:${minutes} AM`);
    } else {
        await say(`Time is ${hour}:${minutes} PM`);
    }
}


// Function to respond to greetings based on the time of day
async function greet(message, say) {

  const { hour } = convertUTCToIST();

  if (hour < 12) {
    await say(`Hello <@${message.user}>, good morning!!`);
  } else if (hour >= 12 && hour <= 16) {
    await say(`Hello <@${message.user}>, good afternoon!!`);
  } else {
    await say(`Hello <@${message.user}>, good evening!!`);
  }
};

// Function to say goodbye based on the time of day
async function goodbye(message, say) { 

  const { hour } = convertUTCToIST();

  if (hour < 17) {
    await say(`Bye <@${message.user}>, Have a good day!!`);
  } else {
    await say(`Bye <@${message.user}>, Good Night!!`);
  }
}

// Function to display the list of available commands
async function help(message, say) {

    const sentence = message.text.toLowerCase();

    if(sentence.includes('help')) {
        let commandsList = "List of available commands:\n\n";

        Object.keys(botCommands).forEach((command) => {
          commandsList += `-${command}: ${botCommands[command]}\n`;
        });

        await say(commandsList);
    }
};

// Variables to track the weather command flow
let isCityAsked = null;
let previousMessage = null;

// Function to handle the "weather" command
async function weather(message, say) {
  
    let sentence = message.text.toLowerCase();

  if (sentence.includes("weather")) {
    await say("Please enter the name of your city for weather information.");

    console.log('bot asked for city');

    isCityAsked = true;
    previousMessage = sentence;
  }
};

// In your bot.js file or a separate module
async function processSlashCommand(text, userId) {
  // Check the command text to determine the appropriate response
  switch (text.trim()) {
    case "help":
      return 'List of available commands:\n- hello\n- help\n- time';
    case "hello":
      return `Hello there, <@${userId}>!`;
    case "time":
      const currentTime = new Date().toLocaleString();
      return `The current date and time is: ${currentTime}`;
    default:
      return 'Invalid command. Use "/mybot help" to see the available commands.';
  }
}

// Function to get a random joke from the JokeAPI
async function getRandomJoke(message, say) {
  try {
    const response = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single');
    const joke = response.data.joke;
    say(joke);
  } catch (error) {
    console.error('Error fetching joke:', error.message);
    return 'Oops! Something went wrong while fetching a joke. Please try again later.';
  }
}

// Event listener 
app.message(async({message, say}) => {

    // Event listener for all messages
  if (isCityAsked == true) {
    const city = message.text;
    const WEATHER_API = process.env.OPEN_WEATHER_API;

    try {
      let response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API}&units=metric`
      );

      let weatherData = response.data;
      let temperature = weatherData.main.temp;
      let description = weatherData.weather[0].description;

      await say(
        `Today's weather in ${city}: \nTemperature: ${temperature}°C \nDescription: ${description}`
      );

      isCityAsked = false;
    } catch (err) {
      await say(`Error while finding weather for ${city}`);
    }
  }

  // Event listener for all messages
  else {
    const greetArray = ["hi", "hello", "hey"];
    const timeArray = ["time"];
    const weatherArray = ["weather"];
    const goodbyeArray = ["bye", "end", "stop"];
    const helpArray = ["help"];
    const jokeArray = ["joke"];

    let sentence = message.text.toLowerCase();

    // if(timeArray.some((command) => sentence.includes(command))) {
    //     time(message, say);
    // }

    if (
      timeArray.some((command) =>
        new RegExp(`\\b${command}\\b`, "i").test(sentence)
      )
    ) {
      time(message, say);
    } else if (
      greetArray.some((command) =>
        new RegExp(`\\b${command}\\b`, "i").test(sentence)
      )
    ) {
      greet(message, say);
    } else if (
      goodbyeArray.some((command) =>
        new RegExp(`\\b${command}\\b`, "i").test(sentence)
      )
    ) {
      goodbye(message, say);
    } else if (
      helpArray.some((command) =>
        new RegExp(`\\b${command}\\b`, "i").test(sentence)
      )
    ) {
      help(message, say);
    } else if (
      weatherArray.some((command) =>
        new RegExp(`\\b${command}\\b`, "i").test(sentence)
      )
    ) {
      weather(message, say);
    } else if (
      jokeArray.some((command) =>
        new RegExp(`\\b${command}\\b`, "i").test(sentence)
      )
    ) {
      getRandomJoke(message, say);
    } else {
      await say(
        `You typed: ${sentence}, but this is not a valid command \nPlease check all commands using "help" command`
      );
    }
  }
});

// Event listener for "help" command with interactive buttons
app.message("help", async ({ message, say }) => {
  // Use the "say" method to send messages back to Slack
  const helpMessage = {
    text: "List of available commands:",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*List of available commands:*",
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            action_id: "hello_button",
            text: {
              type: "plain_text",
              text: "Hello",
            },
          },
          {
            type: "button",
            action_id: "time_button",
            text: {
              type: "plain_text",
              text: "Time",
            },
          },
          // Add more buttons for other commands, if applicable
        ],
      },
    ],
  };

  await say(helpMessage);
});

// Event listeners for button actions
app.action("hello_button", async ({ body, ack, say }) => {
  await ack();

  await say("Hello there!");
});

app.action("time_button", async ({ body, ack, say }) => {
  // Acknowledge the button action
  await ack();

  // Get the current date and time
  const currentTime = new Date().toLocaleString();

  // Respond to the button action with the current time
  await say(`The current date and time is: ${currentTime}`);
});

// Event listener for custom slash commands
app.command("/mybot", async ({ command, ack, say }) => {

  try {
    // Extract the command text from the request
    const { text, user_id } = command;

    // Process the command text and user ID, and generate the bot's response
    const botResponse = await processSlashCommand(text, user_id);

    // Acknowledge the command request
    await ack();

    // Send the bot's response
    await say(botResponse);
  } catch (error) {
    console.error("Error handling custom slash command:", error);
  }
});



