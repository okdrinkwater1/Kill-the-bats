let bats=[];
let batCount=1;
let batImages=["assets/bat-left.gif","assets/bat-right.gif"];
let batWidth=64;
let batHeight=48;
let batVelocityX=300;
let batVelocityY=300;
let batShakeSpeed=11;
let batShakeSize=14;
let batTurnChance=0.9;

let maxBats=12;
let hitPadding=15;

let score=0;
let round=0;

let baseTime=2;
let startTimePerBat=3;
let minTimePerBat=1.6;
let timePerBatKill=0.1;
let roundTime=0;
let timeRem=0;
let timerRunning=false;
let timerFill=null;


let lastTime=0;
let assets=["assets/bat-left.gif","assets/bat-right.gif","assets/pumpkin1.png","assets/pumpkin2.png","assets/bg.png","assets/stars.png","assets/moon.png","assets/target.png"];
let ready=false;
let AssetsReady=null;

let vigCanvas=null;
let vigContext=null;
let vigEdge=60;
let vigClosed=false;

let gameWidth=window.innerWidth;
let gameHeight=window.innerHeight*3/4;

function randomPosition(limit){
    return Math.floor((Math.random()*limit));
}

function randomSign(){
    return Math.random() < 0.5 ? -1 : 1;
}


function gameLoop(time){
    let delta=(time-lastTime)/1000;
    lastTime=time;
    if(delta>0.05){
        delta=0.05;
    }
    if(delta<0){
        delta=0;
    }
    moveBats(delta);
    updateTimer(delta);
    requestAnimationFrame(gameLoop);
}

function addBats(){
    bats=[];
    round+=1;
    batCount=Math.min(round,maxBats);
    let speed=batVelocityX*(1+Math.min(round,15)*0.08);
    let timePerBat=Math.max(minTimePerBat,startTimePerBat-round*timePerBatKill);
    roundTime=baseTime+batCount*timePerBat;
    timeRem=roundTime;
    timerRunning=true;
    showRound();
    for(let i=0;i<batCount;i++){
        let batChoose=batImages[Math.floor(Math.random()*2)];
        let batImg=document.createElement("img");
        batImg.src=batChoose;
        batImg.width=batWidth;
        batImg.height=batHeight;
        batImg.draggable=false;
        batImg.style.position="absolute";
        batImg.style.left="0px";
        batImg.style.top="0px";
        batImg.style.willChange="translate";
        document.body.appendChild(batImg);

        let bat={
            image:batImg,
            x:randomPosition(gameWidth-batWidth),
            y:randomPosition(gameHeight-batHeight),
            speed:speed,
            velocityX:speed,
            velocityY:speed,
            shake:Math.random()*6
        }
        bat.image.style.translate=String(bat.x)+"px "+String(bat.y)+"px";

        if(batChoose===batImages[0]){
            bat.velocityX=-speed;
        }
        bats.push(bat);
    }
}

function moveBats(delta){
    for(let i=0;i<bats.length;i++){
        let bat=bats[i];
        bat.shake+=batShakeSpeed*delta;
        bat.x+=bat.velocityX*delta;
        if(bat.x<0||bat.x+batWidth>gameWidth){
            bat.x-=bat.velocityX*delta;
            bat.velocityX*=-1;
            if(bat.velocityX<0){
                bat.image.src=batImages[0];
            }
            else{
                bat.image.src=batImages[1];
            }
        }
        bat.y+=bat.velocityY*delta;
        if(bat.y<0||bat.y+batHeight>gameHeight){
            bat.y-=bat.velocityY*delta;
            bat.velocityY*=-1;
        }
        if(Math.random()<batTurnChance*delta){
            bat.velocityY=randomSign()*bat.speed*(0.3+Math.random()*0.6);
        }
        bat.image.style.translate=String(bat.x)+"px "+String(bat.y+Math.sin(bat.shake)*batShakeSize)+"px";
    }
}

function updateTimer(delta){
    if(!timerRunning){
        return;
    }
    timeRem-=delta;
    if(timeRem<=0){
        timeRem=0;
    }
    let ratio=timeRem/roundTime;
    timerFill.style.transform="scaleX("+ratio+")";
    timerFill.classList.toggle("low",ratio<0.25);
    if(timeRem===0){
        timerRunning=false;
    }
}

function shootBat(bat){
    score+=1;
    let scoreText=document.getElementById("score");
    scoreText.textContent=score;
    scoreText.classList.remove("bump");
    void scoreText.offsetWidth;
    scoreText.classList.add("bump");
    addPoints(bat);
    bat.image.classList.add("hit");
    setTimeout(function(){
        bat.image.remove();
    },500);
    let remainingBats=[];
    for(let i=0;i<bats.length;i++){
        if(bats[i]!==bat){
            remainingBats.push(bats[i]);
        }
    }
    bats=remainingBats;
    if(bats.length===0){
        timerRunning=false;
        addPumpkin(batCount);
    }
}

function shootPos(x,y){
    for(let i=0;i<bats.length;i++){
        let rect=bats[i].image.getBoundingClientRect();
        if(x>=rect.left-hitPadding&&x<=rect.right+hitPadding&&y>=rect.top-hitPadding&&y<=rect.bottom+hitPadding){
            shootBat(bats[i]);
            return;
        }
    }
}

