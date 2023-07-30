const { App } = require("@slack/bolt");
const { default: axios } = require("axios");
const dotenv = require("dotenv");
const { env } = require("process");
dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
});

app.start(process.env.PORT || 3000).then(() => {
  console.log("Bolt App started!!");
});

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

const botCommands = {
  hello : "Say hello to the bot",
  bye: "Say goodbye to the bot",
  time: "Get current time in IST",
  help: "details of all commands",
  weather: "Get weather details",
};

async function time(sentence, say) {

    const { hour, minutes } = convertUTCToIST();

    if (hour < 12) {     
        await say(`Time is ${hour}:${minutes} AM`);
    } else {
        await say(`Time is ${hour}:${minutes} PM`);
    }
}

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

async function goodbye(message, say) { 

  const { hour } = convertUTCToIST();

  if (hour < 17) {
    await say(`Bye <@${message.user}>, Have a good day!!`);
  } else {
    await say(`Bye <@${message.user}>, Good Night!!`);
  }
}

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

let isCityAsked = null;
let previousMessage = null;

async function weather(message, say) {
  
    let sentence = message.text.toLowerCase();

  if (sentence.includes("weather")) {
    await say("Please enter the name of your city for weather information.");

    console.log('bot asked for city');

    isCityAsked = true;
    previousMessage = sentence;
  }
};

app.message(async({message, say}) => {
    
    if(isCityAsked == true) {
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

    else {

        const greetArray = ["hi", "hello", "hey"];
        const timeArray = ["time"];
        const weatherArray = ["weather"];
        const goodbyeArray = ["bye", "end", "stop"];
        const helpArray = ["help"];

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
        } else {
          await say(
            `You typed: ${sentence}, but this is not a valid command \nPlease check all commands using "help" command`
          );
        }
    }
});



// app.message(async ({message, say}) => {

    
// });

