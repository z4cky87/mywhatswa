//const { Client } = require('whatsapp-web.js');
const { Client, Location, List, Buttons, LocalAuth } = require('whatsapp-web.js');
require('dotenv').config();
const express = require('express');
const socketIO = require('socket.io');
//const qrcode = require ('qrcode-terminal');
const qrcode = require ('qrcode');
const fs = require ('fs');
const http = require('http');
const PORT = process.env.PORT;
//const client = new Client();



const app = express();

const server = http.createServer(app);
const io = socketIO(server);

//ngubah jadi postman
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//const SESSION_FILE_PATH = './whatsapp-session.json';
// let sessionCfg;
// if (fs.existsSync(SESSION_FILE_PATH)){
//     sessionCfg= require(SESSION_FILE_PATH);
// }

// const client = new Client({
//     authStrategy: new LocalAuth(),
//     puppeteer: { headless: true },session:sessionCfg
// });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

app.get('/',(req,res)=>{
    // res.status(200).json({
    //     status:true,
    //     message : 'Not just hello world! '
    // });
    res.sendFile('index.html',{root:__dirname});
});

// client.on('qr', (qr) => {
//     // Generate and scan this code with your phone
//     console.log('QR RECEIVED', qr);
//     qrcode.generate(qr);
// });

// client.on('authenticated', (session)=>{
//     console.log('AUTHENTICATED',session);
//     sessionCfg=session;
//     fs.writeFile(SESSION_FILE_PATH,JSON.stringify(session),function(err){
//         if(err){
//             console.error(err);
//         }
//     });
// });


// client.on('ready', () => {
//     console.log('Client is ready!');
// });

client.on('message', msg => {
    if (msg.body == '!ping') {
        msg.reply('pong');
    }else if(msg.body =='good morning'){
        msg.reply('selamat pagi')
    }

    
});

client.initialize();

// app.listen(8000, function(){
//     console.log('App running on*:'+ 8000);
// });

//Socket IO
io.on('connection',function(socket){
    socket.emit('message','Connecting....');

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log('QR RECEIVED', qr);
            qrcode.toDataURL(qr,(err,url)=>{
            socket.emit('qr',url);
            socket.emit('message','QR Code received, scan please!');
        });        
    });

    client.on('ready', () => {
        socket.emit('ready','WhatsApp is Ready!');
        socket.emit('message','WhatsApp is Ready!');
    });

    client.on('authenticated', () => {
        socket.emit('authenticated','WhatsApp is authenticated!');
        socket.emit('message','WhatsApp is authenticated!');
        console.log('AUTHENTICATED');
    });
    
    client.on('auth_failure', msg => {
        // Fired if session restore was unsuccessful
        console.error('AUTHENTICATION FAILURE', msg);
    });
    //qrcode.generate(qr);
});


//API POST API OK
app.post('/send-message',(req,res)=>{
    const number = req.body.number;
    const message = req.body.message;

    client.sendMessage(number,message).then(response=>{
        res.status(200).json({
            status:true,
            response:response
        });
    }).catch(err=>{
        res.status(500).json({
            status:false,
            response:err
        });
    })
    ;
});


// server.listen(8000, function(){
//     console.log('App running on*:'+ 8000);
// });

server.listen(PORT,function(){
    console.log(`Server APP API Whatsapp Running ${PORT}`);
})