import express from 'express'
import {auth, platform} from './routes';
import {createWireframe} from './routes/platform';
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const app = express();
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, '/public')));


// create wireframe if doesn't exist
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


app.get('/projects', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'projects.html'));
});

app.get('/projects/:companyName/:projName', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'projectDetailed.html'));
});


app.get('/admin/investors', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'investorList.html'));
});

app.get('/admin/investors/:investorName', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'investorDetailed.html'));
});


app.post('/uploadDocs', (req, res) => {

    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {

        let upload_path = path.join(__dirname, `../docs/${fields.uploadDocsCompany}/${fields.uploadDocsProject}/`);
        // console.log(upload_path);
        if (!fs.existsSync(upload_path)){
            fs.mkdirSync(upload_path, {recursive: true});   //create directories if does not exist
        }
        console.log(fields);
        console.log(files);
        // oldpath : temporary folder to which file is saved to
        let oldpath = files.uploadDocs.path;
        let newpath = upload_path + files.uploadDocs.name;
        // copy the file to a new location
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            // you may respond with another html page
            res.write('<h1 style="text-align: center; width: 100%; margin-top: 45px;">File uploaded successfully!<h1>');
            res.end();
        });
    });

});


app.post('/getDocs', (req, res) => {

});


const appPort = 3000;
app.listen(
    appPort,
    () => console.log(`Listening on port ${appPort}...`),
);
