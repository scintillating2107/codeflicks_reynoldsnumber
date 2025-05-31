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
    question: "1. What does the Reynolds number primarily determine in a fluid flow system?",
    answers: {
      a: "Fluid temperature",
      b: "Flow resistance",
      c: "Type of flow (laminar, transitional, turbulent)",
      d: "Density of the fluid"
    },
    correctAnswer: "c"
  },

  {
    question: "2. Which of the following factors does NOT affect the Reynolds number?",
    answers: {
      a: "Viscosity of the fluid",
      b: "Density of the fluid",
      c: "Gravitational acceleration",
      d: "Velocity of the fluid"
    },
    correctAnswer: "c"
  },

  {
    question: "3. If the Reynolds number is less than 2000, the flow is considered to be:",
    answers: {
      a: "Transitional",
      b: "Laminar",
      c: "Turbulent",
      d: "Supersonic"
    },
    correctAnswer: "b"
  },

  {
    question: "4. In the formula Re = (ρ × v × D) / μ, what does D represent?",
    answers: {
      a: "Diameter of the pipe or tube",
      b: "Density of the fluid",
      c: "Distance traveled by the fluid",
      d: "Depth of the fluid"
    },
    correctAnswer: "a"
  },

  {
    question: "5. Which of the following is an example of turbulent flow?",
    answers: {
      a: "Blood flow in capillaries",
      b: "Flow of oil through a narrow pipe",
      c: "Smoke rising from a candle",
      d: "Water flowing rapidly through a large river"
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
