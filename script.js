let bats=[];
let batCount=1;
let batImages=["assets/bat-left.gif","assets/bat-right.gif"];
let batWidth=64;
let batHeight=48;
let batVelocityX=300;
let batVelocityY=300;
let batWobbleSpeed=11;
let batWobbleSize=14;
let batTurnChance=0.9;

let hitPadding=20;

let score=0;
let round=0;

let lastTime=0;

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
    moveBats(delta);
    requestAnimationFrame(gameLoop);
}

function addBats(){
    bats=[];
    round+=1;
    batCount=Math.floor(Math.random()*2)+1;
    let speed=batVelocityX*(1+Math.min(round,8)*0.09);
    showRound();
    for(let i=0;i<batCount;i++){
        let batChoose=batImages[Math.floor(Math.random()*2)];
        let batImg=document.createElement("img");
        batImg.src=batChoose;
        batImg.width=batWidth;
        batImg.height=batHeight;
        batImg.draggable=false;
        batImg.style.position="absolute";
        document.body.appendChild(batImg);

        let bat={
            image:batImg,
            x:randomPosition(gameWidth-batWidth),
            y:randomPosition(gameHeight-batHeight),
            speed:speed,
            velocityX:speed,
            velocityY:speed,
            wobble:Math.random()*6
        }
        bat.image.style.left=String(bat.x)+"px";
        bat.image.style.top=String(bat.y)+"px";

        if(batChoose===batImages[0]){
            bat.velocityX=-speed;
        }
        bats.push(bat);
    }
}

function moveBats(delta){
    for(let i=0;i<bats.length;i++){
        let bat=bats[i];
        bat.wobble+=batWobbleSpeed*delta;
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
        bat.image.style.left=String(bat.x)+"px";
        bat.image.style.top=String(bat.y+Math.sin(bat.wobble)*batWobbleSize)+"px";
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
    pop.innerHTML="+1";
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

window.onload=function(){
    document.getElementById("start").onclick=startGame;
}

function startGame(){
    document.getElementById("start").remove();
    setTimeout(addBats,2000);
    lastTime=performance.now();
    requestAnimationFrame(gameLoop);
}

window.onresize=function(){
    gameWidth=window.innerWidth;
    gameHeight=window.innerHeight*3/4;

    for(let i=0;i<bats.length;i++){
        bats[i].x=Math.max(0,Math.min(bats[i].x,gameWidth-batWidth));
        bats[i].y=Math.max(0,Math.min(bats[i].y,gameHeight-batHeight));
    }
}