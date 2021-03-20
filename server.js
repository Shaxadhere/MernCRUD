const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient

const app = express();

// Connection String
const connectionString = "mongodb+srv://admin:dGakD2MeWQprWN02@cluster0.stgq9.mongodb.net/tinderdb?retryWrites=true&w=majority"

MongoClient.connect(connectionString, {useUnifiedTopology: true}).then(client => {
    console.log("Connected to database");
    const db = client.db('Programs')
    const programCollections = db.collection('programs')

    // ========================
    // Middlewares
    // ========================
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
    // app.use(express.static('public'))

    // ========================
    // Routes
    // ========================

    app.get('/', (req, res) => {
        db.collection('programs').find().toArray().then(programs => {
            res.status(200).send("Programs API");
        })
    })

    app.get('/programs', (req, res) => {
        db.collection('programs').find().toArray().then(programs => {
            res.status(200).send(programs);
        })
    })

    app.post('/programs', (req, res) => {
        programCollections.insertOne(req.body).then(result => {
            res.status(201).send(result)
        }).catch(error => console.error(error))
    })

    app.put('/programs', (req, res) => {
        programCollections.findOneAndUpdate({
            _id: req.body.id
        }, {
            $set: {
                name: req.body.name,
                type: req.body.type
            }
        }, {upsert: true})
        .then(result => res.json('Success'))
        .catch(error => console.error(error))
    })

    app.delete('/programs', (req, res) => {
        programCollections.deleteOne(
            { _id: req.body.id }
        )
        .then(result => {
            if(result.deletedCount === 0){
                return res.json("Nothing to delete with this id")
            }
            res.json("Deleted");
        })
        .catch(error => console.error(error))
    })

    // ========================
    // Listen
    // ========================
    const isProduction = process.env.NODE_ENV === 'production'
    const port = isProduction ? 7500 : 3000
    app.listen(port, function () {
        console.log(`listening on port ${port}`)
    })
}).catch(error => console.error(error))
