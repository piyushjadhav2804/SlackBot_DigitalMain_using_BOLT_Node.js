# SlackBot_DigitalMain_using_BOLT_Node.js

This is a Slack bot developed using Node.js and @slack/bolt that can respond to commands and provide information based on user input. The bot supports custom slash commands and interactive messages with buttons to enhance the user experience.

![chatbot1](https://github.com/piyushjadhav2804/SlackBot_DigitalMain_using_BOLT_Node.js/assets/71430828/85d22136-368e-4b18-8ee1-cc190b0f7838)

![chatbot2](https://github.com/piyushjadhav2804/SlackBot_DigitalMain_using_BOLT_Node.js/assets/71430828/27549542-9289-4fb3-bb48-0da7d6b8e57a)

## Requirements

- Node.js (>=10.0.0)
- npm (Node Package Manager)
- Slack API credentials:
  - SLACK_BOT_TOKEN
  - SLACK_SIGNING_SECRET
  - APP_TOKEN
- OpenWeather API key (for weather feature)

# Steps To install the bot in a workspace

1. Clone this repository: https://github.com/piyushjadhav2804/SlackBot_DigitalMain_using_BOLT_Node.js
   
2. Install the dependencies
   npm install

3. Set up the environment variables.
   Create a `.env` file in the root directory of your project and add the following content:

   SLACK_BOT_TOKEN=your_slack_bot_token
   SLACK_SIGNING_SECRET=your_slack_signing_secret
   APP_TOKEN=your_app_token
   OPEN_WEATHER_API=your_openweather_api_key



The bot will start and listen on the specified port (default is 3000). Make sure your bot is invited to your Slack workspace and has the necessary permissions to respond to messages.

## Available Commands

You can either write command or a complete sentence
- hi | hello | hey: greets you according to the current time
- bye : wishes you goodbye according to current time
- time: fetches the current time in IST
- help: shows list of commands and also gives you interactive buttons
- weather: fetches weather of the city you entered
  

## Credits

This project was developed by Piyush Jadhav using the @slack/bolt library for Slack bot development.

## License

This project is licensed under the [MIT License](LICENSE).
