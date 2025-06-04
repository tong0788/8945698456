// Hand Pose Detection with ml5.js
let video;
let handPose;
let hands = [];
let circles = [];
let circleRadius = 109;
let currentQuestion = null;
let currentIndex = 0;
let showResult = false;
let resultMessage = "";
let resultTimer = 0;
let score = 0;
let startTime = 0;
let gameStarted = false;
let gameEnded = false;
let startButton;
let questionX, questionY;

const questions = [
  {
    number: 1,
    text: "教育科技在未來十年最有可能改變哪一項教學元素？",
    options: ["A. 學科內容本身", "B. 教師的角色與教學方式", "C. 教室的地板設計"],
    answer: "B"
  },
  {
    number: 2,
    text: "下列哪一項是虛擬實境（VR）與擴增實境（AR）在教育現場應用時常見的挑戰？",
    options: ["A. 學生對科技失去興趣", "B. 教材難以轉換為科技內容", "C. 設備與技術成本高"],
    answer: "C"
  }
];

function preload() {}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  handPose = ml5.handPose(video, modelReady);
  handPose.on("predict", gotHands);

  for (let i = 0; i < questions.length; i++) {
    circles.push({
      x: random(100, width - 100),
      y: random(100, height - 100),
      number: questions[i].number,
      question: questions[i]
    });
  }

  questionX = random(50, width - 400);
  questionY = random(50, height - 200);

  startButton = createButton("START");
  startButton.position(width / 2 - 40, height / 2 - 20);
  startButton.size(80, 40);
  startButton.style("background-color", "#A6E1FA");
  startButton.style("color", "#001C55");
  startButton.style("font-family", "新細明體");
  startButton.style("font-size", "18px");
  startButton.style("border", "none");
  startButton.style("cursor", "pointer");

  startButton.mousePressed(() => {
    gameStarted = true;
    startTime = millis();
    currentQuestion = questions[currentIndex];
    startButton.hide();
  });
}

function modelReady() {
  console.log("Hand Pose Model Loaded!");
}

function gotHands(results) {
  hands = results.length > 0 ? results : [];
}

function draw() {
  image(video, 0, 0);

  if (!gameStarted) return;

  if (gameEnded) {
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    let totalTime = ((millis() - startTime) / 1000).toFixed(2);
    text(`遊戲結束！總分：${score} 分`, width / 2, height / 2 - 20);
    text(`完成時間：${totalTime} 秒`, width / 2, height / 2 + 20);
    return;
  }

  fill(255);
  textSize(20);
  textAlign(RIGHT, TOP);
  let elapsedTime = ((millis() - startTime) / 1000).toFixed(2);
  text(`時間：${elapsedTime} 秒`, width - 10, 10);

  for (let circle of circles) {
    fill(0, 0, 255, 150);
    noStroke();
    circle(circle.x, circle.y, circleRadius);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text(circle.number, circle.x, circle.y);
  }

  if (currentQuestion && !showResult) {
    fill(0);
    textSize(20);
    textAlign(LEFT, TOP);
    text(currentQuestion.text, questionX, questionY);

    for (let i = 0; i < currentQuestion.options.length; i++) {
      text(`${String.fromCharCode(65 + i)}. ${currentQuestion.options[i]}`, questionX, questionY + 30 + i * 30);
    }
  }

  if (showResult) {
    fill(resultMessage === "正確！" ? "green" : "red");
    textSize(32);
    textAlign(CENTER, CENTER);
    text(resultMessage, width / 2, height / 2);

    if (millis() - resultTimer > 2000) {
      showResult = false;
      currentIndex++;
      if (currentIndex < questions.length) {
        currentQuestion = questions[currentIndex];
        questionX = random(50, width - 400);
        questionY = random(50, height - 200);
      } else {
        gameEnded = true;
      }
    }
  }

  if (hands.length > 0 && !showResult) {
    for (let hand of hands) {
      if (hand.landmarks) {
        let indexFinger = hand.landmarks[8];

        for (let circle of circles) {
          let d = dist(indexFinger[0], indexFinger[1], circle.x, circle.y);
          if (d < circleRadius / 2) {
            if (circle.question.answer === currentQuestion.answer) {
              resultMessage = "正確！";
              score += 12.5;
            } else {
              resultMessage = "錯誤！";
            }
            showResult = true;
            resultTimer = millis();
          }
        }
      }
    }
  }
}
