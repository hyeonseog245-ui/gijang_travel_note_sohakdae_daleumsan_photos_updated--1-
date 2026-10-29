const pages = [...document.querySelectorAll(".page")];
const pageIndicator = document.querySelector("#page-indicator");
const prevButton = document.querySelector("#prev-page");
const nextButton = document.querySelector("#next-page");
let currentIndex = 0;
let isTurning = false;
let turnTimer = null;

function updatePageNavigation() {
  pageIndicator.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(pages.length).padStart(2, "0")}`;
  // 원형 화살표는 양 끝에서도 계속 작동하도록 순환 이동합니다.
  prevButton.disabled = false;
  nextButton.disabled = false;
  document.querySelectorAll(".page-index .nav-link").forEach(link => {
    const isCurrent = link.dataset.page === pages[currentIndex].id;
    link.classList.toggle("active", isCurrent);
    link.setAttribute("aria-current", isCurrent ? "page" : "false");
  });
}

function showPage(pageId) {
  const nextIndex = pages.findIndex(page => page.id === pageId);
  if (nextIndex < 0 || nextIndex === currentIndex) return;

  // 빠르게 연속으로 눌러도 마지막으로 요청한 페이지 이동이 적용되도록 합니다.
  if (turnTimer !== null) {
    window.clearTimeout(turnTimer);
    turnTimer = null;
  }
  const currentPage = pages[currentIndex];
  currentPage.classList.remove("active", "leaving");
  pages.forEach(page => page.classList.remove("active", "leaving"));
  currentPage.classList.add("leaving");
  isTurning = true;

  turnTimer = window.setTimeout(() => {
    pages.forEach(page => page.classList.remove("active", "leaving"));
    currentIndex = nextIndex;
    pages[currentIndex].classList.add("active");
    updatePageNavigation();
    isTurning = false;
    turnTimer = null;
  }, 180);
}

// 처음 열린 페이지와 상단 전체 목차 상태를 맞춥니다.
updatePageNavigation();

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

// 노트 중단 아래쪽의 동그란 이전/다음 화살표 버튼입니다.
// 양 끝 페이지에서도 작동하도록 앞뒤로 순환합니다.
prevButton.addEventListener("click", () => {
  const targetIndex = (currentIndex - 1 + pages.length) % pages.length;
  showPage(pages[targetIndex].id);
});
nextButton.addEventListener("click", () => {
  const targetIndex = (currentIndex + 1) % pages.length;
  showPage(pages[targetIndex].id);
});

const spotNotes = {
  "달음산": ["산세를 따라 걷고 정상부에서 주변 풍경을 바라보는 산행 코스예요.", "산행 난이도와 날씨를 확인하고 물과 미끄럽지 않은 신발을 챙기세요."],
  "죽도": ["기장 바닷가 풍경을 대표하는 작은 섬으로 알려진 곳이에요.", "접근 가능한 구역과 주변 시설을 현장에서 확인하고 해안 안전에 유의하세요."],
  "일광해수욕장": ["모래사장과 바다를 따라 가볍게 걷기 좋은 해변이에요.", "해수욕장 이용 시기와 주차 상황을 확인하고 일몰 무렵에는 귀가 교통편도 살펴보세요."],
  "장안사 계곡": ["장안사 주변의 숲과 계곡 풍경을 함께 즐기는 코스로 생각해 보세요.", "계곡은 비 온 뒤 물살이 강해질 수 있어 출입 안내와 안전 표지를 따라주세요."],
  "홍연폭포": ["초록 풍경 속 폭포를 만나는 자연 명소로, 산·계곡 코스에 묶기 좋아요.", "강수량과 산책로 상태에 따라 풍경과 접근성이 달라질 수 있어요."],
  "소학대": ["기장의 산세와 바위 풍경을 관찰하는 장소로 알려져 있어요.", "주변 접근로와 사유지 여부를 확인하고 지정된 길을 이용하세요."],
  "시랑대": ["바위와 바다가 만나는 해안 풍경을 감상하기 좋은 명소예요.", "바위가 미끄럽거나 파도가 높을 수 있으니 가장자리 가까이 가지 마세요."],
  "임랑해수욕장": ["해안 산책을 하며 비교적 여유로운 바다 분위기를 즐겨 보세요.", "바람이 강한 날에는 체감 온도가 낮을 수 있으니 겉옷을 챙기세요."]
};
const modal = document.querySelector("#detail-modal");
const detailTitle = document.querySelector("#detail-title");
const detailImage = document.querySelector("#detail-image");
const detailCopy = document.querySelector("#detail-copy");
const detailTip = document.querySelector("#detail-tip");

document.querySelectorAll(".spot-card").forEach(card => {
  card.addEventListener("click", () => {
    const name = card.dataset.detail;
    const note = spotNotes[name];
    detailTitle.textContent = name;
    detailImage.className = `detail-image ${card.dataset.photo}`;
    detailCopy.textContent = note[0];
    detailTip.textContent = `여행 메모: ${note[1]}`;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.querySelector("#close-detail").focus();
  });
});

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
document.querySelector("#close-detail").addEventListener("click", closeModal);
document.querySelector("#detail-done").addEventListener("click", closeModal);
modal.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
  if (event.key === "ArrowRight" && !modal.classList.contains("open") && currentIndex < pages.length - 1) {
    showPage(pages[currentIndex + 1].id);
  }
  if (event.key === "ArrowLeft" && !modal.classList.contains("open") && currentIndex > 0) {
    showPage(pages[currentIndex - 1].id);
  }
});

// 마우스 휠로 노트 페이지 넘기기
let wheelLocked = false;
const bookWrap = document.querySelector(".book-wrap");

bookWrap.addEventListener("wheel", event => {
  // 모달이 열려 있거나 애니메이션 중이면 페이지를 넘기지 않아요.
  if (modal.classList.contains("open") || isTurning) return;

  // 작은 휠 움직임은 무시해 실수로 페이지가 넘어가는 것을 줄입니다.
  if (Math.abs(event.deltaY) < 18 || wheelLocked) return;

  event.preventDefault();
  wheelLocked = true;

  if (event.deltaY > 0 && currentIndex < pages.length - 1) {
    showPage(pages[currentIndex + 1].id);
  } else if (event.deltaY < 0 && currentIndex > 0) {
    showPage(pages[currentIndex - 1].id);
  }

  window.setTimeout(() => {
    wheelLocked = false;
  }, 650);
}, { passive: false });

// 페이지 영역에서 위아래로 스와이프해도 페이지를 넘길 수 있어요.
let touchStartY = 0;
bookWrap.addEventListener("touchstart", event => {
  touchStartY = event.changedTouches[0].screenY;
}, { passive: true });

bookWrap.addEventListener("touchend", event => {
  if (modal.classList.contains("open") || isTurning) return;
  const touchEndY = event.changedTouches[0].screenY;
  const distance = touchStartY - touchEndY;
  if (Math.abs(distance) < 55) return;

  if (distance > 0 && currentIndex < pages.length - 1) {
    showPage(pages[currentIndex + 1].id);
  } else if (distance < 0 && currentIndex > 0) {
    showPage(pages[currentIndex - 1].id);
  }
}, { passive: true });



// 방명록: 이 버전은 현재 브라우저의 localStorage에 기록을 저장합니다.
const guestbookForm = document.querySelector("#guestbook-form");
const guestPlaceInput = document.querySelector("#guest-place");
const guestNameInput = document.querySelector("#guest-name");
const guestMessageInput = document.querySelector("#guest-message");
const guestbookList = document.querySelector("#guestbook-list");
const guestbookCount = document.querySelector("#guestbook-count");
const guestbookSubmit = document.querySelector("#guestbook-submit");
const cancelEditButton = document.querySelector("#cancel-edit");
const guestbookFormHint = document.querySelector("#guestbook-form-hint");
const GUESTBOOK_STORAGE_KEY = "gijang-travel-notebook-guestbook-v1";
let editingEntryId = null;

function loadGuestbookEntries() {
  try {
    const saved = localStorage.getItem(GUESTBOOK_STORAGE_KEY);
    const entries = saved ? JSON.parse(saved) : [];
    return Array.isArray(entries) ? entries : [];
  } catch (error) {
    return [];
  }
}

function saveGuestbookEntries(entries) {
  try {
    localStorage.setItem(GUESTBOOK_STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    alert("브라우저 저장 공간에 기록을 저장하지 못했어요. 브라우저 설정을 확인해 주세요.");
    return false;
  }
}

function formatGuestbookDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
}

function renderGuestbook() {
  const entries = loadGuestbookEntries().sort((a, b) => b.updatedAt - a.updatedAt);
  guestbookCount.textContent = `${entries.length}개의 기록`;
  guestbookList.replaceChildren();

  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "guestbook-empty";
    empty.textContent = "아직 남겨진 기록이 없어요. 첫 번째 여행 메모를 남겨 보세요!";
    guestbookList.append(empty);
    return;
  }

  entries.forEach(entry => {
    const card = document.createElement("article");
    card.className = "guestbook-entry";

    const top = document.createElement("div");
    top.className = "guestbook-entry-top";
    const name = document.createElement("span");
    name.className = "guestbook-entry-name";
    name.textContent = entry.name;
    const date = document.createElement("time");
    date.className = "guestbook-entry-date";
    date.dateTime = new Date(entry.updatedAt).toISOString();
    date.textContent = `${formatGuestbookDate(entry.updatedAt)}${entry.createdAt !== entry.updatedAt ? " (수정됨)" : ""}`;
    top.append(name, date);

    const place = document.createElement("p");
    place.className = "guestbook-entry-place";
    place.textContent = entry.place || "일반 여행 소감";

    const message = document.createElement("p");
    message.className = "guestbook-entry-message";
    message.textContent = entry.message;

    const actions = document.createElement("div");
    actions.className = "guestbook-entry-actions";
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "수정";
    editButton.addEventListener("click", () => {
      editingEntryId = entry.id;
      guestPlaceInput.value = entry.placeValue || "";
      guestNameInput.value = entry.name;
      guestMessageInput.value = entry.message;
      guestbookSubmit.textContent = "수정 내용 저장";
      cancelEditButton.hidden = false;
      guestbookFormHint.textContent = "수정할 내용을 바꾼 뒤 저장해 주세요.";
      guestbookForm.scrollIntoView({ behavior: "smooth", block: "center" });
      guestNameInput.focus();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "삭제";
    deleteButton.addEventListener("click", () => {
      if (!confirm("이 방명록 기록을 삭제할까요?")) return;
      const nextEntries = loadGuestbookEntries().filter(item => item.id !== entry.id);
      if (saveGuestbookEntries(nextEntries)) {
        if (editingEntryId === entry.id) resetGuestbookForm();
        renderGuestbook();
      }
    });

    actions.append(editButton, deleteButton);
    card.append(top, place, message, actions);
    guestbookList.append(card);
  });
}

function resetGuestbookForm() {
  editingEntryId = null;
  guestbookForm.reset();
  guestbookSubmit.textContent = "기록 저장하기 ✎";
  cancelEditButton.hidden = true;
  guestbookFormHint.textContent = "최대 500자까지 작성할 수 있어요.";
}

guestbookForm.addEventListener("submit", event => {
  event.preventDefault();
  const placeValue = guestPlaceInput.value;
  const name = guestNameInput.value.trim();
  const message = guestMessageInput.value.trim();
  if (!name || !message) {
    alert("이름과 방명록 내용을 입력해 주세요. 장소 선택은 선택 사항입니다.");
    return;
  }

  const entries = loadGuestbookEntries();
  const now = Date.now();
  const [placeCategory, placeName] = placeValue ? placeValue.split("|") : ["", ""];
  const place = placeValue ? `${placeCategory} · ${placeName}` : "일반 여행 소감";

  if (editingEntryId !== null) {
    const index = entries.findIndex(entry => entry.id === editingEntryId);
    if (index === -1) {
      alert("수정할 기록을 찾지 못했어요. 목록을 새로 확인해 주세요.");
      resetGuestbookForm();
      renderGuestbook();
      return;
    }
    entries[index] = { ...entries[index], place, placeValue, name, message, updatedAt: now };
  } else {
    entries.push({
      id: `${now}-${Math.random().toString(36).slice(2, 9)}`,
      place, placeValue, name, message, createdAt: now, updatedAt: now
    });
  }

  if (saveGuestbookEntries(entries)) {
    resetGuestbookForm();
    renderGuestbook();
  }
});

cancelEditButton.addEventListener("click", resetGuestbookForm);
renderGuestbook();


// 표지의 영어 도장(BUSAN / TRAVEL / NOTE)을 눌렀을 때 실행되는 미니게임입니다.
(() => {
  // 게임 화면과 조작 요소를 HTML에서 찾아옵니다.
  const opener = document.querySelector('#open-ant-game');
  const overlay = document.querySelector('#ant-game');
  const closer = document.querySelector('#close-ant-game');
  const backButton = document.querySelector('#game-back');
  const playground = document.querySelector('#ant-playground');
  const scoreLabel = document.querySelector('#ant-score');
  const timeLabel = document.querySelector('#ant-time');
  const message = document.querySelector('#ant-game-message');
  const restart = document.querySelector('#ant-restart');

  // 필요한 HTML 요소가 없으면 오류가 나지 않도록 게임 초기화를 멈춥니다.
  if (!opener || !overlay || !playground || !scoreLabel || !timeLabel) return;

  // 게임 진행 상태를 저장하는 변수들입니다.
  let score = 0;
  let seconds = 20;
  let timer = null;
  let spawnTimer = null;
  let running = false;

  // 게임에 사용 중인 모든 개미의 이동 타이머를 추적합니다.
  const crawlTimers = new Map();

  // 게임에 사용 중인 타이머를 모두 정리해 중복 실행을 막습니다.
  function stopTimers() {
    if (timer) window.clearInterval(timer);
    if (spawnTimer) window.clearInterval(spawnTimer);
    timer = null;
    spawnTimer = null;
    crawlTimers.forEach(intervalId => window.clearTimeout(intervalId));
    crawlTimers.clear();
  }

  // 개미가 영역 밖으로 나가지 않도록 좌표를 제한합니다.
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // 개미 한 마리를 임의의 위치에 만들고 불규칙하게 기어 다니게 합니다.
  function addAnt() {
    if (!running) return;

    // 클릭할 수 있는 작은 버튼을 만들고 검은 개미 모양은 CSS로 그립니다.
    const ant = document.createElement('button');
    ant.type = 'button';
    ant.className = 'ant-bug';
    ant.setAttribute('aria-label', '작은 검은 개미 잡기');
    ant.title = '개미 잡기';

    // 플레이 영역 크기를 확인하고 개미가 들어갈 수 있는 좌표를 계산합니다.
    const maxX = Math.max(0, playground.clientWidth - 28);
    const maxY = Math.max(0, playground.clientHeight - 24);
    let x = Math.random() * maxX;
    let y = Math.random() * maxY;
    ant.style.left = `${x}px`;
    ant.style.top = `${y}px`;
    ant.style.transform = `rotate(${Math.random() * 360}deg)`;
    playground.append(ant);

    // 개미가 한 번에 멀리 점프하지 않고 짧은 거리로 방향을 바꾸며 움직입니다.
    function crawl() {
      if (!running || !ant.isConnected || ant.classList.contains('squashed')) {
        crawlTimers.delete(ant);
        return;
      }
      const boundsX = Math.max(0, playground.clientWidth - 28);
      const boundsY = Math.max(0, playground.clientHeight - 24);
      const stepX = (Math.random() - 0.5) * (18 + Math.random() * 42);
      const stepY = (Math.random() - 0.5) * (18 + Math.random() * 42);
      x = clamp(x + stepX, 0, boundsX);
      y = clamp(y + stepY, 0, boundsY);
      ant.style.left = `${x}px`;
      ant.style.top = `${y}px`;
      // 진행 방향과 회전 각도를 조금씩 바꿔 실제 기어 다니는 느낌을 줍니다.
      const angle = Math.atan2(stepY, stepX) * (180 / Math.PI);
      ant.style.transform = `rotate(${angle}deg)`;
      // 이동 간격도 무작위로 바꿔 일정한 패턴으로 움직이지 않게 합니다.
      const nextMove = window.setTimeout(crawl, 180 + Math.random() * 380);
      crawlTimers.set(ant, nextMove);
    }
    const firstMove = window.setTimeout(crawl, 180 + Math.random() * 250);
    crawlTimers.set(ant, firstMove);

    // 개미를 클릭하면 종이로 때리는 효과를 표시하고 점수를 올립니다.
    ant.addEventListener('click', event => {
      if (!running || ant.classList.contains('squashed')) return;
      const rect = playground.getBoundingClientRect();
      const swat = document.createElement('span');
      swat.className = 'paper-swat';
      swat.setAttribute('aria-hidden', 'true');
      swat.style.left = `${event.clientX - rect.left - 30}px`;
      swat.style.top = `${event.clientY - rect.top - 21}px`;
      playground.append(swat);
      ant.classList.add('squashed');
      score += 1;
      scoreLabel.textContent = String(score);
      message.textContent = ['탁! 잘 잡으셨어요!', '한 마리 퇴치 완료!', '노트가 깨끗해지고 있어요!'][score % 3];
      const crawlTimer = crawlTimers.get(ant);
      if (crawlTimer) window.clearTimeout(crawlTimer);
      crawlTimers.delete(ant);
      window.setTimeout(() => { ant.remove(); swat.remove(); }, 300);
    });
  }

  // 제한 시간이 끝나면 개미 이동을 멈추고 최종 점수를 보여줍니다.
  function endGame() {
    running = false;
    stopTimers();
    playground.querySelectorAll('.ant-bug').forEach(ant => ant.remove());
    message.textContent = `시간 종료! ${score}마리를 잡으셨어요. 다시 도전해 보세요!`;
  }

  // 점수와 시간을 초기화하고 새 게임을 시작합니다.
  function startGame() {
    stopTimers();
    score = 0;
    seconds = 20;
    running = true;
    scoreLabel.textContent = '0';
    timeLabel.textContent = '20';
    message.textContent = '작은 검은 개미를 잡아 보세요!';
    playground.replaceChildren();

    // 시작할 때 개미 몇 마리를 만들고, 빈자리가 생기면 새 개미를 추가합니다.
    for (let i = 0; i < 5; i += 1) addAnt();
    spawnTimer = window.setInterval(() => {
      if (playground.querySelectorAll('.ant-bug:not(.squashed)').length < 9) addAnt();
    }, 850);

    // 1초마다 남은 시간을 줄이고 0초가 되면 게임을 종료합니다.
    timer = window.setInterval(() => {
      seconds -= 1;
      timeLabel.textContent = String(seconds);
      if (seconds <= 0) endGame();
    }, 1000);
  }

  // 영어 도장 버튼을 누르면 목차와 노트를 밀어내고 게임 화면을 보여줍니다.
  function openGame(event) {
    event.preventDefault();
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('ant-game-active');
    startGame();
    if (closer) closer.focus();
  }

  // 닫기 버튼으로 노트 화면을 복원하고 모든 게임 타이머를 정리합니다.
  function closeGame() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('ant-game-active');
    running = false;
    stopTimers();
    opener.focus();
  }

  // 도장 버튼과 게임 화면의 닫기/돌아가기/다시 시작 버튼을 연결합니다.
  opener.addEventListener('click', openGame);
  if (closer) closer.addEventListener('click', closeGame);
  if (backButton) backButton.addEventListener('click', closeGame);
  if (restart) restart.addEventListener('click', startGame);

  // 게임 화면의 바깥쪽을 누르면 노트로 돌아갑니다.
  overlay.addEventListener('click', event => {
    if (event.target === overlay) closeGame();
  });

  // Escape 키를 눌러도 게임을 닫을 수 있습니다.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay.classList.contains('open')) closeGame();
  });
})();