document.addEventListener("pointerdown", function(event){
    shootPos(event.clientX,event.clientY);
});

function showRound(){
    let roundText=document.getElementById("round");
    roundText.textContent="Round "+round;
    roundText.classList.remove("show");
    void roundText.offsetWidth;
    roundText.classList.add("show");
}

function addPoints(bat){
    let pop=document.createElement("div");
    pop.className="pop";
    pop.textContent="+1";
    pop.style.left=String(bat.x+batWidth/2-20)+"px";
    pop.style.top=String(bat.y)+"px";
    document.body.appendChild(pop);

    setTimeout(function(){
        document.body.removeChild(pop);
    },800);
}

function addPumpkin(batCount){
    let pumpkinImage=document.createElement("img");
    if(batCount==1){
        pumpkinImage.src="assets/pumpkin1.png"
    }
    else{
        pumpkinImage.src="assets/pumpkin2.png"
    }
    pumpkinImage.className="pumpkin";
    pumpkinImage.width=192;
    pumpkinImage.height=168;
    pumpkinImage.draggable=false;

    pumpkinImage.style.position="fixed";
    pumpkinImage.style.bottom="0px";
    pumpkinImage.style.left="50%";
    pumpkinImage.style.marginLeft="-96px";
    document.body.appendChild(pumpkinImage);

    setTimeout(function(){
        pumpkinImage.classList.add("up");
    },500);
    setTimeout(function(){
        pumpkinImage.classList.remove("up");
    },2600);
    setTimeout(function(){
        document.body.removeChild(pumpkinImage);
        addBats();
    },3200);
}

function loadAssets(){
    let count=0;
    let total=assets.length+1;
    function load(){
        count+=1;
        if(count===total){
            ready=true;
            if(AssetsReady!==null){
                AssetsReady();
            }
        }
    }
    for(let i=0;i<assets.length;i++){
        let img=new Image();
        img.onload=load;
        img.onerror=load;
        img.src=assets[i];
    }
    document.fonts.load("50px augie").then(load,load);
}

function wait(next){
    if(ready){
        next();
    }
    else{
        AssetsReady=next;
    }
}

function setupVig(){
    vigCanvas=document.getElementById("vig");
    vigCanvas.width=window.innerWidth;
    vigCanvas.height=window.innerHeight;
    vigContext=vigCanvas.getContext("2d");
}

function maxVigRadius(){
    return Math.sqrt(vigCanvas.width*vigCanvas.width+vigCanvas.height*vigCanvas.height)/2;
}

function drawVig(radius){
    let width=vigCanvas.width;
    let height=vigCanvas.height;
    vigContext.clearRect(0,0,width,height);
    if(radius<=1){
        vigContext.fillStyle="#000";
        vigContext.fillRect(0,0,width,height);
        return;
    }
    let edge=Math.min(vigEdge,radius);
    let gradient=vigContext.createRadialGradient(width/2,height/2,radius,width/2,height/2,radius+edge);
    gradient.addColorStop(0,"rgba(0,0,0,0)");
    gradient.addColorStop(1,"#000");
    vigContext.fillStyle=gradient;
    vigContext.fillRect(0,0,width,height);
}

function animateVig(from,to,duration,callback){
    let startTime=performance.now();
    function step(time){
        let t=(time-startTime)/duration;
        if(t<0){
            t=0;
        }
        if(t>1){
            t=1;
        }
        let ease=t*t*(3-2*t);
        drawVig(from+(to-from)*ease);
        if(t<1){
            requestAnimationFrame(step);
        }
        else if(callback){
            callback();
        }
    }
    requestAnimationFrame(step);
}

function closeVig(callback){
    vigCanvas.style.display="block";
    animateVig(maxVigRadius(),0,900,function(){
        vigClosed=true;
        if(callback){
            callback();
        }
    })
}

function openVig(callback){
    vigClosed=false;
    animateVig(0,maxVigRadius(),1000,function(){
        vigCanvas.style.display="none";
        if(callback){
            callback();
        }
    })
}

window.onload=function(){
    timerFill=document.getElementById("fill");
    setupVig();
    loadAssets();
    document.getElementById("start").onclick=startGame;
}

function startGame(){
    document.getElementById("start").onclick=null;
    closeVig(function(){
        document.getElementById("start").remove();
        wait(beginGame);
    })
}

function beginGame(){
    lastTime=performance.now();
    requestAnimationFrame(gameLoop);
    openVig(addBats);
}

window.onresize=function(){
    gameWidth=window.innerWidth;
    gameHeight=window.innerHeight*3/4;
    vigCanvas.width=window.innerWidth;
    vigCanvas.height=window.innerHeight;
    if(vigClosed){
        drawVig(0);
    }

    for(let i=0;i<bats.length;i++){
        bats[i].x=Math.max(0,Math.min(bats[i].x,gameWidth-batWidth));
        bats[i].y=Math.max(0,Math.min(bats[i].y,gameHeight-batHeight));
    }
}