# Franklin Chat UI
The Franklin Chat UI is a React app that connects to the Franklin Chat Service and allows users to chat with the Franklin team.

## Using the app
- Open the app in a browser by going to https://aws--franklin-chat-ui--adobe.hlx.page/index.html
- Enter your business email address and click on the "Login" button
- Open the email you received and click on the link
- Go back to the app and start chatting

## Development

To build and deploy the app, you need to create a `.env` file in the root directory with the following properties:
```
REACT_APP_SERVICE_ENDPOINT=ws://localhost:8081
REACT_APP_MAGIC_LINK_API_KEY=...
PORT=8080
```

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
