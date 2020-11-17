'use strict';
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);

app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use('/public', express.static('./public'));
// app.use('/public', express.static('./public'));

app.get('/',handelHomePage);
app.post('/facts',handelFavFacts);
app.get('/facts',handelGettingFavFacts);
app.get('/details/:id',handelDetails);
app.put('/details/:id',handelUpdatingFact);
app.delete('/details/:id',handelDeletingFact);

function handelDeletingFact(req,res){
    let sql = 'DELETE FROM fact WHERE id=$1;';
    let values = [req.params.id];
    client.query(sql,values)
    .then(()=>{
        res.redirect('/facts');
    })
}

function handelUpdatingFact(req,res){
    let sql = 'UPDATE fact SET type=$1, text=$2 WHERE id=$3;';
    let values = [req.body.type, req.body.text, req.params.id];
    client.query(sql,values)
    .then(()=>{
        res.redirect('/facts');
    })
}


function handelDetails(req,res){
    let sql = 'SELECT * FROM fact WHERE id=$1;';
    let value = [req.params.id];
    client.query(sql,value)
    .then(data=>{
        
        res.render('details',{result:data.rows[0]})
    })
}

function handelGettingFavFacts(req,res){
    let sql = 'SELECT * FROM fact;';
    client.query(sql)
    .then(data=>{
        res.render('fav_facts',{result:data.rows});
    })

}

function handelFavFacts(req,res){
    let sql = 'INSERT INTO fact (type, text) VALUES ($1, $2);';
    let values = [req.body.type,req.body.text];
    client.query(sql,values)
    .then(data=>{
        res.redirect('/facts');
    })
}

function Fact(data){
    this.type = data.type;
    this.text = data.text;
}

function handelHomePage(req,res){
    let url = 'https://cat-fact.herokuapp.com/facts';
    superagent.get(url)
    .then(data=>{
       let values = data.body.all.map(value=>{
           return new Fact(value);
       })
       
       res.render('home',{result:values});
    }).catch(err=>{
        res.send('Sorry there is an error');
    })
};


client.connect().then(()=>{
    app.listen(PORT,()=>{
        console.log('I am listening on PORT '+ PORT);
    })
    
}).catch(err=>{
    console.log(err);
});