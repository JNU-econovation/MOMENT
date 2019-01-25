/*jslint devel: true */
/* eslint-disable no-console */
/*eslint no-undef: "error"*/
/*eslint-env node*/


var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

//에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

//mongodb 모듈 사용
var MongoClient = require('mongodb').MongoClient;

var database;

//connect함수로 데이터베이스 연결 확인 err/db
function connectDB() {
    var databaseUrl = 'mongodb://localhost:27017';
    MongoClient.connect(databaseUrl,{useNewUrlParser: true},  function(err, client){
        if (err){
            console.log('데이터 베이스 연결 시 에러 발생함');
            return;
        }
        console.log('데이터 베이스에 연결됨 : ' + databaseUrl);
        database = client.db("local");
    });
}

//익스프레스 객체 생성
var app = express();

//기본 속성 express 포트 설정
app.set('port', process.env.PORT || 3000);

app.use('/public', static(path.join(__dirname, 'public')));

/* user Path 이용하여 */
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(expressSession({
    secret : 'my key',
    resave : true,
    saveUnitialized : true
}));

var router = express.Router();

//사용자 인증 함수, 브라우저 요청 정보를 파라미터로 받아 처리하는 라우팅 함수가 필요
//바깥의 database라는 객체 존재, post 함수로 요청객체(req) 응답객체(res)
router.route('/process/login').post(function(req,res){
    console.log('/process/login 라우팅 함수 호출됨');
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);

    if (database){
        authUser(database, paramId, paramPassword, function(err, docs){
            if(err){
                console.log('에러발생');
                res.writeHead(200, {"Content-Type": "text/html;charset=utf8"});
                res.write('<h1>에러 발생</h1>');
                res.end();
            }
            if (docs){
                console.dir(docs);
                
                res.writeHead(200, {"Content-Type": "text/html;charset=utf8"});
                res.write('<h1>사용자 로그인 성공</h1>');
                res.write('<div><p>사용자 : ' + docs[0].name + '</p></div>')
                res.write('<br><br><a href="/public/login.html">다시 로그인 하기 </a>')
                res.end();
            }else{
                console.log('에러 발생');
                res.writeHead(200, {"Content-Type": "text/html;charset=utf8"});
                res.write('<h1>사용자 데이터 조회 안됨</h1>');
                res.end();
            }
        });
    }else{
                console.log('에러 발생');
                res.writeHead(200, {"Content-Type": "text/html;charset=utf8"});
                res.write('<h1>데이터베이스 연결 안됨</h1>');
                res.end();
    }
});
app.use('/', router);

//별도의 함수를 하나 정의, 데이터베이스를 다루도록 err, 일치, 불일치
//별도의 함수를 하나 정의, 데이터베이스를 다루도록 err, 일치, 불일치
var authUser = function(db, id, password, callback){
    console.log('authUser 호출됨.');
    
    var users = db.collection('users');
    
    users.find({'id':id, 'password':password}).toArray(function(err, docs){
        if (err){
            callback(err, null);
            return;
        }
        if(docs.length > 0){
            console.log('일치하는 사용자를 찾음');
            callback(null, docs);
        } else {
            console.log('일치하는 사용자를 찾지 못함');
            callback(null, null);
        }
    });
};



//404 error page 처리
var errorHandler = expressErrorHandler({
    static: {
        '404' : './public/404.html'
    }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );

//서버 생성
http.createServer(app).listen(app.get('port'), function()
{
    console.log('익스프레스로 웹 서버를 실행함 : ' + app.get('port'));
    connectDB();
});