    //datamaps data의 값을 api country data으로 변환
    var myMap = new Map();
    myMap.set("United States of America", "us");
    myMap.set("Greenland", "gl");

    document.getElementById("container").addEventListener('click', function(){

    //hoverinfo된 나라의 나라 값 받기
    var data = document.getElementsByClassName("hoverinfo")[0].innerText;
    console.log("클릭 : ", data);
    var country="";

    country = myMap.get(data);
    //Todo 사이드바 나타내기


    //뉴스기사 받아오기
    console.log(country , " 검색")
    var url = 'https://newsapi.org/v2/top-headlines?' +
                   'country=' + country + 
                   '&apiKey=f8b6710e4fac4d37b44169b23758efe4';

    var req = new XMLHttpRequest()
    req.open('GET', url, false);
    //console.log(req.responseText);
    req.send(null);
    //console.log(req.responseText);

    var string = req.responseText;
    var pars = JSON.parse(string);
    console.log("기사개수 : ", pars.articles.length);
    for(var i=0;i<pars.articles.length;i++){
      console.log(pars.articles[i]);

    //뉴스기사 출력하기
    let newsData = document.getElementById("sidebar").innerHTML;
    document.getElementById("sidebar").innerHTML= newsData + "\n"+"<li><a href=" + pars.articles[i].url +">" + pars.articles[i].title + "</a></li><br>";
    }
    });
