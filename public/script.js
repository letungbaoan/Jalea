$(document).ready(function() {
	var initialContent = {};
	$('.tab-pane').each(function() {
	  var id = $(this).attr('id');
	  initialContent[id] = $(this).html();
	});
	
	$('.nav-link').click(function(e) {
	  e.preventDefault();
	  
	  var target = $(this).attr('href');
	  
	  $('.nav-link').removeClass('active');
	  
	  $(this).addClass('active');
	  
	  $('.tab-pane').removeClass('show active');
	  
	  $(target).addClass('show active');
	  
	  $(target).html(initialContent[target.slice(1)]);
	  
	  $(target).trigger('shown.bs.tab');
	});
	
	$('.tab-pane').on('shown.bs.tab', function() {
	  handleFunction()
	  $('body').css('background', 'white');
	});
  });

$(document).ready(function() {
	handleFunction();
})


function handleFunction() {
	// Quiz
	function buildQuizForm(quizData) {
		var questionsContainer = $('.form_quiz');
		questionsContainer.empty();
		var color = '#ffa8ac';
		$('body').css('background', color);
		$('#side-bar').css('background', 'white');
		var answers =[];
	
		quizData.result.forEach(function (question, index) { 
		  var questionHtml = `
			<div class="question">
			  <h3>Question ${index + 1}:</h3>
			  <p>${question.question}</p>
			  <div class="choices">
				<label>
				  <input type="radio" name="answer_${index}" value="choice_1">
				  ${question.choices.choice_1}
				</label>
				<label>
				  <input type="radio" name="answer_${index}" value="choice_2">
				  ${question.choices.choice_2}
				</label>
				<label>
				  <input type="radio" name="answer_${index}" value="choice_3">
				  ${question.choices.choice_3}
				</label>
				<label>
				  <input type="radio" name="answer_${index}" value="choice_4">
				  ${question.choices.choice_4}
				</label>
			  </div>
			</div>
		  `;
		  questionsContainer.append(questionHtml);
		  answers.push(question.answer)
		});
	
		var submitHtml = `
			<button id="submitBtn">Submit</button>
		`
		questionsContainer.append(submitHtml)
		questionsContainer.append(`
			<div class="answerSheet"></div>
		`)

		$('#submitBtn').click(function(e) {
				e.preventDefault();
				answers.forEach(function (answer,index) {
					switch (answer) {
						case 1:
							var answer_$ = 'A'
							break;
						case 2:
							var answer_$ = 'B'
							break;
						case 3:
							var answer_$ = 'C'
							break;
						case 4:
							var answer_$ = 'D'
							break;
						default:
							break;
					}
					var answerSheet = `
						<div class="answer">
							<p>${index+1}.${answer_$}</p>
						  </div>
						`
					$('.answerSheet').append(answerSheet)
				})
				$('#submitBtn').addClass('disabledBtn')
				$('.answerSheet').css({
					'border-style': 'solid',
					'border-color': 'white',
					'border-width': '1px',
				});
				$(e.target).prop('disabled', true)
			})
	}
	
	$('#getBtn').click(function (e) {
		e.preventDefault()
		var numberOfQuiz = $('#number_of_quiz').val()
		var level = $('input[name="level"]:checked').val()
		var type_of_quiz = $('input[name="type_of_quiz"]:checked').val()

		$.ajax({
			url: 'http://localhost:4000/quiz',
			method: 'GET',
			data: {
				number_of_quiz: numberOfQuiz,
				level: level,
				type_of_quiz: type_of_quiz
			},
			success: function (response) {
			    buildQuizForm(response)
			},
			error: function (error) {
				console.log(error)
			}
		})
	})

	// ChatBot
	function getBotResponse() {
		var rawText = $('#textInput').val()
		var userHtml = '<div class="userText_container"><p class="userText"><span>' + rawText + '</span></p></div>'
		$('#textInput').val('')
		$('#chatbox').append(userHtml)
		$('#userInput').scrollIntoView({ block: 'start', behavior: 'smooth' })
		$.get('/get', { msg: rawText }).done(function (data) {
			var botHtml = '<p class="botText"><span>' + data + '</span></p>'
			$('#chatbox').append(botHtml)
			$('#userInput').scrollIntoView({ block: 'start', behavior: 'smooth' })
		})
	}
	$('#textInput').keypress(function (e) {
		if (e.which == 13) {
			getBotResponse()
		}
	})
	$('#buttonInput').click(function () {
		getBotResponse()
	})
	//Explain sentence
	function buildExplainForm(data) {
		var explainData = data.result.choices[0].message.content;		
		$("#result").val(explainData);
	}

	$('#typing_sentence').keypress(function (e) {
		if (e.which == 13) {
			e.preventDefault()
			var sentence = e.target.value
		
			$.ajax({
				url: 'http://localhost:4000/explainSentence',
				method: 'GET',
				data: {
					sentence:sentence
				},
				success: function (response) {
					buildExplainForm(response)
				},
				error: function (error) {
					console.log(error)
				}
			})
		} })
}

