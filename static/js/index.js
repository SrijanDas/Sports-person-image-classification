Dropzone.autoDiscover = false;
const sportsPersons = [
  "cristiano_ronaldo",
  "conor_mcgregor",
  "virat_kohli",
  "lionel_messi",
  "khabib",
  "kane_williamson",
];

$(document).ready(function () {
  $("#error").hide();
  $("#resultHolder").hide();
  $("#divClassTable").hide();
  loadCards();
  init();
});

function loadCards() {
  const cardsContainer = $("#cards-container");
  sportsPersons.forEach((person) => {
    cardsContainer.append(`
    <div class="col">
      <div id=${person} class="card shadow" style="max-width: 500px">
        <div class="card-body">
          <img
            src="/static/img/${person}.jpg"
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

    var url = "http://localhost:5000/classify_image";

    $.post(
      url,
      {
        image_data: imageData,
      },
      function (data, status) {
        console.log(data);
        if (!data || data.length == 0) {
          $("#resultHolder").hide();
          $("#divClassTable").hide();
          $("#submitBtn").html("Classify");
          $("#error").show();
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
          $("#resultHolder").html(`<h5>${personDetected}</h5>`);
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
      }
    );
  });

  $("#submitBtn").on("click", function (e) {
    $(this).attr("disabled", true);
    $(this).html(`
    <div class="spinner-border spinner-border-sm text-light" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    `);
    dz.processQueue();
  });
}

// loads card background color
function loadCardBg(personDetected, personName, proabilityScore) {
  if (personDetected === personName) {
    $("#" + personName).css(
      "background",
      `linear-gradient(90deg, #20c997 ${Math.ceil(
        proabilityScore
      )}%, white 50%)`
    );
  } else {
    $("#" + personName).css(
      "background",
      `linear-gradient(90deg, #9EEAF9 ${Math.ceil(proabilityScore)}%, white $)`
    );
  }
}
