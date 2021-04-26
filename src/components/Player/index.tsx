import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { usePlayer } from '../../contexts/playerContext';

import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {

    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);

    const {
        episodeList,
        currentEpisodeIndex,
        isPlaying,
        togglePlay,
        setPlayingState,
        playNext,
        isLooping,
        toggleLoop,
        playPrevious,
        hasNext,
        toggleShuffle,
        isShuffling,
        clearPlayerSate,
        hasPrevious,
    } = usePlayer();

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }

        if (isPlaying) {
            audioRef.current.play();
        }
        else {
            audioRef.current.pause();
        }

    }, [isPlaying])

    function setupProgressListner() {
        audioRef.current.currentTime = 0;
        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime));
        });
    }

    function handleSeek(entrada: number) {
        audioRef.current.currentTime = entrada;
        setProgress(entrada);
    }

    function handleEpisodeEnded() {
        if (hasNext) {
            playNext();
        }
        else {
            clearPlayerSate();
        }
    }

    const episode = episodeList[currentEpisodeIndex];

    return (

        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="playing now" />
                <strong>Tocando agora </strong>
            </header>

            { episode ? (
                <div className={styles.currentEpisode}>
                    <Image width={592}
                        height={592}
                        src={episode.thumbnail}
                        objectFit="cover"
                    />
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>

            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            )
            }

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        {episode ? (
                            <Slider
                                max={episode.duration}
                                value={progress}
                                onChange={handleSeek}
                                trackStyle={{ backgroundColor: '#04d361' }}
                                railStyle={{ backgroundColor: '#9f75ff' }}
                                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}

                            />
                        ) : (
                            <div className={styles.emptySlider}></div>
                        )}
                    </div>
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                {episode && (
                    <audio
                        src={episode.url}
                        autoPlay
                        loop={isLooping}
                        onEnded={handleEpisodeEnded}
                        onLoadedMetadata={setupProgressListner}
                        ref={audioRef}
                        onPlay={() => setPlayingState(true)}
                        onPause={() => setPlayingState(false)}
                    />
                )}

                <div className={styles.buttons}>
                    <button
                        type="button"
                        disabled={!episode || episodeList.length <= 1}
                        onClick={toggleShuffle}
                        className={isShuffling ? styles.isActive : ''}
                    >
                        <img src="/shuffle.svg" alt="shuffle" />
                    </button>
                    <button type="button" onClick={playPrevious} disabled={!episode || hasPrevious == false}>
                        <img src="/play-previous.svg" alt="play previous song" />
                    </button>
                    <button
                        type="button"
                        disabled={!episode}
                        className={styles.play}
                        onClick={togglePlay}
                    >
                        {isPlaying
                            ? <img src="/pause.svg" alt="Play song" />
                            : <img src="/play.svg" alt="Play song" />
                        }
                    </button>
                    <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
                        <img src="/play-next.svg" alt="Play next song" />
                    </button>
                    <button
                        type="button"
                        disabled={!episode}
                        onClick={toggleLoop}
                        className={isLooping ? styles.isActive : ''}
                    >
                        <img src="/repeat.svg" alt="Repeat song" />
                    </button>
                </div>
            </footer>
        </div >
    );
}