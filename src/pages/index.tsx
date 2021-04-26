import { GetStaticProps } from 'next';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { usePlayer } from '../contexts/playerContext';


import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

import styles from '../pages/home.module.scss';

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt: string;
  duration: number;
  durationAsString: string;
  url: string;
}

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
  const { playList } = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homepage}>

      <Head >
        <title>Home | GazzCast</title>
      </Head>

      <section className={styles.latestEpisode}>
        <h2>Ultimos Lançamentos</h2>

        <ul>
          {latestEpisodes.map((episode, index: number) => {
            return (
              <li key={episode.id}>
                <Image
                  objectFit="cover"
                  width={192}
                  height={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                />

                <div className={styles.episodeDetails}>

                  <Link href={`/episodes/${episode.id}`}>
                    <a >{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="play button" />
                </button>

              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map((ep, index) => {
              return (
                <tr>
                  <td style={{ width: 100 }}>
                    <Image
                      objectFit="cover"
                      width={192}
                      height={192}
                      src={ep.thumbnail}
                      alt={ep.title} />
                  </td>
                  <td>
                    <Link href={`/episodes/${ep.id}`}>
                      <a >{ep.title}</a>
                    </Link>
                  </td>
                  <td>{ep.members}</td>
                  <td style={{ width: 100 }}>{ep.publishedAt}</td>
                  <td>{ep.durationAsString}</td>
                  <td>
                    <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                      <img src="/play-green.svg" alt="play episode" />
                    </button>
                  </td>
                </tr>

              )
            })}
          </tbody>

        </table>
      </section>

    </div >
  )
}

//SSG
export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const episodes = data.map(ep => {
    return {
      id: ep.id,
      title: ep.title,
      thumbnail: ep.thumbnail,
      members: ep.members,
      publishedAt: format(parseISO(ep.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(ep.file.duration),
      durationAsString: convertDurationToTimeString(Number(ep.file.duration)),
      url: ep.file.url,
    };
  })

  const latestEpisodes = episodes.slice(0, 2)

  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8,
  }
}



//SSR
/*
export async function getServerSideProps() {
  const response = await fetch('http://localhost:3333/episodes')
  const data = await response.json();

  return {
    props: {
      episodes: data,
    }
  }
}
*/