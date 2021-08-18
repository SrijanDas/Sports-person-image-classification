Dropzone.autoDiscover = false;

// change this varibale to "production" when deploying
const env = "production";

const sportsPersons = [
  "cristiano_ronaldo",
  "conor_mcgregor",
  "virat_kohli",
  "lionel_messi",
  "khabib",
  "kane_williamson",
];

$(document).ready(function () {
  $("#content").hide();
  $("#pageLoader").show();
  window.setTimeout(() => {
    $("#content").show();
    $("#pageLoader").hide();
  }, 400);

  $("#error").hide();
  $("#resultHolder").hide();
  $("#divClassTable").hide();
  loadCards();
  init();
});

function loadCards() {
  const cardsContainer = $("#cards-container");
  cardsContainer.html("");
  sportsPersons.forEach((person) => {
    cardsContainer.append(`
    <div class="col">
      <div id=${person} class="card shadow" style="max-width: 500px">  
      <div class="card-body">
          <img
            src="./img/${person}.jpg"
            class="card-img img-fluid"
            alt="..."
          />
          <h5 class="card-title">${person.replace("_", " ")}</h5>
        </div>
      </div>
      <p id="card_score_${person}" class="card__percentage text-center mt-2"></p>
    </div>
    `);
  });
}

function init() {
  let dz = new Dropzone("#dropzone", {
    url: "/",
    maxFiles: 1,
    addRemoveLinks: true,
    dictDefaultMessage: "Some Message",
    autoProcessQueue: false,
    acceptedFiles: "image/*",
  });

  dz.on("addedfile", function () {
    if (dz.files[1] != null) {
      dz.removeFile(dz.files[0]);
    }
    $("#submitBtn").removeAttr("disabled");
  });

  dz.on("complete", function (file) {
    let imageData = file.dataURL;

    if (env == "production") {
      var url = "https://sports-person-classify.herokuapp.com/classify_image";
    } else {
      var url = "http://localhost:5000/classify_image";
    }

    $.post(
      url,
      {
        headers: { "Access-Control-Allow-Origin": "*" },
        image_data: imageData,
      },
      function (data, status) {
        // console.log(data);
        if (!data || data.length == 0) {
          $("#resultHolder").hide();
          $("#divClassTable").hide();
          $("#submitBtn").html("Classify");
          $("#error").show();
          $("#myModal").modal("hide");
          loadCards();
          dz.removeFile(file);
          return;
        }
        // class_dictionary:
        // conor_mcgregor: 0
        // cristiano_ronaldo: 1
        // kane williamson: 2
        // khabib: 3
        // lionel_messi: 4
        // virat_kohli: 5

        let match = null;
        let bestScore = -1;
        for (let i = 0; i < data.length; ++i) {
          let maxScoreForThisClass = Math.max(...data[i].class_probability);
          if (maxScoreForThisClass > bestScore) {
            match = data[i];
            bestScore = maxScoreForThisClass;
          }
        }
        if (match) {
          let personDetected = match.class;
          $("#error").hide();
          $("#resultHolder").show();
          $("#divClassTable").show();

          // setting result name and image
          $("#resultHolder").html(`
          <img id="result-img" class="mx-auto d-block" src=${imageData} alt="."/>
          <h5 id="result-name" class="mt-2 fs-2 text-center">${personDetected.replace(
            "_",
            " "
          )}</h5>
          `);

          // setting probability
          let classDictionary = match.class_dictionary;

          for (let personName in classDictionary) {
            let index = classDictionary[personName];
            let proabilityScore = match.class_probability[index];
            let elementName = "#score_" + personName;
            let cardScore = "#card_score_" + personName;

            // setting card bg
            loadCardBg(personDetected, personName, proabilityScore);

            $(elementName).html(proabilityScore);
            $(cardScore).html(proabilityScore + "%");
          }
        }
        dz.removeFile(file);

        $("#submitBtn").html("Classify");
        $("#myModal").modal("hide");
      }
    );
  });

  $("#submitBtn").on("click", function (e) {
    $("#match-tick").remove();
    $(this).attr("disabled", true);
    $(this).html(`
    <div class="spinner-border spinner-border-sm text-light" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    `);
    $("#myModal").modal("show");
    dz.processQueue();
  });
}

// loads card background color
function loadCardBg(personDetected, personName, proabilityScore) {
  const bgWidth = Math.ceil(proabilityScore);

  // setting matched card styles
  if (personDetected === personName) {
    const matchedCard = document.getElementById(personName);
    // setting tick for matched card
    let tickSpan = document.createElement("span");
    tickSpan.innerHTML = `  
    <span id="match-tick" class="position-absolute top-0 start-100 translate-middle rounded-circle">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-check-circle text-success" viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
    </svg>
    <span class="visually-hidden">unread messages</span>
  </span>
    `;
    matchedCard.append(tickSpan);

    // prob score of matched card
    $("#card_score_" + personName).css({
      color: "#20c997",
      fontWeight: "600",
      fontSize: "larger",
    });

    $(`#${personName}`).css({
      background: `linear-gradient(90deg, #20c997 ${bgWidth}%, white 0%)`,
      border: "3px solid #20c997",
    });
  } else {
    $("#" + personName).css({
      background: `linear-gradient(90deg, #9EEAF9 ${bgWidth}%, white 0%)`,
      border: "none",
    });
    $("#card_score_" + personName).css({
      color: "black",
      fontWeight: "",
      fontSize: "",
    });
  }
}
