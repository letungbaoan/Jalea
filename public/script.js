$(document).ready(function () {
	var initialContent = {}
	$('.tab-pane').each(function () {
		var id = $(this).attr('id')
		initialContent[id] = $(this).html()
	})

	$('.nav-link').click(function (e) {
		e.preventDefault()

		var target = $(this).attr('href')

		$('.nav-link').removeClass('active')

		$(this).addClass('active')

		$('.tab-pane').removeClass('show active')

		$(target).addClass('show active')

		$(target).html(initialContent[target.slice(1)])

		$(target).trigger('shown.bs.tab')
	})

	$('.tab-pane').on('shown.bs.tab', function () {
		handleFunction()
		$('body').css('background', 'white')
	})
})

$(document).ready(function () {
	handleFunction()
	// Login
	$('#loginBtn').click(function () {
		var userName = $('#userName_Login').val()
		var password = $('#password_Login').val()
		var data = {
			password: password,
			email: userName
		}

		console.log(data)

		$.ajax({
			url: 'http://localhost:4000/login',
			method: 'POST',
			data: data,
			success: function (response) {
				console.log(response)
				$('.modal').css('display', 'none')
				$('#logoutBtn').css('display', 'block')
				//Hiện thông báo đăng nhập thành công
			},
			error: function (error) {
				console.error(error)
				//Hiện thông báo sai tài khoản hoặc mật khẩu
			}
		})
	})
	//Logout
	$('#logoutBtn').click(function (e) {
		location.reload()
	})
})

function handleFunction() {
	// Quiz
	function buildQuizForm(quizData) {
		var questionsContainer = $('.form_quiz')
		questionsContainer.empty()
		var color = '#ffa8ac'
		$('body').css('background', color)
		$('#side-bar').css('background', 'white')
		var answers = []

		quizData.result.forEach(function (question, index) {
			var questionHtml = `
			<div class="question">
			  <h3>Question ${index + 1}:</h3>
			  <p>${question.question}</p>
			  <div class="choices">
				<label>
				  <input type="radio" name="answer_${index}" value="choice_1">
				  ${question.choices.A}
				</label>
				<label>
				  <input type="radio" name="answer_${index}" value="choice_2">
				  ${question.choices.B}
				</label>
				<label>
				  <input type="radio" name="answer_${index}" value="choice_3">
				  ${question.choices.C}
				</label>
				<label>
				  <input type="radio" name="answer_${index}" value="choice_4">
				  ${question.choices.D}
				</label>
			  </div>
			</div>
		  `
			questionsContainer.append(questionHtml)
			answers.push(question.answer)
		})

		var submitHtml = `
			<button id="submitBtn">Submit</button>
		`
		questionsContainer.append(submitHtml)
		questionsContainer.append(`
			<div class="answerSheet"></div>
		`)

		$('#submitBtn').click(function (e) {
			e.preventDefault()
			answers.forEach(function (answer, index) {
				switch (answer) {
					case 'A':
						var answer_$ = 'A'
						break
					case 'B':
						var answer_$ = 'B'
						break
					case 'C':
						var answer_$ = 'C'
						break
					case 'D':
						var answer_$ = 'D'
						break
					default:
						break
				}
				var answerSheet = `
						<div class="answer">
							<p>${index + 1}.${answer_$}</p>
						  </div>
						`
				$('.answerSheet').append(answerSheet)
			})
			$('#submitBtn').addClass('disabledBtn')
			$('.answerSheet').css({
				'border-style': 'solid',
				'border-color': 'white',
				'border-width': '1px'
			})
			$(e.target).prop('disabled', true)
		})
	}

	$('#getBtn').click(function (e) {
		e.preventDefault()
		var numberOfQuiz = $('#number_of_quiz').val()
		var level = $('input[name="level"]:checked').val()
		var type_of_quiz = $('input[name="type_of_quiz"]:checked').val()
		$(e.target).text('')
		$(e.target).append(`
			<span class="spinner-border spinner-border-sm"></span>
		`)

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
		var explainData = data.result.choices[0].message.content
		$('#result').text(explainData)
	}

	$('#typing_sentence').keypress(function (e) {
		if (e.which == 13) {
			e.preventDefault()
			var sentence = e.target.value
			$('#result').val('')

			$.ajax({
				url: 'http://localhost:4000/explainSentence',
				method: 'GET',
				data: {
					sentence: sentence
				},
				success: function (response) {
					buildExplainForm(response)
				},
				error: function (error) {
					console.log(error)
				}
			})

			$(e.target).blur()
		}
	})
	$('#typing_sentence').click(function () {
		$(this).val('')
	})
}
