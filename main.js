
/**
 * 데이터베이스 사용하기
 * 
 * 데이터베이스 열고 로그인 화면에 붙이기
 * 
 */

//===== 모듈 불러들이기 =====//
var express = require('express')
  , http = require('http')
  , path = require('path');
var cors = require('cors')
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler');
var url = require('url');

var fs = require('fs');

//===== MySQL 데이터베이스를 사용할 수 있도록 하는 mysql 모듈 불러오기 =====//
var mysql = require('mysql');

//===== MySQL 데이터베이스 연결 설정 =====//
var pool      =    mysql.createPool({
    connectionLimit : 10, 
    host     : 'localhost',
    user     : 'root',
    password : '1lost5egg!',
    database : 'moment',
    debug    :  false
});



//===== Express 서버 객체 만들기 =====//
var app = express();


//===== 서버 변수 설정 및 static으로 public 폴더 설정  =====//
app.set('port', process.env.PORT || 3000);

//app.use(express.static(__dirname));
app.use(express.static('views'));
//app.use(express.static('Login'));
// app.use('/front', express.static(path.join(__dirname, 'front')));
app.use('/Login', express.static(path.join(__dirname,'Login')));
// app.use('/map', express.static(path.join(__dirname,'front/map')));
// app.use('/sidebar', express.static(path.join(__dirname,'front/sidebar')));
// app.use('/main', express.static(path.join(__dirname,'front/main')));
//===== body-parser, cookie-parser, express-session 사용 설정 =====//
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));
app.use(cors());
//===== 라우터 미들웨어 사용 =====//
app.get('/', function(req, res) {
	let user = req.session.user;
	var notice;
	console.log("메인 페이지 시랳ㅇ");
		showline( function(err, result) {
			console.log(result)
			notice = result;
			if(req.url == '/'){
				res.render('front', {"user" : user,"notice" : notice});	
			}
			if(req.url == '/favicon.ico'){
				return response.writeHead(404);
			}
		});
	
	
	console.log(notice)
	//req.session.user.id"";
	console.log(user);
	
});

app.post('/process/front',function(req,res){
	res.redirect('/');
});

app.post('/process/delete',function(req,res){
	console.log('글삭제');

});

var deldata = function(id,email,callback){
	console.log('글 삭제 모듈안에 있는 deldata 호춯')

	pool.getConnection(function(err,conn){
		if(err){
			if(conn){
				conn.release();
			}
			callback(err,null);
			return;
		}
		console.log('데이터베이스 연결 스레드 아이디' + conn.threadId);
		var exex = conn.query("delete from noticeboard where id =? , email = ?",[id,email] ,function(err,rows){
			conn.release();
			console.log('실행된 SQL :',exec.sql);
			if(err){
				callback(err,null);
				return;
			}
			if(rows.length > 0){
				console.log(rows);
				callback(null, rows);
			}else{
				console.log('글 찾지못함');
				callback(null,null)
			}
			
		});
		conn.on('error', function(err) {      
            console.log('데이터베이스 연결 시 에러 발생함.');
            console.dir(err);
            
            callback(err, null);
     	 });
	});

}



var showline = function(callback){
	console.log('post 모듈 안에 있는 showline 호출');

	pool.getConnection(function(err,conn){
		if(err){
			if(conn){
				conn.release();
			}
				callback(err,null);
				return;
		}
		console.log('데이어베이스 연결 스레드 아이디 : '+ conn.threadId);
		var exec = conn.query("select * from noticeboard",function(err,rows){
			conn.release();
			console.log('실행된 SQL : ' + exec.sql);

			if(err){
				callback(err,null);
				return;
			}
			if(rows.length > 0){
				console.log(rows);
				callback(null, rows);
			}else{
				console.log('글 찾지못함');
				callback(null,null)
			}
		});
		conn.on('error', function(err) {      
            console.log('데이터베이스 연결 시 에러 발생함.');
            console.dir(err);
            
            callback(err, null);
     	 });
	});
}

//글데이터 데이터전달함수
app.post('/ajax_send_email', function(req, res){
	console.log(req.body);
	console.log(req.body.id);
	if(pool){
		search(req.body.id, function(err,result){
			console
			if (err) {
				res.redirect('/');
			}
			
			if (result) {
				console.dir(result[0]);
				var responseData = {'result' : 'ok', 'title' : result[0].title, 'contents' : result[0].contents }
				res.json(responseData);
				
			} else {
        		res.redirect('/')
				res.end();
			}
		});
	} else {
		res.redirect('/')
		res.end();
		}
	// 서버에서는 JSON.stringify 필요없음
});

var search = function(id, callback){
	console.log('search 호출됨.');
	pool.getConnection(function(err, conn) {
        if (err) {
        	conn.release();  // 반드시 해제해야 합니다.
          return;
        }   
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
    	// 데이터를 객체로 만듭니다.
    	
        // SQL 문을 실행합니다.
        var exec = conn.query('select title, id,contents from noticeboard where id ='+id, function(err, result) {
        	conn.release();  // 반드시 해제해야 합니다.
        	console.log('실행 대상 SQL : ' + exec.sql);
        	
        	if (err) {
        		console.log('SQL 실행 시 에러 발생함.');
        		console.dir(err);
        		
        		callback(err, null);
        		
        		return;
        	}
        	
        	callback(null, result);
        	
        });
        
        conn.on('error', function(err) {      
              console.log('데이터베이스 연결 시 에러 발생함.');
              console.dir(err);
              
              callback(err, null);
        });
    });	  
  }

