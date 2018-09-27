import Headset from './src/Headset/Headset.ts';
import express from 'express';

let headset = new Headset();
let app = express();

app.get('/connect', (req, res) => {
    headset.connect();
    res.send('Connecting...');
});

app.get('/disconnect', (req, res) => {
    headset.disconnect();
    res.send('disconnecting...');
});

app.listen(3000);

headset.listener.on('disconnected', (headestId) => {
    console.log('disconnected:', headestId);
});

headset.listener.on('connected', (headestId) => {
    console.log('connected:', headestId); 
});


headset.listener.on('scanning', (value) => {
    console.log('scanning...');
});

headset.listener.on('notFound', (value) => {
    console.log('not found:', value);
});

headset.listener.on('poorSignal', (level) => {
    console.log('poor signal:', level);
});

headset.listener.on('meditation', (level) => {
    console.log('meditation:', level);
})

headset.listener.on('attention', (level) => {
    console.log('attention:', level);
})

headset.listener.on('blink', (level) => {
    console.log('blink:', level);
})

headset.listener.on('battery', (level) => {
    console.log('battery:', level);
})

headset.listener.on('asicEegPower', (waves) => {
    console.log('waves:', waves);
})

headset.listener.on('rawValue', (value) => {
    console.log('raw:', value);
})

headset.connect();