import "./index.css";
import Quiz from "./components/quiz";
import { sampleQuestions } from "./quiz.js";
import { useState, useEffect } from "react";
import { decode } from "html-entities";
import { clsx } from "clsx";
export default function App() {
  const [questions, setQuestions] = useState([]);
  const [isQuizStarted, SetIsQuizStarted] = useState(false);
  const [isQuizCompleted, SetIsQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(30);

  function reset() {
    SetIsQuizStarted(false);
    SetIsQuizCompleted(false);
    setSelectedAnswers({});
    setRemainingSeconds(30);
    loadQuestions();
  }
  function loadQuestions() {
    setIsLoading(true);

    setTimeout(() => {
      const formattedQuestion = sampleQuestions.map((question) => ({
        ...question,
        answers: [question.correct_answer, ...question.incorrect_answers].sort(
          () => Math.random() - 0.5,
        ),
      }));
      setQuestions(formattedQuestion);
      setIsLoading(false);
    }, 2000);
  }
  useEffect(
    function () {
      if (!isQuizStarted || isQuizCompleted) return;

      const interValid = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interValid);
            SetIsQuizCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [isQuizStarted, isQuizCompleted],
  );
  useEffect(function () {
    loadQuestions();
  }, []);

  const handleSelect = (questionId, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };
  const totalScoreCount = questions.filter(
    (question) =>
      selectedAnswers[question.question] === question.correct_answer,
  ).length;
const minutes = Math.floor(remainingSeconds / 60)
const seconds = remainingSeconds % 60
const timeDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  const quizEl = !isLoading && (
    <>
      <div className="timer">
        <p>{timeDisplay}</p>
      </div>
      {questions.map((question) => (
        <article key={question.question}>
          <h3 className="question">{decode(question.question)}</h3>
          <div className="options">
            {question.answers.map((answer) => {
              const isSelected = selectedAnswers[question.question] === answer;
              const isCorrectAnswer = answer === question.correct_answer;
              return (
                <button
                  onClick={() => handleSelect(question.question, answer)}
                  disabled={isQuizCompleted}
                  key={answer}
                  className={clsx("option", {
                    "bg-highlighted": !isQuizCompleted && isSelected,
                    "bg-incorrect":
                      isQuizCompleted && isSelected &&!isCorrectAnswer,
                    "bg-correct":
                      isQuizCompleted  && isCorrectAnswer,
                  })}
                >
                  {decode(answer)}
                </button>
              );
            })}
          </div>
        </article>
      ))}

      <div aria-live="polite" className="conclusion">
        {isQuizCompleted && (
          <p className="score-text">{`You scored ${totalScoreCount}/${questions.length} correct answers`}</p>
        )}
        <button
          onClick={() => (isQuizCompleted ? reset() : SetIsQuizCompleted(true))}
          disabled={!isQuizCompleted && Object.keys(selectedAnswers).length != questions.length}
          className={clsx("btn start-btn")}
        >
          {isQuizCompleted ? "Play Again" : "Check answers"}
        </button>
      </div>
    </>
  );

  return (
    <main>
      {!isQuizStarted && (
        <div className="splashscreen">
          <h1>Quizzical</h1>
          <p>Answer questions correctly and win amazing prices</p>
          <button
            onClick={() => SetIsQuizStarted(true)}
            disabled={isLoading}
            className={clsx("btn start-btn")}
          >
            {isLoading ? "Loading ..." : "Start quiz"}
          </button>
        </div>
      )}

      {isQuizStarted && quizEl}
    </main>
  );
}
