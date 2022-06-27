const express = require('express')
const path = require('path')

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const bodyParser = require("body-parser")

const crypto = require('crypto')

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
    res.render("chat.ejs", {Room: req.params.id})
})

app.get('/rooms', (req,res) => {
    res.render("index.ejs", {Rooms: rooms})
})

app.post('/createroom', (req,res) => {
    let roomid = crypto.randomBytes(16).toString("hex")
    rooms.push({id:roomid, numClients: 0})
    room = roomid

    res.redirect(`/room/${roomid}`)
})

app.get('/', (req,res) => {
    res.render('index.ejs', {Rooms: rooms})
})

io.on('connection', socket => {
    console.log(`Socket conectado: ${socket.id}`)

    socket.join(room)

    
    

    socket.on('sendMessage', data => {
        socket.to(data.room).emit('receiveMessage', data)
    })

    socket.on('disconnect', (reason) => {
         console.log(`Cliente ${socket} desconectou`)
    })
})

server.listen(PORT , () => {
    console.log(`Server aberto na porta ${PORT}`)
})