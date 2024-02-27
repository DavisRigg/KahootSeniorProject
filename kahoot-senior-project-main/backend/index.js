const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const configuration = require('../src/configuration');

const app = express();
const server = createServer(app);

let gameRooms = [];

let hosts = [];

let scoremulti = 1;

currentanswer = null;

class leaderboard {
  constructor(name, score, lives) {
    this.name = name;
    this.score = score;
    this.lives = lives;
  }
}


const io = new Server(server, {
    cors: {
      origin: `http://${configuration.ip_address}:3000`
    },
},    {
  'pingInterval': 2000,
  'pingTimeout' : 5000
});



io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('hostGame', () => {
      const gamePin = Math.floor(Math.random() * 10000);
      gameRooms.push(gamePin);
      hosts.push(socket.id);
      socket.join(`${gamePin}`);
      socket.data.host = true;
      socket.data.room = gamePin.toString();
      socket.emit('newGamePin', gamePin);
    });

    socket.on('joinGame', (pin, username) => {
      if(gameRooms.includes(pin)){
        socket.join(`${pin}`);
        socket.emit('joinedGame', (pin));
        socket.data.username = username;
        socket.data.room = pin.toString();
        socket.data.score = 0;
        socket.data.lives = 3;
        console.log(pin);
        console.log(username);
        io.to(`${pin}`).emit('newUser', username);
      }else{
        socket.emit('invalidCode');
      }
    });

    socket.on('gameStarted', (answer) => {
      let roomName = ''; //Object.keys(socket.rooms)[1];
      currentanswer = answer;
      console.log(socket.data.room);
      io.to(socket.data.room).emit('gameStarted');
    })

    socket.on('answered', async (answer) => {
      socket.data.answered = true;
      if (answer == currentanswer)
      {
        socket.data.score += 100/scoremulti;
        scoremulti = scoremulti*1.25;
      } 
      if (answer != currentanswer)
      {
        socket.data.lives -= 1;
      }
      const players = await io.in(socket.data.room).fetchSockets();
      //console.log(players);
      const lb = [];
      players.map((player) => {
        lb.push(new leaderboard(player.data.username, player.data.score, player.data.lives))
      });
      console.log(lb);
      lb.sort((a, b) => {
        return b.score - a.score;
      });
      io.to(socket.data.room).emit('updateLeaderboard', lb);
      let answeredCount = 0;
      players.map((player) => {
        if(player.data.answered === true){
          console.log('answered')
          answeredCount = answeredCount + 1;
        }
      });
      if(answeredCount === players.length-1){
        console.log('questionIsOver');
        io.to(socket.data.room).emit('allAnswersAreIn');
        players.map((player) => {
          player.data.answered = false;
        })
        scoremulti = 1;
      }
    });

    socket.on('timeRanOut', (answer) => {
      io.to(socket.data.room).emit('questionOver');
    })


    socket.on('questionOver', (answer) => {
      io.to(socket.data.room).emit('questionOver', answer);
    })

    socket.on('nextQuestion', (answer) => {
      currentanswer = answer;
      io.to(socket.data.room).emit('nextQuestion');
    })

    socket.on('gameOver', () => {
      io.to(socket.data.room).emit('gameOver');
    })

    socket.on('disconnect', () => {
      console.log('player disconnected with id: ' + socket.id);
      console.log(socket.data);
      if(socket.data.host === true){
        const index = hosts.indexOf(socket.id);
        io.to(`${gameRooms[index]}`).emit('hostDisconnected');
      }else{
        console.log('sending message');
        io.to(socket.data.room).emit('playerDisconnected', socket.data.username);
      }
    })
});

io.listen(4000, () => {
  console.log('server running at http://localhost:4000');
});