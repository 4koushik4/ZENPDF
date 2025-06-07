import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import './Fundraiser.css';

// const quotes = [
//   "The best way to find yourself is to lose yourself in the service of others. - Mahatma Gandhi",
//   "No one has ever become poor by giving. - Anne Frank",
//   "We make a living by what we get, but we make a life by what we give. - Winston Churchill",
//   "Kindness is the language which the deaf can hear and the blind can see. - Mark Twain",
//   "It's not how much we give but how much love we put into giving. - Mother Teresa",
//   "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
//   "The function of education is to teach one to think intensively and critically. - Martin Luther King Jr.",
//   "Live as if you were to die tomorrow. Learn as if you were to live forever. - Mahatma Gandhi",
//   "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
//   "Change is the end result of all true learning. - Leo Buscaglia"
// ];

const questionBatches = [
  // Batch 1
  [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correct: 2
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correct: 1
    },
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correct: 1
    }
  ],
  // Batch 2
  [
    {
      question: "Who painted the Mona Lisa?",
      options: ["Van Gogh", "Da Vinci", "Picasso", "Rembrandt"],
      correct: 1
    },
    {
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic", "Indian", "Arctic", "Pacific"],
      correct: 3
    },
    {
      question: "Which animal is known as the 'King of the Jungle'?",
      options: ["Tiger", "Lion", "Elephant", "Giraffe"],
      correct: 1
    }
  ],
  // Batch 3
  [
    {
      question: "What is the chemical symbol for gold?",
      options: ["Ag", "Fe", "Au", "Cu"],
      correct: 2
    },
    {
      question: "Which country is home to the kangaroo?",
      options: ["New Zealand", "South Africa", "Australia", "Brazil"],
      correct: 2
    },
    {
      question: "What is the largest mammal in the world?",
      options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
      correct: 1
    }
  ],
  // Batch 4
  [
    {
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
      correct: 1
    },
    {
      question: "What is the hardest natural substance on Earth?",
      options: ["Gold", "Iron", "Diamond", "Platinum"],
      correct: 2
    },
    {
      question: "Which planet has the most moons?",
      options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
      correct: 1
    }
  ],
  // Batch 5
  [
    {
      question: "What is the largest organ in the human body?",
      options: ["Heart", "Brain", "Liver", "Skin"],
      correct: 3
    },
    {
      question: "Which country is known as the Land of the Rising Sun?",
      options: ["China", "Korea", "Japan", "Thailand"],
      correct: 2
    },
    {
      question: "What is the fastest land animal?",
      options: ["Lion", "Cheetah", "Gazelle", "Horse"],
      correct: 1
    }
  ]
];

