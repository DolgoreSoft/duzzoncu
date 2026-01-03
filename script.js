// 게임 상태
const gameState = {
  currentStep: 1,
  totalSteps: 7,
  selectedTopping: null,
  usedIngredients: new Set(),
  usedTools: new Set(),
  ingredientsInBowl: [],
};

// 단계별 재료와 도구 정의
const steps = [
  {
    step: 1,
    name: "버터 크림화",
    ingredients: ["butter", "sugar"],
    tools: ["spatula"],
    instruction: "버터와 설탕을 넣고 주걱으로 크림처럼 섞어주세요",
  },
  {
    step: 2,
    name: "계란 & 쫀득 재료",
    ingredients: ["egg", "condensed_milk", "honey", "vanilla_extract"],
    tools: [],
    instruction: "달걀, 연유, 꿀, 바닐라를 넣어주세요",
  },
  {
    step: 3,
    name: "가루 재료",
    ingredients: ["flour", "corn_powder", "baking_powder", "salt"],
    tools: ["sieve", "spatula"],
    instruction: "체로 치고 주걱으로 살살 섞어주세요",
  },
  {
    step: 4,
    name: "토핑 선택",
    ingredients: [],
    tools: [],
    instruction: "원하는 토핑을 선택해주세요",
  },
  {
    step: 5,
    name: "반죽 올리기",
    ingredients: [],
    tools: ["paper_foil"],
    instruction: "반죽을 동그랗게 만들어 오븐팬에 올려주세요",
  },
  {
    step: 6,
    name: "굽기",
    ingredients: [],
    tools: ["oven"],
    instruction: "오븐에서 구워주세요",
  },
  {
    step: 7,
    name: "완성",
    ingredients: [],
    tools: [],
    instruction: "완성!",
  },
];

// 재료 이름 매핑
const ingredientNames = {
  butter: "버터",
  sugar: "설탕",
  egg: "달걀",
  condensed_milk: "연유",
  honey: "꿀",
  vanilla_extract: "바닐라",
  flour: "박력분",
  corn_powder: "옥수수전분",
  baking_powder: "베이킹파우더",
  salt: "소금",
};

// 도구 이름 매핑
const toolNames = {
  spatula: "주걱",
  sieve: "체",
  paper_foil: "종이호일",
  oven_pan: "오븐팬",
  oven: "오븐",
};

// 토핑별 결과 이미지 매핑
const toppingResultImages = {
  chocochip: "cookie_chocochip.png",
  darkchocolate: "cookie_darkchocolate.png",
  macadamia: "cookie_macadamia.png",
  pikan: "cookie_pikan.png",
  pistaccio: "dubaicookie.png", // 피스타치오 쿠키 이미지가 없어서 기본 이미지 사용
};

// DOM 요소
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");
const startBtn = document.getElementById("start-btn");
const nextStepBtn = document.getElementById("next-step-btn");
const restartBtn = document.getElementById("restart-btn");
const shareBtn = document.getElementById("share-btn");
const stepText = document.getElementById("step-text");
const progressFill = document.getElementById("progress-fill");
const ingredientsShelf = document.getElementById("ingredients-shelf");
const toolsShelf = document.getElementById("tools-shelf");
const bowlContainer = document.getElementById("bowl-container");
const ovenContainer = document.getElementById("oven-container");
const ingredientsInBowl = document.getElementById("ingredients-in-bowl");
const toppingSelection = document.getElementById("topping-selection");
const resultCookieImg = document.getElementById("result-cookie-img");
const resultMessage = document.getElementById("result-message");
const bowlImg = document.getElementById("bowl-img");
const shareCanvas = document.getElementById("share-canvas");

// 시작 버튼 클릭
startBtn.addEventListener("click", () => {
  startScreen.classList.remove("active");
  gameScreen.classList.add("active");
  initGame();
});

// 다시 만들기 버튼
restartBtn.addEventListener("click", () => {
  resetGame();
  resultScreen.classList.remove("active");
  gameScreen.classList.add("active");
  initGame();
});

