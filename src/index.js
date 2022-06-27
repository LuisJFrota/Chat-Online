const express = require('express')
const path = require('path')

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const bodyParser = require("body-parser")

const crypto = require('crypto')
const e = require('express')

const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, 'view')))
app.set('views', path.join(__dirname, 'view'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.get('/chat', (req,res) => {
    res.render('chat.ejs')
})

let rooms = []
let room

app.get('/room/:id', (req,res) => {
    if (checkRooms(req.params.id))
    {
        res.render("chat.ejs", {Room: req.params.id})
    }
    else
    {
        res.send("Sala não existe")
    }
})

app.get('/rooms', (req,res) => {
    res.render("index.ejs", {Rooms: rooms})
})

app.post('/createroom', (req,res) => {
    let roomid = crypto.randomBytes(16).toString("hex")
    rooms.push({id:roomid,clients:[], numClients:0})
    room = roomid

    res.redirect(`/room/${roomid}`)
})

app.get('/', (req,res) => {
    res.render('index.ejs', {Rooms: rooms})
})

io.on('connection', socket => {
    console.log(`Socket conectado: ${socket.id}`)

    socket.join(room)
    addRoomClient(room, socket.id)

    socket.on('sendMessage', data => {
        console.log(data.room)
        socket.broadcast.to(data.room).emit('receiveMessage', data)
    })

    socket.on('disconnect', (reason) => {
        removeRoomClient(socket.id)
        console.log(`Cliente ${socket.id} desconectou`)
    })
})

function checkRooms(id)
{
    let roomExist = false

    for(r of rooms)
    {
        if(r.id == id) roomExist = true
    }

    return roomExist
}

function addRoomClient(room, client)
{
    for (r of rooms)
    {
        if(r.id == room)
        {      
            r.numClients += 1
            r.clients.push(client)  
            console.log("Cliente entrou: "+r)     
        }
    }
}

function removeRoomClient(client)
{
    let count = 0
    for (r of rooms)
    {
        for(i in r.clients)
        {
            roomsclients = r.clients
            if(roomsclients[i] == client)
            {     
                r.clients.splice(i,1)
                console.log("Pessoas na sala: "+r.clients.length)
                if(r.clients.length <= 0)
                {
                    rooms.splice(count,1)
                    console.log("deletou sala")
                }
            }       
        }
        count++
    }
}

server.listen(PORT , () => {
    console.log(`Server aberto na porta ${PORT}`)
})