app.post('/process/write', function(req,res){
	console.log("글 등록랳ㅇ");

	var paramTitle = req.param('title');
	var paranContents = req.param('contents');
	var user = req.session.user.id;
	console.log(paramTitle+paranContents)
	console.log(user);
	if(pool){
		addData(paramTitle,paranContents,user, function(err,result){
			if (err) {
				res.redirect('/');
			}
			
			if (result) {
				console.dir(result);
				res.redirect('..');
				res.end();
			} else {
        		res.redirect('/')
				res.end();
			}
		});
	} else {
		res.redirect('/')
		res.end();
		}
	
});



app.post('/process/adduser', function(req, res) {
	console.log('/process/adduser 호출됨.');

	var paramEmail = req.param('inputEmail');
	var paramName = req.param('name');
  	var paramPassword = req.param('inputPassword');
  	var paramNick = req.param('Nick');
	
	if (pool) {
		addUser(paramEmail, paramNick,paramName,paramPassword, function(err, result) {
			if (err) {
				
				
			}
			
			if (result) {
				console.dir(result);

				console.log('inserted ' + result.affectedRows + ' rows');
	        	
	        	var insertId = result.name;
	        	console.log('추가한 레코드의 아이디 : ' + insertId);
	        	
				res.redirect('/Login/join.html');
				res.end();
			} else {
        		res.redirect('/')
				res.end();
			}
		});
	} else {
    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
    res.redirect('/')
	res.end();
	}
	
});
//로그인

app.post('/process/login', function(req, res) {
	console.log('/process/login 호출됨.');

	var paramEmail = req.param('inputEmail');
	var paramPassword = req.param('inputPassword');
	console.log('이미로그인 되어있음')
	if (pool) {
		if(req.session.user){
			console.log('이미로그인 되어있음')
		} else {
			authUser(paramEmail, paramPassword, function(err, rows) {
				if (err) {throw err;}
				
				if (rows) {
					console.dir(rows[0].Nick);
					
					req.session.user ={
						id : paramEmail,
						pw : paramPassword,
						name : rows[0].Nick,
						authorized : true
					};
					res.redirect('/');
					res.end();
				
				} else {
					
					res.redirect('/Login/login.html')
					res.end();
				}
			});
		}
	} else {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.end();
	}
	
});
var addData = function(title,contents,writer, callback){
	console.log('addData 호출됨.');
	pool.getConnection(function(err, conn) {
        if (err) {
        	conn.release();  // 반드시 해제해야 합니다.
          return;
        }   
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
		console.log(writer);
    	// 데이터를 객체로 만듭니다.
    	var data = {title, contents, writer};
    	
        // SQL 문을 실행합니다.
        var exec = conn.query('insert into noticeboard (title,contents,writer) values(?,?,?)', [title,contents,writer], function(err, result) {
        	conn.release();  // 반드시 해제해야 합니다.
        	console.log('실행 대상 SQL : ' + exec.sql);
        	
        	if (err) {
        		console.log('SQL 실행 시 에러 발생함.');
        		console.dir(err);
        		
        		callback(err, null);
        		
        		return;
        	}
        	
        	callback(null, result);
        	
        });
        
        conn.on('error', function(err) {      
              console.log('데이터베이스 연결 시 에러 발생함.');
              console.dir(err);
              
              callback(err, null);
        });
    });
}
//사용자를 등록하는 함수
var addUser = function(email,Nick, name, password, callback) {
	console.log('addUser 호출됨.');
	
	// 커넥션 풀에서 연결 객체를 가져옵니다.
	pool.getConnection(function(err, conn) {
        if (err) {
        	conn.release();  // 반드시 해제해야 합니다.
          return;
        }   
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

    	// 데이터를 객체로 만듭니다.
    	var data = {email:email, name:name, password:password,Nick:Nick};
    	
        // SQL 문을 실행합니다.
        var exec = conn.query('insert into users set ?', data, function(err, result) {
        	conn.release();  // 반드시 해제해야 합니다.
        	console.log('실행 대상 SQL : ' + exec.sql);
        	
        	if (err) {
        		console.log('SQL 실행 시 에러 발생함.');
        		console.dir(err);
        		
        		callback(err, null);
        		
        		return;
        	}
        	
        	callback(null, result);
        	
        });
        
        conn.on('error', function(err) {      
              console.log('데이터베이스 연결 시 에러 발생함.');
              console.dir(err);
              
              callback(err, null);
        });
    });
	
}

app.get('/logout', function(req,res,next){
	req.session.destroy();
	res.redirect('/')
});

// 로그인 처리 함수
var authUser = function(email, password, callback){
	console.log('authUser 호출됨 : ' + email + ','+ password);

	pool.getConnection(function(err,conn){
		if(err){
			if(conn){
				conn.release();
			}
				callback(err,null);
				return;
		}
		console.log('데이어베이스 연결 스레드 아이디 : '+ conn.threadId);
		var tablename = 'users';
		var culumns = ['email','name', 'Nick'];
		var exec = conn.query("select ?? from ?? where email = ? and password = ?",[culumns,tablename,email,password],function(err,rows){
			conn.release();
			console.log('실행된 SQL : ' + exec.sql);

			if(err){
				callback(err,null);
				return;
			}
			if(rows.length > 0){
				console.log('사용자 찾음..');
				callback(null, rows);
			}else{
				console.log('사용자 찾지못함');
				callback(null,null)
			}
		});
		conn.on('error', function(err) {      
            console.log('데이터베이스 연결 시 에러 발생함.');
            console.dir(err);
            
            callback(err, null);
     	 });
	});
}

//===== 404 에러 페이지 처리 =====//
var errorHandler = expressErrorHandler({
 static: {
   '404': './404.html'
 }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );


//===== 서버 시작 =====//
http.createServer(app).listen(app.get('port'), function(){
  console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
});
