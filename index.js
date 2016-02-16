/*var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	mongoose = require('mongoose');
app.use('/public', express.static(__dirname + '/public'));

var port = process.env.PORT || 3000;
server.listen(port);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});


mongoose.connect('mongodb://localhost/location', function(err){
	if(err){
		console.log(err);
	} else{
		console.log('Connected to mongodb!');
	}
});

var locationSchema = mongoose.Schema({
	name: String,
	mylat: String,
        mylon: String,
	trackedon: {type: Date, default: Date.now}
});

var Location = mongoose.model('Location', locationSchema);

io.sockets.on('connection', function(socket){
	socket.on('mylocation', function(data){
console.log(data);

var query = Location.update({ name: data.name }, {mylat: data.mylat, mylon: data.mylon}, { upsert : true });
query.exec();

});

socket.on('getfriendloc', function(data, callback){
		console.log("fetching "+data+"'s location");
		if(data == ''){
			callback('Error!  Enter your friend name.');
		} else{
	var query = Location.find({"name":data});
	query.exec(function(err, docs){
		if(err) throw err;
   console.log(docs);
		socket.emit('friendloc', docs);
	});

	}
	});

});*/
var express = require('express'),
	app = express(),
	server = require('http').createServer(app);
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

app.use('/public', express.static(__dirname + '/public'));

var port = process.env.PORT || 3000;
server.listen(port);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});


var dbHost = 'mongodb://localhost:27017/imdb';
//mongoose.connect(dbHost);

mongoose.connect('mongodb://localhost:27017/imdb', function(err){
	if(err){
		console.log(err);
	} else{
		console.log('Connected to mongodb!');
	}
});


var searchSchema = mongoose.Schema({
title: String,
summary:String,
rating:String,
img:String,
time:String,
director:String,
born:String
});

var Search = mongoose.model('Search', searchSchema, "searches");
/*
fetchlist=function(key){
var url = "http://www.imdb.com/find?q="+key;
var findlist = [];
  request({
            "uri": url
        }, function(err, resp, body){
		  var $ = cheerio.load(body);
		  
		  var strContent = "";
          $('.findList').find('tr').each(function(index,item){

           if(index>=0)
           {
              var tds = $(item).find('td');
              strContent += $(tds.eq(1)).text().trim() + "," 
			  + tds.eq(0).find('img').attr('src').trim() +","+ $(tds.eq(1)).find('a').attr('href').trim()+"\r\n";
findlist.push({ "name":$(tds.eq(1)).text().trim(), "url":"http://www.imdb.com"+$(tds.eq(1)).find('a').attr('href').trim(),"imgurl":tds.eq(0).find('img').attr('src').trim()});
           }
           });
	//console.log(findlist);
	//console.log(findlist);
      return "hello";
        //console.log(strContent);
		});

}
*/
app.get('/searching', function(req, res){

var url = "http://www.imdb.com/find?q="+req.query.keyword;
var findlist = [];
  request({
            "uri": url
        }, function(err, resp, body){
		  var $ = cheerio.load(body);
		  
		  var strContent = "";
          $('.findList').find('tr').each(function(index,item){

           if(index>=0)
           {
              var tds = $(item).find('td');
              if($(tds.eq(1)).text().trim()!='')
              {
              strContent += $(tds.eq(1)).text() + "," 
			  + tds.eq(0).find('img').attr('src')+","+ $(tds.eq(1)).find('a').attr('href')+"\r\n";
findlist.push({ "name":$(tds.eq(1)).text().trim(), "url":"http://www.imdb.com"+$(tds.eq(1)).find('a').attr('href'),"imgurl":tds.eq(0).find('img').attr('src')});
           }
       }
           });
	//console.log(findlist);

 res.send(findlist);
        //console.log(strContent);
		});

});

app.get('/getcontent', function(req, res){
	var url = req.query.link;
  var desclist = [];
  request({
            "uri": url
        }, function(err, resp, body){
		  var $ = cheerio.load(body);
  var name=$('h1').text().trim();
  var summary=$('.summary_text').text().trim();
  var born='';
  if(summary=='')
  {
  	summary=$('.name-trivia-bio-text').text().trim();
    born=$('#name-born-info').text().trim();
  }

  var rating=$('.ratingValue').text().trim();
  var img=$('.poster').find('img').attr('src');
  if(img==undefined){
  	img=$('#img_primary').find('img').attr('src');
  }
  var time=$('.title_wrapper').find('time').text().trim();
  var director=$('.credit_summary_item').find('.itemprop').first().text().trim();
  desclist={name:name,summary:summary,rating:rating,img:img,time:time,director:director,born:born};
  //console.log(desclist);
  
var s = new Search({title:req.query.title,summary:summary,rating:rating,img:img,time:time,director:director,born:born});
s.save(function(err){
	if ( err ) throw err;
  		console.log("Inserted Successfully");
  });

res.send(desclist);

   });
	
});