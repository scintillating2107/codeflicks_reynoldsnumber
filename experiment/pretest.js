/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the below code ////////////////////////

/////////////////////////////////////////////////////////////////////////////

(function() {
  function buildQuiz() {
    // we'll need a place to store the HTML output
    const output = [];

    // for each question...
    myQuestions.forEach((currentQuestion, questionNumber) => {
      // we'll want to store the list of answer choices
      const answers = [];

      // and for each available answer...
      for (letter in currentQuestion.answers) {
        // ...add an HTML radio button
        answers.push(
          `<label>
            <input type="radio" name="question${questionNumber}" value="${letter}">
            ${letter} :
            ${currentQuestion.answers[letter]}
          </label>`
        );
      }

      // add this question and its answers to the output
      output.push(
        `<div class="question"> ${currentQuestion.question} </div>
        <div class="answers"> ${answers.join("")} </div>`
      );
    });

    // finally combine our output list into one string of HTML and put it on the page
    quizContainer.innerHTML = output.join("");
  }

  function showResults() {
    // gather answer containers from our quiz
    const answerContainers = quizContainer.querySelectorAll(".answers");

    // keep track of user's answers
    let numCorrect = 0;

    // for each question...
    myQuestions.forEach((currentQuestion, questionNumber) => {
      // find selected answer
      const answerContainer = answerContainers[questionNumber];
      const selector = `input[name=question${questionNumber}]:checked`;
      const userAnswer = (answerContainer.querySelector(selector) || {}).value;

      // if answer is correct
      if (userAnswer === currentQuestion.correctAnswer) {
        // add to the number of correct answers
        numCorrect++;

        // color the answers green
        //answerContainers[questionNumber].style.color = "lightgreen";
      } else {
        // if answer is wrong or blank
        // color the answers red
        answerContainers[questionNumber].style.color = "red";
      }
    });

    // show number of correct answers out of total
    resultsContainer.innerHTML = `${numCorrect} out of ${myQuestions.length}`;
  }

  const quizContainer = document.getElementById("quiz");
  const resultsContainer = document.getElementById("results");
  const submitButton = document.getElementById("submit");
 

/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the above code ////////////////////////

/////////////////////////////////////////////////////////////////////////////






/////////////// Write the MCQ below in the exactly same described format ///////////////

const myQuestions = [
  {
    question: "1. When the Reynolds number is between 2000 and 4000, the flow is considered:",
    answers: {
      a: "Laminar",
      b: "Turbulent",
      c: "Transitional",
      d: "Chaotic"
    },
    correctAnswer: "c"
  },

  {
    question: "2. Reynolds number is a dimensionless quantity because:",
    answers: {
      a: "Its units cancel out during calculation",
      b: "It has no physical meaning",
      c: "It is only used for gases",
      d: "It represents time"
    },
    correctAnswer: "a"
  },

  {
    question: "3. What happens to Reynolds number if the velocity of the fluid is doubled (keeping all other parameters constant)?",
    answers: {
      a: "It becomes half",
      b: "It remains unchanged",
      c: "It becomes double",
      d: "It becomes four times"
    },
    correctAnswer: "c"
  },

  {
    question: "4. Which of the following flow conditions is most likely to cause vibration and noise in pipelines?",
    answers: {
      a: "Laminar flow",
      b: "Turbulent flow",
      c: "Transitional flow",
      d: "Static flow"
    },
    correctAnswer: "b"
  },

  {
    question: "5. Which parameter change is most effective in converting turbulent flow into laminar flow?",
    answers: {
      a: "Increasing velocity",
      b: "Decreasing fluid density",
      c: "Increasing pipe diameter",
      d: "Increasing fluid viscosity"
    },
    correctAnswer: "d"
  }
];

  
/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the below code ////////////////////////

/////////////////////////////////////////////////////////////////////////////


  // display quiz right away
  buildQuiz();

  // on submit, show results
  submitButton.addEventListener("click", showResults);
})();


/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the above code ////////////////////////

/////////////////////////////////////////////////////////////////////////////
