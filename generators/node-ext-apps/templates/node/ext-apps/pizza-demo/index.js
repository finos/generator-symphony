const symphony = require('symphony-api-client-node')
const express = require('express')
const bodyParser = require('body-parser')
const https = require('https')
const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')
const sqlite = require('sqlite3')

const sqliteDatabase = './pizzaDb'

AWS.config.update({ region: 'us-west-2' })

// Bot Implementation
let menuOptions = [ 'Double Cheese', 'Margherita', 'Pepperoni' ]
const helpML = 'Hey to get the menu, use /menu'
const menuML = '<div class="entity" data-entity-id="pizza-menu"><b><i>Please install A Pizza App to render this entity.</i></b></div>'
const menuData = { 'pizza-menu': { 'type': 'com.symphony.ps.pizzaMenu', 'version': '1.0', 'options': [], 'quoteId': '' } }
const chars = '0123456789abcdefghijklmnopqrstuvwxyz'

const randomString = () => {
  let text = ''
  for (let i = 0; i < 12; i++)
    text += chars.charAt(Math.floor(Math.random() * chars.length))
  return text
}

const botHearsSomething = (event, messages) => {
  messages.forEach((message, index) => {
    let replyML = null
    let replyData = null

    if (message.messageText === '/menu') {
      replyML = menuML
      replyData = JSON.parse(JSON.stringify(menuData))
      replyData['pizza-menu'].options = menuOptions.slice(0)
      replyData['pizza-menu'].quoteId = randomString()
    } else {
      replyML = helpML
      symphony.sendMessage(message.stream.streamId, replyML, replyData, symphony.MESSAGEML_FORMAT)
    }
    console.log('MessageML: ', replyML)
    console.log('Data: ', replyData)
    symphony.sendMessage(message.stream.streamId, replyML, JSON.stringify(replyData), symphony.MESSAGEML_FORMAT)
  })
}

// Bot initialisation
symphony.setDebugMode(false)
symphony.initBot(path.join(__dirname, '/config.json')).then(() => {
  symphony.getDatafeedEventsService(botHearsSomething)
})

// Create HTTPS Web Server
const server = express()
var sslOptions = {
  key: fs.readFileSync('webcerts/localhost-key.pem'),
  cert: fs.readFileSync('webcerts/localhost-cert.pem'),
  passphrase: 'changeit'
}
https.createServer(sslOptions, server).listen(4000)
server.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})
server.use(express.static('web'))
server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())

// Init our Menu items into the SQL database
let db = new sqlite.Database(sqliteDatabase)
db.get('select * from pizza_menu', (err, row) => {
  if (err && row === undefined) {
    db.run('create table pizza_menu (name varchar not null primary key)', () => {
      const insertSql = `insert into pizza_menu VALUES(?)`
      menuOptions.forEach(o => db.run(insertSql, o))
    })
  } else {
    menuOptions = []
    db.each('select * from pizza_menu', (err, row) => {
      if (err) return
      menuOptions.push(row.name)
    })
  }
})

db.get('select * from pizza_order', (err, row) => {
  if (err && row === undefined) {
    db.run('create table pizza_order (id varchar not null primary key, choice varchar, date bigint not null)')
  }
})

db.close()

// Define our Application API Endpoints
server.get('/', function (req, res) {
  res.send('Hello, World')
})

// Pizza App - List menu items
server.get('/menu', function (req, res) {
  res.send(menuOptions)
})

// Pizza App - Add new menu item
server.post('/menu', function (req, res) {
  const newItem = req.body.name
  if (menuOptions.indexOf(newItem) === -1) {
    let db = new sqlite.Database(sqliteDatabase)
    db.run('insert into pizza_menu VALUES(?)', newItem)
    db.close()
    menuOptions.push(newItem)
  }
  res.send(menuOptions)
})

// Pizza App - Order History list
server.get('/orders', function (req, res) {
  let orders = []
  let db = new sqlite.Database(sqliteDatabase)
  db.each('select * from pizza_order', (err, row) => {
    if (err) return
    orders.push({ id: row.id, date: row.date, choice: row.choice })
  })
  db.close(() => res.send(orders))
})

server.get('/order/:orderId', function (req, res) {
  let order = null
  let db = new sqlite.Database(sqliteDatabase)
  db.get(`select * from pizza_order where id = '${req.params.orderId}'`, (err, row) => {
    if (err) return
    order = { id: row.id, date: row.date, choice: row.choice }
  })
  db.close(() => res.send(order))
})

// On menu item click, add new order to our database
server.post('/order', function (req, res) {
  console.log('New Order Received: ', req.body)
  const order = req.body
  let db = new sqlite.Database(sqliteDatabase)

  const insertSql = 'insert into pizza_order(id, date, choice) VALUES(?, ?, ?)'
  const insertData = [order.id, order.date, order.choice]
  db.run(insertSql, insertData)
  db.close(() => res.send(order))
})
