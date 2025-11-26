Functions README
- Set DAILY_API_KEY in functions environment:
  via firebase: `firebase functions:config:set daily.api_key="YOUR_DAILY_KEY"`
  or for local testing set env var DAILY_API_KEY
- Deploy: `firebase deploy --only functions`
- Local emulator: `firebase emulators:start --only functions`
