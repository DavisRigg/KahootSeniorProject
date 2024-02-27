import { useState, useEffect } from 'react';
import game1 from '../questions/game1';
import game2 from '../questions/game2';
import { socket } from '../socket';
import QRCode from 'react-qr-code';
import configuration from '../configuration';
import "../styles/Home.css";
import "../styles/Game.css";
import "../styles/LoginScreen.css";
import fullHeart from '../fullHeart.png';
import emptyHeart from '../emptyHeart.png';
import skull from '../skull.png';

export const Host = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [question, setQuestion] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [timerStartsAt, setTimerStartsAt] = useState(16);
    const [timer, setTimer] = useState(0);
    const [gameHosted, setGameHosted] = useState(false);
    const [gamePin, setGamePin] = useState(0);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [questionOver, setQuestionOver] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {

        socket.connect();

    },[])

    useEffect(() => {
        console.log(timer)
        if(!questionOver && gameStarted){
            setTimeout(() => {
                if(timer === 0){
                    setQuestionOver(true);
                    socket.emit('timeRanOut', game2[question].answer);
                    //nextQuestion();
                }else{
                    setTimer(timer - 1);
                }
                
            },1000);
        }
    },[timer])

    socket.on('newGamePin', (gamePin) => {
        setGamePin(gamePin);
        setGameHosted(true);
    });

    socket.on('newUser', (username) => {
        console.log(connectedUsers)
        setConnectedUsers([...connectedUsers, username]);
    })

    socket.on('playerDisconnected', (username) => {
        setConnectedUsers(connectedUsers.filter(user => user !== username));
    });

    socket.on('allAnswersAreIn', () => {
        setQuestionOver(true);
        socket.emit('questionOver', game2[question].answer);
    })

    socket.on('updateLeaderboard', (data) => {
        setLeaderboard(data);
    });

    const startGame = () => {
        socket.emit('gameStarted', game2[question].answer);
        setGameStarted(true);
        setTimer(timerStartsAt-1);
        
    }

    const nextQuestion = () => {
        if(question === game2.length-1) {
            setGameStarted(false);
            setGameOver(true);
            socket.emit('gameOver');
        } else {
            setQuestion(question+1);
            setQuestionOver(false);
            socket.emit('nextQuestion', game2[question+1].answer);
            console.log('starting timer with 15');
            setTimer(timerStartsAt-1);
            
        }
    }

    const LeaderboardEntry = ({ username, score, lives }) => {
        // Render hearts based on the number of lives left
        const icons = [];
        if (lives < 1){
            icons.push(
                <img
                key={0}
                src={skull}
                alt={'Skull'}
                className="skull-icon"
                />
            )
        }else{
            for (let i = 0; i < 3; i++) {
                icons.push(
                    <img
                    key={i}
                    src={i < lives ? fullHeart : emptyHeart}
                    alt={i < lives ? 'Full Heart' : 'Empty Heart'}
                    className="heart-icon"
                    />
                );
            }
        }

      
        return (
            <div className="leaderboard-entry">
                <div className="username">{username}</div>
                <div className="icons">{icons}</div>
                <div className="score">{score}</div>
            </div>
        );
    };
      
    const LeaderboardScreen = ({ players }) => {
        return (
            <div className="leaderboard-screen">
                {leaderboard.find(x => x.lives > 0) && (
                    <div className="leaderboard-screen">
                        <div className="player-status">Alive Players</div>
                        {players.map((player, index) => {
                            if(player.name != null && player.lives > 0) {
                                return <LeaderboardEntry
                                    key={index}
                                    username={player.name}
                                    score={player.score}
                                    lives={player.lives}
                                />
                            }
                        })}
                    </div>
                )}
                {leaderboard.find(x => x.lives <= 0) && (
                    <div className="leaderboard-screen">
                        <div className="player-status">Eliminated Players</div>
                        {players.map((player, index) => {
                            if(player.name != null && player.lives <= 0) {
                                return <LeaderboardEntry
                                    key={index}
                                    username={player.name}
                                    score={player.score}
                                    lives={player.lives}
                                />
                            }
                        })}
                    </div>
                )}

            {/* Additional elements like Next button or other UI elements */}
            </div>
        );
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            { gameStarted ? (<InGameScreen />) : (<OutOfGameScreen />) }
        </div>
    )

    function InGameScreen() {
        return <div className='game-page'>
            <TopBar />
            { questionOver ? (
                <div>
                    <RoundLeaderboardScreen />
                    <div className="next-btn-wrapper">
                        <button className="next-btn" onClick={() => nextQuestion()}>{question === game2.length-1 ? 'See results' : 'Next Question'}</button>
                    </div>
                </div>
            ) : (
            <div>
                <div className="timer-box">{timer}</div>
                <div className="answers">
                    <div className="answer-row">
                        <div className="answer" style={{ backgroundColor: 'red' }}>{game2[question].options[0]}</div>
                        <div className="answer" style={{ backgroundColor: 'blue' }}>{game2[question].options[1]}</div>
                    </div>
                    <div className="answer-row">
                        <div className="answer" style={{ backgroundColor: 'yellow' }}>{game2[question].options[2]}</div>
                        <div className="answer" style={{ backgroundColor: 'green' }}>{game2[question].options[3]}</div>
                    </div>
                </div>
            </div>
        )}
        </div>
    }

    function TopBar() {
        return <div className='top-bar'>
            <div className='question'>{game2[question].question}</div>
            { questionOver && <div className='answer'>{game2[question].options[game2[question].answer]}</div> }
            
        </div>
    }

    function RoundLeaderboardScreen() {
        return <LeaderboardScreen players={leaderboard} />

        // return <div>
        //     <div>Question is done! show stats of answers here</div>
        //     <div className="join-game">Alive Players</div>
        //         <div className="users-list">
        //         {leaderboard.map((player, i) => {
        //             if(player.name != null, player.lives > 0) {
        //                 return (<div>{player.name} Score: {player.score} Lives: {player.lives}</div>)
        //             }
        //         })}
        //     </div>
        //     <div className="join-game">Eliminated Players</div>
        //         <div className="users-list">
        //         {leaderboard.map((player, i) => {
        //             if(player.name != null, player.lives <= 0) {
        //                 return (<div>{player.name} Score: {player.score}</div>)
        //             }
        //         })}
        //     </div>
        //     <button onClick={() => nextQuestion()}>{question === game2.length-1 ? 'See results' : 'Next Question'}</button>
        // </div>
    }

    function OutOfGameScreen() {
        return gameOver ? (<GameOverScreen />) : <PreGameScreen />
    }

    function GameOverScreen() {
        return (
            <div className="game-page">
                <div className="join-game">
                    <div className="game-over-text">Game Over</div>
                    <RoundLeaderboardScreen />
                </div>
            </div>
        )
    }

    function PreGameScreen() {
        return gameHosted ? (
            <HostedGameScreen />
        ) : (
            <StartHostingScreen />
        )
    }

    function HostedGameScreen() {
        return (
            <div className='desktop'> 
                <div className='div'>
                    <GameInfoPanel />
                    <PlayersPanel />
                    <img
                        className="logo"
                        alt="MST Logo"
                        src="https://c.animaapp.com/0RBSP2P5/img/primary-no-banner-1@2x.png"
                    />
                </div>
            </div>
        );
    }

    function GameInfoPanel() {
        return <div className="game-info-panel">
            <div className="game-info-content">
                <div className="game-pin">Game PIN: <span className="pin-number">{gamePin}</span></div>
                <QRCode className="qr-code" value={`http://${configuration.ip_address}:3000`} />
                <div className="game-instructions">Join at http://{configuration.ip_address}:3000</div>
            </div>
        </div>
    }

    function PlayersPanel() {
       return  <div className="game-info-panel">
            <div className="game-info-content">
                <h2>Players</h2>
                <div className="users-list">
                    {connectedUsers.map((user, i) => {
                        return (<div className='list-element'>{user}</div>)
                    })}
                </div>
                <button className="host-btn" onClick={() => {startGame()}}>Start</button>
            </div>
        </div>
    }

    function StartHostingScreen() {
        return <div className="login-screen">
            <div className="login-container">
                <h1>Kahoot 2.0!</h1>
                <button className="host-btn" onClick={() => socket.emit('hostGame')}>
                    Host
                </button>
                <img
                    className="logo"
                    alt="MST Logo"
                    src="https://c.animaapp.com/0RBSP2P5/img/primary-no-banner-1@2x.png"
                />
            </div>
        </div>
    }
}