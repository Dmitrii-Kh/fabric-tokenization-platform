import express from 'express'
import {auth, platform} from './routes';
import {createWireframe} from './routes/platform';
const path = require('path');
const app = express();
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, '/public')));


//create wireframe if doesn't exist
// createWireframe()
//     // .then(r => r.json())
//     .then(r => {
//     console.log(r.message)
// });

app.use(express.json());
app.use('/api/v1/auth/', auth);
app.use('/api/v1/platform/', platform);

app.get('/signup', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'signUp.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'signIn.html'));
});

app.get('/validators/:name', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'home.html'));
});

app.get('/investors/:name', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'home.html'));
});

app.get('/companies/:name', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'home.html'));
});

const appPort = 3000;
app.listen(
    appPort,
    () => console.log(`Listening on port ${appPort}...`),
);
