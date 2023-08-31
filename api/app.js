var createError = require('http-errors');
var express = require('express');
var axios = require('axios');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var session = require('express-session');


var app = express();

// TODO: change origin to env variable for deployment
app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
  }));

var http = require('http').Server(app);
var io = require('socket.io')(http, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

/*
TODO: once this is all said and done, the draft objects are going to be stored server-side.
Theres a bunch of storage options out there to consider (various aws solns, mongodb, other)
and im not sure which one is best right now, so I think it might make sense to use a local storage
solution for the time being? IDK i remember that more complicated than it was worth during cis350,
might make sense to just pick some free storage option like mongo and change later if i need
*/

/*
TODO: socket stuff:
I need to maintain a list of draft states either in-memory on the server or in a db, likely
dynamodb since im already planning on using some AWS tools. For starters, I'm going to use
in-memory storage for this information cuz its simpler. This wont scale well and should change
later.

Socket stuff:
On socket connection, not much should happen, we can maybe return draft_id so user has it?
Before a draft has started, users can select a draft position, and they can swap positions
freely. Selecting a draft position should send a message to server w some sort of user id and
the new draft position. Draft order in draft state will be updated and update will be sent to
others in the draft.

A user can initiate the start of a draft (for now, anyone in the lobby. eventually, maybe only
certain people in draft w admin permissions? or the person who created the draft lobby?)
When draft begins, server checks if the first pick is a human or cpu. If the first pick is a human,
server sends message to that user that they are on the clock and waits for a response from the 
user w/ their selection. If the first pick is a cpu, the server will repeatedly prompt the draft AI
to make a selection and broadcast each selection to all users in the lobby. Server continues
allowing draft AI to make selections until next pick where human is up, where it then waits for
that human to make a pick.

Looking at this, I actually dont think I should use AWS lambda at all. it just adds an extra layer
of complication.
*/

//ROUGHT ATTEMPT AT SOME ROUGHT SOCKET LOGIC (UNIMPLEMENTED)
var draftLobbies = {};
var connections = {};

function initializeDraftLobby(data) {
    //TODO: make this state actually meaningful
    draftLobbies[data.draftId] = {
        users: [data.userId],
        order: Array.from({ length: data.teamCount }, (_, index) => index == data.draftPosition ? data.userId : `CPU`),
        //for now using super stupid impl for available players that just looks at index in client side player list
        available: Array.from({length: 300}, (_, index) => index), //TODO: convert this to some sort of db access prolly
        onClock: 0,
        direction: 1 //forward
    };

    //TODO: create new room here? or return draftid so I can create room elsewhere
    console.log(draftLobbies[data.draftId]);
    return data.draftId;
}

function addDrafterToLobby(data) {
    //TODO: make this actually do something right
    draftLobbies[data.draftId]['users'].push(data.userId);
    draftLobbies[data.draftId]['order'][data.draftPosition] = data.userId;
}

function handleNewLobbyConnection(data) {
    let lobby = data.draftId;
    if (draftLobbies.hasOwnProperty(lobby)) {
        //lobby already exists
        addDrafterToLobby(data)
    } else {
        // new draft lobby
        initializeDraftLobby(data);
    }
}

function retrieveLobby(lobbyid) {
    console.log(`retrieving draft with id ${lobbyid}`);
    console.log(draftLobbies[lobbyid]);
    return draftLobbies[lobbyid];
}

//TODO: have this fxn take advantage of the draft strategies I created and put in the
//ff-mock-draft package
async function cpuselection(lobby) {
    //for now, just pick the first element
    let selectionIndex = lobby.available[0];
    lobby.available.splice(0, 1);
    console.log("selecting player " + selectionIndex);
    return selectionIndex;
}

function incrementOnClock(lobby) {
    if ((lobby.onClock == lobby.order.length - 1 && lobby.direction > 0)
            || (lobby.onClock == 0 && lobby.direction < 0)) {
            
            //swap directions, and the same team stays on the clock
            //direction is -1 when doing backwards in order and 1 otherwise
            lobby.direction *= -1;

    } else {
            // +1 in odd rounds, -1 in even rounds
            lobby.onClock += lobby.direction; 
    }
}

async function draftControlFlow(lobby, draftId, socket) {
    while(lobby.order[lobby.onClock] == 'CPU') {
        let selection = await cpuselection(lobby);
        //TODO: maintain list of socket connections and emit to only those in draft draftid
        //we can do this using rooms for each draft
        io.emit('selection', {
            player: selection,
            draftId: draftId,
        })
        //TODO: update logic for end of round snaking
        // if ((lobby.onClock == lobby.order.length - 1 && lobby.direction > 0)
        //     || (lobby.onClock == 0 && lobby.direction < 0)) {
            
        //     //swap directions, and the same team stays on the clock
        //     //direction is -1 when doing backwards in order and 1 otherwise
        //     lobby.direction *= -1;

        // } else {
        //     // +1 in odd rounds, -1 in even rounds
        //     lobby.onClock += lobby.direction; 
        // }
        incrementOnClock(lobby);
    }

    //current on clock is a user, notify them with a socket message
    let nextDrafter = connections[lobby.order[lobby.onClock]];
    //TODO: this maybe needs to be changed
    // console.log(nextDrafter);
    io.emit('on-the-clock', {user: nextDrafter.handshake.auth.userId});
    // nextDrafter.send({
    //     message: 'on-the-clock'
    // });

}

//pick has come in from a user, reflect this information in the server side draft rep
async function inputUserPick (lobby, playerId) {
    let idx = lobby.available.indexOf(playerId);
    lobby.available.splice(idx, 1);

    incrementOnClock(lobby);

}

io.use((socket, next) => {
    const draftPosition = socket.handshake.auth.draftPosition;
    if (draftPosition != null) {
        console.log(`connected with draft position ${draftPosition}`);
    } else {
        console.log('connected with no draft position');
    }
    next();
})


//TODO: add rooms to represent each draft
//TODO: probably extract all the socket logic into a separate file and import the io object
io.on('connection', (socket, req) => {
    //is lobby id specified in req? (dk if this is right syntax lol)
    //putting this in standalone function to modulate logic if I change from in-memory to db
    console.log("new socket connection came in");
    console.log(socket);
    handleNewLobbyConnection(socket.handshake.auth);

    //add to connections set
    connections[socket.handshake.auth.userId] = socket;


    //someone started the draft (will prolly be async eventually)
    socket.on('start-draft', async (data) => {
        //retrieve lobby info
        let lobby = retrieveLobby(data.draftId);

        //begin draft control flow
        await draftControlFlow(lobby, data.draftId, socket);

    });

    socket.on('pick-made', async (data) => {
        console.log("pick made handler");
        //retrieve lobby info
        let lobby = retrieveLobby(data.draftId);

        //reflect pick on server
        await inputUserPick(lobby, data.playerId);

        //communicate pick to other drafters in this lobby
        //in theory this signal should look no different to a
        //third party drafter than a cpu selection
        //TODO: can you broadcast emit with rooms? probably
        socket.broadcast.emit('selection', {
            player: data.playerId,
            draftId: data.draftId
        })

        //begin draft control flow
        await draftControlFlow(lobby, data.draftId, socket);
    })

    socket.on('test', (data) => {
        console.log('test message came thru');
    })

    socket.on('disconnect', (reason) => {
        //TODO: remove user from draft they were in
        draftLobbies = {}
        connection = {}
        console.log('user disconnected');
    })

})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// TODO: change origin to env variable for deployment
// app.use(
//     cors({
//       origin: "http://localhost:3000",
//       credentials: true,
//   }));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const port = process.env.PORT || 8000;
http.listen(port, function() {
    console.log(`Listening at port ${port}`);
})

module.exports = app;