const Fundraiser = () => {
  const [showParty, setShowParty] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showWrong, setShowWrong] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [rockets, setRockets] = useState([]);
  const [monkeys, setMonkeys] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('correct');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showNextBatch, setShowNextBatch] = useState(false);

  // const dayIndex = new Date().getDay();
  // const currentQuote = quotes[dayIndex % quotes.length];
  const currentQuestions = questionBatches[currentBatch];

  // Add monkey animation
  useEffect(() => {
    const createMonkey = () => {
      const isLeftSide = Math.random() > 0.5;
      const monkey = {
        id: Date.now(),
        left: isLeftSide ? 20 : windowSize.width - 100,
        top: Math.random() * (windowSize.height - 200) + 100,
        rotation: isLeftSide ? 0 : 180,
        scale: 0.8 + Math.random() * 0.4,
        animation: Math.random() > 0.5 ? 'swing' : 'jump',
        isLeftSide,
        emoji: Math.random() > 0.5 ? '🐒' : '🙈'
      };
      setMonkeys(prev => [...prev, monkey]);
      setTimeout(() => {
        setMonkeys(prev => prev.filter(m => m.id !== monkey.id));
      }, 4000);
    };

    const interval = setInterval(createMonkey, 2000);
    return () => clearInterval(interval);
  }, [windowSize]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAnswer = (selectedIndex) => {
    setSelectedIndex(selectedIndex);
    if (selectedIndex === currentQuestions[currentQuestion].correct) {
      setShowCorrect(true);
      setScore(score + 1);
      
      // Show rockets only for single correct answers
      if (currentQuestion < currentQuestions.length - 1) {
        for (let i = 0; i < 8; i++) {
          const rocket = {
            id: Date.now() + i,
            left: Math.random() * windowSize.width,
            bottom: -100,
            size: 20 + Math.random() * 30,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            rotation: -45 + Math.random() * 30,
            speed: 5 + Math.random() * 5,
            delay: i * 200
          };
          setTimeout(() => {
            setRockets(prev => [...prev, rocket]);
          }, rocket.delay);
        }
      }

      // Show celebration message
      setFeedbackType('correct');
      setFeedbackMessage('Amazing! You got it right! 🎉');
      setShowFeedback(true);

      // Move to next question after a delay
      setTimeout(() => {
        setShowCorrect(false);
        setShowFeedback(false);
        setSelectedIndex(null);
        if (currentQuestion < currentQuestions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
        } else {
          // Quiz is complete
          setGameComplete(true);
          setShowNextBatch(true);
          // Check if all answers were correct
          if (score + 1 === currentQuestions.length) {
            setShowCelebration(true);
            setShowParty(true);
          }
        }
      }, 2000);
    } else {
      setShowWrong(true);
      setFeedbackType('wrong');
      setFeedbackMessage('Oops! That\'s not quite right. Try again! 💪');
      setShowFeedback(true);
      
      // Show wrong answer animation
      setTimeout(() => {
        setShowWrong(false);
        setShowFeedback(false);
        setSelectedIndex(null);
      }, 1500);
    }
  };

  const moveToNextBatch = () => {
    setCurrentBatch((prevBatch) => (prevBatch + 1) % questionBatches.length);
    setCurrentQuestion(0);
    setScore(0);
    setGameComplete(false);
    setShowNextBatch(false);
    setShowCelebration(false);
    setShowParty(false);
    setSelectedIndex(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setRockets((prevRockets) =>
        prevRockets
          .map((rocket) => ({
            ...rocket,
            bottom: rocket.bottom + rocket.speed
          }))
          .filter((rocket) => rocket.bottom < window.innerHeight)
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fundraiser-container">
      {showParty && showCelebration && (
        <div className="party-container">
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.2}
            initialVelocityY={15}
          />
          <div className="celebration-text">🎉 Perfect Score! 🎉</div>
          <div className="celebration-animation">
            <div className="dancing-kids">
              <div className="kid kid1">👶</div>
              <div className="kid kid2">👧</div>
              <div className="kid kid3">👦</div>
            </div>
            <div className="balloons">
              <div className="balloon balloon1">🎈</div>
              <div className="balloon balloon2">🎈</div>
              <div className="balloon balloon3">🎈</div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Display
      <div className="quote-container">
        <p className="quote-text">{currentQuote}</p>
      </div> */}

      {/* Monkey Playgrounds */}
      <div className="monkey-playground left">
        {monkeys.filter(m => m.isLeftSide).map((monkey) => (
          <div
            key={monkey.id}
            className={`monkey ${monkey.animation}`}
            style={{
              left: `${monkey.left}px`,
              top: `${monkey.top}px`,
              transform: `rotate(${monkey.rotation}deg) scale(${monkey.scale})`,
            }}
          >
            {monkey.emoji}
          </div>
        ))}
      </div>

      <div className="monkey-playground right">
        {monkeys.filter(m => !m.isLeftSide).map((monkey) => (
          <div
            key={monkey.id}
            className={`monkey ${monkey.animation}`}
            style={{
              left: `${monkey.left}px`,
              top: `${monkey.top}px`,
              transform: `rotate(${monkey.rotation}deg) scale(${monkey.scale})`,
            }}
          >
            {monkey.emoji}
          </div>
        ))}
      </div>

      <div className="quiz-container">
        <h1>Fun Quiz Time! 🎮</h1>
        <div className="batch-indicator">Batch {currentBatch + 1} of {questionBatches.length}</div>
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${((currentQuestion + 1) / currentQuestions.length) * 100}%` }}
          />
        </div>

        {!gameComplete ? (
          <>
            <div className="question-container">
              <h2>{currentQuestions[currentQuestion].question}</h2>
              <div className="options">
                {currentQuestions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-button ${
                      showCorrect && index === currentQuestions[currentQuestion].correct
                        ? 'correct'
                        : showWrong && index === currentQuestions[currentQuestion].correct
                        ? 'correct'
                        : showWrong && index === selectedIndex
                        ? 'wrong'
                        : ''
                    }`}
                    onClick={() => handleAnswer(index)}
                    disabled={showCorrect || showWrong}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="score-display">
              Score: {score}/{currentQuestions.length}
            </div>
            {showFeedback && (
              <div className={`feedback ${feedbackType}-feedback`}>
                <span className="emoji">{feedbackType === 'correct' ? '🎉' : '💪'}</span>
                {feedbackMessage}
              </div>
            )}
          </>
        ) : (
          <div className="game-complete">
            <h2>Quiz Complete! 🎉</h2>
            <p>Your final score: {score}/{currentQuestions.length}</p>
            {showNextBatch && (
              <button className="play-again-button" onClick={moveToNextBatch}>
                {currentBatch < questionBatches.length - 1 ? 'Next Batch' : 'Start Over'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rockets animation */}
      {rockets.map((rocket) => (
        <div
          key={rocket.id}
          className="rocket"
          style={{
            left: rocket.left,
            bottom: rocket.bottom,
            width: `${rocket.size}px`,
            height: `${rocket.size * 2}px`,
            background: `linear-gradient(to bottom, ${rocket.color}, ${rocket.color} 80%, #ff0)`,
            borderRadius: "50% 50% 0 0",
            transform: `rotate(${rocket.rotation}deg)`,
            zIndex: 10,
            boxShadow: `0 0 10px ${rocket.color}`,
            clipPath: "polygon(50% 100%, 0 0, 100% 0)"
          }}
        >
          <div className="rocket-flame"></div>
        </div>
      ))}

      {/* Character messages */}
      <div className="character-messages">
        <div className="message">
          <span role="img" aria-label="boy">👦</span> "Need help? Think carefully! I'm here to guide you!"
        </div>
        <div className="message">
          <span role="img" aria-label="girl">👧</span> "Try your best! You'll get it right!"
        </div>
      </div>
    </div>
  );
};

export default Fundraiser;