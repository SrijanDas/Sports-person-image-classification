Dropzone.autoDiscover = false;
const sportsPersons = ["Ronaldo", "Conor", "Kohli", "Messi", "Khabib", "Kane"];

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
          <h5 class="card-title">${person}</h5>
        </div>
      </div>
      <p id="${person}-percentage" class="card__percentage text-center"></p>
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
  });

  dz.on("addedfile", function () {
    if (dz.files[1] != null) {
      dz.removeFile(dz.files[0]);
    }
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
          $("#error").show();
          return;
        }
        // class_dictionary:
        // conor_mcgregor: 0
        // cristiano_ronaldo: 1
        // kane williamson: 2
        // khabib: 3
        // lionel_messi: 4
        // virat_kohli: 5

        let players = [
          "conor_mcgregor",
          "cristiano_ronaldo",
          "kane_williamson",
          "khabib",
          "lionel_messi",
          "virat_kohli",
        ];

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
          $("#error").hide();
          $("#resultHolder").show();
          $("#divClassTable").show();
          $("#resultHolder").html($(`[data-player="${match.class}"`).html());
          let classDictionary = match.class_dictionary;
          for (let personName in classDictionary) {
            let index = classDictionary[personName];
            let proabilityScore = match.class_probability[index];
            let elementName = "#score_" + personName;
            $(elementName).html(proabilityScore);
          }
        }
        dz.removeFile(file);
      }
    );
  });

  $("#submitBtn").on("click", function (e) {
    dz.processQueue();
  });
}
