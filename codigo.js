"use strict";

const isTouchDevice = "ontouchstart" in window ?? navigator.maxTouchPoints > 0;

// const my_sentence = 'This is an example of drag and drop using pure JavaScript'
// const my_sentence = "This is an _ of drag and drop";
const my_sentence = 'This is an _ of drag and _ using _ JavaScript'

let droppedWords = [];

updateSentence();
updateOptions();

function updateSentence() {
  const sentence = document.querySelector("#sentence");
  if (sentence) {
    sentence.innerHTML = '';
    const words = my_sentence.split(" ").map((word, index) => {
      if (word === "_") {
        const dropZone = document.createElement("div");
        checkDroppedWords(dropZone);
        dropZone.classList.add("drop-zone");
        dropZone.setAttribute("zone-id", index + 1);

        dropZone.addEventListener("dragover", (event) => {
          event.preventDefault();
          dropZone.classList.add("dragging-over");
        });

        dropZone.addEventListener("dragleave", (event) => {
          event.preventDefault();
          dropZone.classList.remove("dragging-over");
        });

        dropZone.addEventListener("drop", (event) => {
          event.preventDefault();
          dropZone.classList.remove("dragging-over");
          const word = event.dataTransfer.getData("word");

          const droppedZone = droppedWords.find((z) => z.zoneId === index + 1);
          if (droppedZone) {
            droppedZone.word = JSON.parse(word);
            droppedWords.map((z) => (z.zoneId === index + 1 ? droppedZone : z));
          } else {
            droppedWords.push({
              word: JSON.parse(word),
              zoneId: index + 1,
            });
          }
          event.dataTransfer.clearData();

          checkDroppedWords(dropZone);

          updateOptions();
        });

        function checkDroppedWords(dropZone) {
          if (droppedWords.find((z) => z.zoneId === index + 1)) {
            dropZone.style.padding = "10px 10px";
            dropZone.style.width = "max-content";

            const word = droppedWords.find((z) => z.zoneId === index + 1);
            const droppedWord = document.createElement("div");
            droppedWord.classList.add("dropped-word");
            droppedWord.textContent = word.word.word;

            // quitar la palabra ararstrada
            const span = document.createElement("span");
            span.textContent = "x";
            span.style.position = "absolute";
            span.style.padding = "4px";
            span.style.borderRadius = "100%";
            span.style.borderRadius = "100%";
            span.style.width = "15px";
            span.style.height = "15px";
            span.style.lineHeight = "5px";
            span.style.fontSize = "15px";
            span.style.color = "white";
            span.style.cursor = "pointer";
            span.style.transform = "translate(0px, -15px)";
            span.style.background = "rgba(255, 0, 0, 0.5)";

            span.addEventListener("click", () => {
              droppedWords = droppedWords.filter((z) => z.zoneId !== index + 1);
              updateOptions();
              sentence.innerHTML = "";
              updateSentence();
            });

            droppedWord.appendChild(span);

            dropZone.innerHTML = "";
            dropZone.appendChild(droppedWord);
          }
        }

        return dropZone;
      }
      const span = document.createElement("span");
      span.textContent = word;
      return span;
    });

    sentence.append(...words);
  }
}

function updateOptions() {
  const WORDS = [
    { word: "example", id: 1 },
    { word: "drop", id: 2 },
    { word: "pure", id: 3 },
  ];

  const containerOptions = document.querySelector(".container-options");
  if (containerOptions) {
    containerOptions.innerHTML = "";
    WORDS.forEach((word) => {
      if (droppedWords.find((z) => z.word.id === word.id)) {
        return;
      }
      const div = document.createElement("div");
      div.classList.add("draggable");
      div.setAttribute("draggable", true);
      div.setAttribute("data-word", JSON.stringify({ word: word.word, id: word.id }));
      div.textContent = word.word;

      div.addEventListener("dragstart", (evt) => {
        div.classList.add("dragging");
        evt.dataTransfer.setData("word", JSON.stringify({ word: div.textContent, id: word.id }));
      });

      div.addEventListener("dragend", () => {
        div.classList.remove("dragging");
      });
      containerOptions.appendChild(div);
    });
    dragInTouchScreen();
  }
}

function dragInTouchScreen() {
  const draggables = document.querySelectorAll(".draggable");
  if (draggables) {
    draggables.forEach((draggable) => {
      let initialPosition = { x: 0, y: 0 };

      initialPosition.x = draggable.getBoundingClientRect().x;
      initialPosition.y = draggable.getBoundingClientRect().y;

      if (isTouchDevice) {
        draggable.addEventListener("touchstart", (evt) => {
          evt.preventDefault();
          draggable.classList.add("dragging");
          draggable.setAttribute("data-x", evt.touches[0].clientX - draggable.offsetLeft);
          draggable.setAttribute("data-y", evt.touches[0].clientY - draggable.offsetTop);
        });

        draggable.addEventListener("touchmove", (evt) => {
          // evt.preventDefault();
          // draggable.style.left = evt.touches[0].clientX - draggable.getAttribute("data-x") + "px";
          // draggable.style.top = evt.touches[0].clientY - draggable.getAttribute("data-y") + "px";
          if (evt.targetTouches.length == 1) {
            var touch = evt.targetTouches[0];
            // Place element where the finger is
            draggable.style.position = "absolute";
            draggable.style.left = touch.pageX + "px";
            draggable.style.top = touch.pageY + "px";
          }
        });

        draggable.addEventListener("touchend", (evt) => {
          draggable.classList.remove("dragging");

          const touch = evt.changedTouches[0];
          const touchX = touch.clientX;
          const touchY = touch.clientY;

          const dropZones = document.querySelectorAll(".drop-zone");
          dropZones.forEach((dropZone) => {
            const dropZoneRect = dropZone.getBoundingClientRect();
            // const draggableRect = draggable.getBoundingClientRect();

            // const isInDropZone =
            //   draggableRect.left >= dropZoneRect.left &&
            //   draggableRect.right <= dropZoneRect.right &&
            //   draggableRect.top >= dropZoneRect.top &&
            //   draggableRect.bottom <= dropZoneRect.bottom;

            const isTouchInDropZone =
              touchX >= dropZoneRect.left &&
              touchX <= dropZoneRect.right &&
              touchY >= dropZoneRect.top &&
              touchY <= dropZoneRect.bottom;

            if (isTouchInDropZone) {
              const zoneId = dropZone.getAttribute("zone-id");
              const word = draggable.getAttribute("data-word");
              const droppedZone = droppedWords.find((z) => z.zoneId === parseInt(zoneId));
              if (droppedZone) {
                droppedZone.word = JSON.parse(word);
                droppedWords.map((z) => (z.zoneId === parseInt(zoneId) ? droppedZone : z));
              } else {
                droppedWords.push({
                  word: JSON.parse(word),
                  zoneId: parseInt(zoneId),
                });
              }
              draggable.remove();
              updateSentence();
            } else {
              draggable.style.position = "static";
              draggable.style.left = initialPosition.x + "px";
              draggable.style.top = initialPosition.y + "px";
            }
          });
        });
      }
    });
  }
}

const aceptar = document.querySelector("#btn-accept");
if (aceptar) {
  aceptar.addEventListener("click", () => {
    const response = document.querySelector("#response");
    if (response) {
      response.textContent = JSON.stringify(droppedWords, null, 2);
    }
  });
}
