// Quiz
$('#submitBtn').click(function() {
    var numberOfQuiz = $('#number_of_quiz').val();
    var level = $('#level').val();


    $.ajax({
        url: 'http://localhost:5500/',
        method: 'GET',
        data: {
            number_of_quiz: numberOfQuiz,
            level: level
        },
        success: function(response) {
            $("#result").text(response)
        },
        error: function(error) {
            console.log(error)
        }
    })
})
// ChatBot
function getBotResponse() {
    var rawText = $("#textInput").val();
    var userHtml = '<div class="userText_container"><p class="userText"><span>' + rawText + '</span></p></div>';
    $("#textInput").val("");
    $("#chatbox").append(userHtml);
    $("#userInput").scrollIntoView({block: 'start', behavior: 'smooth'});
    $.get("/get", { msg: rawText }).done(function(data) {
      var botHtml = '<p class="botText"><span>' + data + '</span></p>';
      $("#chatbox").append(botHtml);
      $("#userInput").scrollIntoView({block: 'start', behavior: 'smooth'});
    });
  }
  $("#textInput").keypress(function(e) {
      if(e.which == 13) {
          getBotResponse();
      }
  });
  $("#buttonInput").click(function() {
    getBotResponse();
  })