// 다음 단계 버튼
nextStepBtn.addEventListener("click", () => {
  if (gameState.currentStep < gameState.totalSteps) {
    gameState.currentStep++;
    updateGameStep();
    // 화면 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// 토핑 선택
document.querySelectorAll(".topping-option").forEach((option) => {
  option.addEventListener("click", () => {
    document
      .querySelectorAll(".topping-option")
      .forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");
    gameState.selectedTopping = option.dataset.topping;
    nextStepBtn.style.display = "block";
  });
});

// 공유 버튼
shareBtn.addEventListener("click", async () => {
  await shareCookieImage();
});

// 게임 초기화
function initGame() {
  gameState.currentStep = 1;
  gameState.selectedTopping = null;
  gameState.usedIngredients.clear();
  gameState.usedTools.clear();
  gameState.ingredientsInBowl = [];

  updateGameStep();
}

// 게임 단계 업데이트
function updateGameStep() {
  const currentStepData = steps[gameState.currentStep - 1];

  // 진행도 업데이트
  const progress = (gameState.currentStep / gameState.totalSteps) * 100;
  progressFill.style.width = progress + "%";

  // 단계 텍스트 업데이트
  stepText.textContent = `${gameState.currentStep}단계: ${currentStepData.name}`;

  // 다음 단계 버튼 숨기기
  nextStepBtn.style.display = "none";

  // 특수 단계 처리
  if (gameState.currentStep === 4) {
    // 토핑 선택 단계
    showToppingSelection();
  } else if (gameState.currentStep === 5) {
    // 반죽 올리기 단계 - 오븐팬 표시
    bowlContainer.style.display = "none";
    ovenContainer.style.display = "flex";
    showShapingStep(currentStepData);
  } else if (gameState.currentStep === 6) {
    // 굽기 단계
    showBakingAnimation();
  } else if (gameState.currentStep === 7) {
    // 완성 단계
    showResult();
  } else {
    // 일반 단계
    bowlContainer.style.display = "flex";
    ovenContainer.style.display = "none";
    toppingSelection.style.display = "none";
    showIngredientsAndTools(currentStepData);
  }
}

// 재료와 도구 표시
function showIngredientsAndTools(stepData) {
  ingredientsShelf.innerHTML = "";
  toolsShelf.innerHTML = "";

  // 재료 표시
  stepData.ingredients.forEach((ingredient) => {
    if (!gameState.usedIngredients.has(ingredient)) {
      const item = createIngredientItem(ingredient);
      ingredientsShelf.appendChild(item);
    }
  });

  // 도구 표시
  stepData.tools.forEach((tool) => {
    if (!gameState.usedTools.has(tool)) {
      const item = createToolItem(tool);
      toolsShelf.appendChild(item);
    }
  });

  // 모든 재료와 도구를 사용했는지 확인
  const allIngredientsUsed = stepData.ingredients.every((ing) =>
    gameState.usedIngredients.has(ing)
  );
  const allToolsUsed = stepData.tools.every((tool) =>
    gameState.usedTools.has(tool)
  );

  if (
    allIngredientsUsed &&
    allToolsUsed &&
    stepData.ingredients.length + stepData.tools.length > 0
  ) {
    nextStepBtn.style.display = "block";
    // 주걱 사용 시 흔들림 효과
    if (
      stepData.tools.includes("spatula") &&
      gameState.usedTools.has("spatula")
    ) {
      bowlImg.classList.add("shake");
      setTimeout(() => bowlImg.classList.remove("shake"), 500);
    }
  }
}

// 재료 아이템 생성
function createIngredientItem(ingredient) {
  const item = document.createElement("div");
  item.className = "ingredient-item";
  item.dataset.ingredient = ingredient;

  const img = document.createElement("img");
  img.src = `images/${ingredient}.png`;
  img.alt = ingredientNames[ingredient];

  const span = document.createElement("span");
  span.textContent = ingredientNames[ingredient];

  item.appendChild(img);
  item.appendChild(span);

  item.addEventListener("click", () => {
    if (!gameState.usedIngredients.has(ingredient)) {
      gameState.usedIngredients.add(ingredient);
      gameState.ingredientsInBowl.push(ingredient);

      // 볼에 재료 추가 애니메이션
      const ingredientImg = document.createElement("img");
      ingredientImg.src = `images/${ingredient}.png`;
      ingredientImg.className = "ingredient-added";
      ingredientImg.style.width = "50px";
      ingredientImg.style.height = "50px";
      ingredientsInBowl.appendChild(ingredientImg);

      item.classList.add("used");

      // 다음 단계 버튼 표시 확인
      const currentStepData = steps[gameState.currentStep - 1];
      const allIngredientsUsed = currentStepData.ingredients.every((ing) =>
        gameState.usedIngredients.has(ing)
      );
      const allToolsUsed = currentStepData.tools.every((tool) =>
        gameState.usedTools.has(tool)
      );

      if (allIngredientsUsed && allToolsUsed) {
        nextStepBtn.style.display = "block";
      }
    }
  });

  return item;
}

// 도구 아이템 생성
function createToolItem(tool) {
  const item = document.createElement("div");
  item.className = "tool-item";
  item.dataset.tool = tool;

  const img = document.createElement("img");
  img.src = `images/${tool}.png`;
  img.alt = toolNames[tool];

  const span = document.createElement("span");
  span.textContent = toolNames[tool];

  item.appendChild(img);
  item.appendChild(span);

  item.addEventListener("click", () => {
    if (!gameState.usedTools.has(tool)) {
      gameState.usedTools.add(tool);
      item.classList.add("used");

      // 주걱 사용 시 흔들림 효과
      if (tool === "spatula") {
        bowlImg.classList.add("shake");
        setTimeout(() => bowlImg.classList.remove("shake"), 500);
      }

      // 체 사용 시 특별 효과
      if (tool === "sieve") {
        bowlImg.classList.add("pulse");
        setTimeout(() => bowlImg.classList.remove("pulse"), 500);
      }

      // 오븐팬 사용 시 반죽 추가
      if (tool === "oven_pan" && gameState.currentStep === 5) {
        const cookiesOnPan = document.getElementById("cookies-on-pan");
        if (cookiesOnPan) {
          cookiesOnPan.innerHTML = "";
          for (let i = 0; i < 3; i++) {
            const doughImg = document.createElement("img");
            doughImg.src = `images/dubaicookie.png`;
            doughImg.className = "cookie-on-pan";
            doughImg.style.opacity = "0.7";
            cookiesOnPan.appendChild(doughImg);
          }
        }
      }

      // 다음 단계 버튼 표시 확인
      const currentStepData = steps[gameState.currentStep - 1];
      const allIngredientsUsed = currentStepData.ingredients.every((ing) =>
        gameState.usedIngredients.has(ing)
      );
      const allToolsUsed = currentStepData.tools.every((tool) =>
        gameState.usedTools.has(tool)
      );

      if (allIngredientsUsed && allToolsUsed) {
        nextStepBtn.style.display = "block";
      }
    }
  });

  return item;
}

// 토핑 선택 표시
function showToppingSelection() {
  ingredientsShelf.style.display = "none";
  toolsShelf.style.display = "none";
  toppingSelection.style.display = "block";
}

// 반죽 올리기 단계 표시
function showShapingStep(stepData) {
  // 토핑 선택 영역 숨기기
  toppingSelection.style.display = "none";
  // 재료/도구 슬롯 다시 표시
  ingredientsShelf.style.display = "flex";
  toolsShelf.style.display = "flex";

  ingredientsShelf.innerHTML = "";
  toolsShelf.innerHTML = "";

  // 도구 표시
  stepData.tools.forEach((tool) => {
    if (!gameState.usedTools.has(tool)) {
      const item = createToolItem(tool);
      toolsShelf.appendChild(item);
    }
  });

  // 모든 도구를 사용했는지 확인
  const allToolsUsed = stepData.tools.every((tool) =>
    gameState.usedTools.has(tool)
  );
  if (allToolsUsed && stepData.tools.length > 0) {
    nextStepBtn.style.display = "block";
  }
}

// 굽기 애니메이션
function showBakingAnimation() {
  ingredientsShelf.style.display = "none";
  toolsShelf.style.display = "none";
  toppingSelection.style.display = "none";

  // 오븐 사용 표시
  toolsShelf.innerHTML = "";
  const ovenTool = createToolItem("oven");
  toolsShelf.style.display = "flex";
  toolsShelf.appendChild(ovenTool);

  // 오븐 클릭 시
  const originalClickHandler = ovenTool.onclick;
  ovenTool.addEventListener("click", () => {
    if (!gameState.usedTools.has("oven")) {
      gameState.usedTools.add("oven");
      ovenTool.classList.add("used");

      // 굽기 애니메이션 (오븐 빛나는 효과)
      const ovenImg = document.querySelector(".oven-img");
      if (ovenImg) {
        ovenImg.style.filter =
          "drop-shadow(0 10px 30px rgba(255, 100, 0, 0.8))";
      }

      // 굽기 애니메이션
      setTimeout(() => {
        const cookiesOnPan = document.getElementById("cookies-on-pan");
        cookiesOnPan.innerHTML = "";

        // 쿠키 3개 표시
        for (let i = 0; i < 3; i++) {
          const cookieImg = document.createElement("img");
          cookieImg.src = `images/${
            toppingResultImages[gameState.selectedTopping]
          }`;
          cookieImg.className = "cookie-on-pan";
          cookiesOnPan.appendChild(cookieImg);
        }

        if (ovenImg) {
          ovenImg.style.filter = "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2))";
        }

        setTimeout(() => {
          nextStepBtn.style.display = "block";
        }, 500);
      }, 1000);
    }
  });
}

// 결과 표시
function showResult() {
  gameScreen.classList.remove("active");
  resultScreen.classList.add("active");

  const resultImage =
    toppingResultImages[gameState.selectedTopping] || "dubaicookie.png";
  resultCookieImg.src = `images/${resultImage}`;

  const toppingName = document.querySelector(
    `.topping-option[data-topping="${gameState.selectedTopping}"] span`
  ).textContent;
  resultMessage.textContent = `${toppingName} 두바이 쫀득 쿠키가 완성되었어요! 🎉`;
}

// 게임 리셋
function resetGame() {
  gameState.currentStep = 1;
  gameState.selectedTopping = null;
  gameState.usedIngredients.clear();
  gameState.usedTools.clear();
  gameState.ingredientsInBowl = [];

  ingredientsInBowl.innerHTML = "";
  document
    .querySelectorAll(".topping-option")
    .forEach((opt) => opt.classList.remove("selected"));
  bowlContainer.style.display = "flex";
  ovenContainer.style.display = "none";
  ingredientsShelf.style.display = "flex";
  toolsShelf.style.display = "flex";
}

// 이미지 공유 기능
async function shareCookieImage() {
  let imageUrl = null;
  try {
    // file:// 프로토콜로 열렸는지 확인
    if (window.location.protocol === "file:") {
      alert(
        "이미지 공유 기능은 HTTP 서버를 통해 접속해야 합니다.\n\n터미널에서 다음 명령을 실행하세요:\npython3 -m http.server 8000\n\n그리고 브라우저에서 http://localhost:8000 으로 접속하세요."
      );
      return;
    }

    const resultImage =
      toppingResultImages[gameState.selectedTopping] || "dubaicookie.png";

    // fetch로 이미지를 blob으로 가져와서 tainted canvas 문제 해결
    const response = await fetch(`images/${resultImage}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const imageBlob = await response.blob();
    imageUrl = URL.createObjectURL(imageBlob);

    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        reject(new Error("이미지를 불러올 수 없습니다."));
      };
      img.src = imageUrl;
    });

    // 캔버스 크기 설정
    const canvas = shareCanvas;
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");

    // 배경 그라데이션
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 텍스트 추가
    ctx.fillStyle = "white";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("두바이 쫀득 쿠키 완성!", canvas.width / 2, 100);

    // 쿠키 이미지 그리기
    const imageSize = 500;
    const x = (canvas.width - imageSize) / 2;
    const y = (canvas.height - imageSize) / 2 + 50;
    ctx.drawImage(img, x, y, imageSize, imageSize);

    // 하단 텍스트
    ctx.font = "40px Arial";
    ctx.fillText(
      "🍪 집에서 만든 특별한 쿠키 🍪",
      canvas.width / 2,
      canvas.height - 50
    );

    // 이미지를 Blob으로 변환
    canvas.toBlob(async (blob) => {
      // 이미지 URL 정리
      if (imageUrl) URL.revokeObjectURL(imageUrl);

      if (!blob) {
        alert("이미지 생성에 실패했습니다.");
        return;
      }

      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], "dubai-cookie.png", {
            type: "image/png",
          });
          await navigator.share({
            title: "두바이 쫀득 쿠키 완성!",
            text: "두바이 쫀득 쿠키를 만들었어요! 🍪",
            files: [file],
          });
        } catch (error) {
          if (error.name !== "AbortError") {
            downloadImage(blob);
          }
        }
      } else {
        // Web Share API 미지원 또는 실패 시 다운로드
        downloadImage(blob);
      }
    }, "image/png");
  } catch (error) {
    console.error("이미지 공유 오류:", error);
    alert("이미지 공유 중 오류가 발생했습니다: " + error.message);
  }
}

// 이미지 다운로드
function downloadImage(blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dubai-cookie.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  alert("이미지가 다운로드되었습니다!");
}
