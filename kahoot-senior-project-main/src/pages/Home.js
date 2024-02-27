import { useEffect, useRef, useState} from 'react';
import { socket } from '../socket';
import "../styles/Home.css";
import '../styles/LoginScreen.css';

export const Home = () => {

    const [gamePin, setGamePin] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [answerRight, setAnswerRight] = useState(null);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        socket.connect();
    },[])

    socket.on('joinedGame', (pin) => {
        setGamePin(pin);
    });

    socket.on('invalidCode', () => {
        alert("Invalid game code");
        gamePinBar.current.value = '';
    })

    socket.on('gameStarted', () => {
        setGameStarted(true);
    });

    socket.on('questionOver', (answer) => {
        setTimeout(() => {
            if(parseInt(currentAnswer) === parseInt(answer)){
                setAnswerRight(true);
                setTimeout(() => {
                    setCurrentAnswer(null);
                },100)
                
            }else{
                setAnswerRight(false);
                setTimeout(() => {
                    setCurrentAnswer(null);
                },100)
                
            }
        },200);

    })

    socket.on('nextQuestion', () => {
        setAnswerRight(null);
        setCurrentAnswer(null);
    })

    socket.on('hostDisconnected', () => {
        setGameStarted(false);
        setGamePin(0);
        setCurrentAnswer(null);
        setAnswerRight(null);
    })

    socket.on('gameOver', () => {
        setGameOver(true);
    })

    const gamePinBar = useRef();
    const usernameBar = useRef();

    const styles = {
        html: {
            height: '100%'
        },
        body: {
            height: '100%'
        },
        welcomeBar: {
            alignSelf: 'center',
            fontSize: 40,
            fontWeight: 'bold',
            marginTop: 50
        },
        options: {
            width: '100%',
            height: '100vh'
        },
        row: {
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '50%'
        },
        button1: {
            height: '100%',
            width: '50%',
            backgroundColor: 'red'
        },
        button2: {
            height: '100%',
            width: '50%',
            backgroundColor: 'blue'
        },
        button3: {
            height: '100%',
            width: '50%',
            backgroundColor: 'yellow'
        },
        button4: {
            height: '100%',
            width: '50%',
            backgroundColor: 'green'
        },
        correctAnswerFeedback: {
            width: '100vw',
            height: '100vh',
            display: "flex",
            fontSize: "3rem",
            backgroundColor: "green",
            justifyContent: "center",
            alignItems: "center"
        },
        incorrectAnswerFeedback: {
            width: '100vw',
            height: '100vh',
            display: "flex",
            fontSize: "3rem",
            backgroundColor: "red",
            justifyContent: "center",
            alignItems: "center"
        }
    }

    const joinGame = (e) => {
        e.preventDefault();
        socket.emit('joinGame', parseInt(gamePinBar.current.value), usernameBar.current.value);
    }

    const answered = (answer) => {
        console.log(currentAnswer);
        socket.emit('answered', answer);
    }

    return !gameOver ? (
        <div style={{ width: '100%', height: '100vh' }}>
            { gamePin === 0 ? (<HomePage />) : (<GameScreen />) }
        </div>

    ) : (<ResultsScreen />)

    function HomePage() {
        return (
            <div className="login-screen">
              <div className="login-container">
                <h1>Kahoot!</h1>
                <form onSubmit={joinGame}>
                  <input
                    type="text"
                    ref={gamePinBar}
                    placeholder="Game PIN"
                    className="game-pin-input"
                    aria-label="Game PIN"
                  />
                  <input
                    type="text"
                    ref={usernameBar}
                    placeholder="Username"
                    className="game-pin-input"
                    aria-label="Username"
                  />
                  <button type="submit" className="submit-btn">
                    Play
                  </button>
                </form>
                <img
                    className="logo"
                    alt="MST Logo"
                    src="https://c.animaapp.com/0RBSP2P5/img/primary-no-banner-1@2x.png"
                />
              </div>
            </div>
          );
    }

    function GameScreen() {
        return !gameStarted ? (<WaitingScreen />) : (<QuestionOptions/>)
    }

    function WaitingScreen() {
        return <div className="loading-screen"> Waiting for game to start... </div>
    }

    function QuestionOptions() {
        return <div style={styles.options}>
            {currentAnswer != null ? (
                <SitTightScreen />
            ) : (
                <div style={{ flex: 1 }}>
                {answerRight == null ? (
                    <div style={styles.options}>
                        <div style={styles.row}>
                            <button onClick={() => {setCurrentAnswer(0); answered(0);}} style={styles.button1} />
                            <button onClick={() => {setCurrentAnswer(1); answered(1);}} style={styles.button2} />
                        </div>
                        <div style={styles.row}>
                            <button onClick={() => {setCurrentAnswer(2); answered(2);}} style={styles.button3} />
                            <button onClick={() => {setCurrentAnswer(3); answered(3);}} style={styles.button4} />
                        </div>
                    </div>
                ) : answerRight ? (
                    <CorrectAnswerScreen />
                ) : (
                    <IncorrectAnswerScreen />
                )}

                </div>

            )}

        </div>
    }
    
    function SitTightScreen() {
        return <div className="loading-screen"> Sit tight... </div>
    }

    function CorrectAnswerScreen() {
        return <div style={styles.correctAnswerFeedback}> Correct! </div>
    }

    function IncorrectAnswerScreen() {
        return <div style={styles.incorrectAnswerFeedback}> Incorrect! </div>
    }

    function ResultsScreen() {
        return <div className='loading-screen'>Game is over. Check the leaderboard to see how you did!</div>
        // TODO: Add in results code:
    }
}