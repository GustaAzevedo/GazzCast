import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import Head from 'next/head';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import styles from './episode.module.scss';
import { usePlayer } from '../../contexts/playerContext';

type Episode = {
    id: string;
    title: string;
    thumbnail: string;
    members: string;
    publishedAt: string;
    duration: number;
    durationAsString: string;
    url: string;
    description: string;
}

type EpisodeProps = {
    episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
    const { play } = usePlayer()

    return (
        <div className={styles.episodes}>
            <Head >
                <title>
                    {episode.title}
                </title>
            </Head>

            <div className={styles.thumbnailContainer}>
                <button type="button" onClick={() => play(episode)}>
                    <img src="/play.svg" alt="play this episode" />
                </button>
                <Image width={700}
                    height={160}
                    src={episode.thumbnail}
                    objectFit="cover"
                />
                <Link href="/" >
                    <button type="button">
                        <img src="/arrow-left.svg" alt="voltar" />
                    </button>
                </Link>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>

            <div className={styles.description}
                dangerouslySetInnerHTML={{ __html: episode.description }}
            />
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async (contexto) => {
    const { plug } = contexto.params;

    const { data } = await api.get(`/episodes/${plug}`)

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        url: data.file.url,
        description: data.description
    }

    return {
        props: {
            episode,
        },
        revalidate: 60 * 60 * 24,
    }
}