import React, { useEffect, useState, useRef } from 'react';
import { database } from './firebase-config';
import { ref, get, query, orderByChild } from 'firebase/database';

import './App.css';

import Pond from './components/Pond';

import MiniPlayer, { Track } from './components/MiniPlayer';

interface fr0gg {
  date: string;
  image_url: string;
  prompt: string;
  dateMs: number;
}

interface SelectedFr0gg {
  image_url: string;
  date: string;
}


const App: React.FC = () => {
  const [data, setData] = useState<fr0gg[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selected_fr0gg, setSelected_Fr0gg] = useState<SelectedFr0gg | null>(null);

  const ribbit = new Audio('/assets/ribbit.mp3');

  const tracks: Track[] = [
  {
    src: '/assets/fr-0ggs.mp3',           
    title: 'fr0.gg — site mix',
    id: 'site-mix',                          
  },
];

  async function fetchData() {
    const dbRef = ref(database, 'image_prompts');
    const orderedQuery = query(dbRef, orderByChild("date"));
    try {
      const snapshot = await get(orderedQuery);
      if (snapshot.exists()) {
        const fetchedData = Object.values(snapshot.val()) as fr0gg[];
        const sortedData = fetchedData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        setData(sortedData);
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClick = (image_url: string, date: string) => {
    ribbit.play();
    setSelected_Fr0gg({ image_url, date });
    setModal(true);
  };

  return (
    <div className="app">
      <header>
        <a href="https://github.com/joeyvalley/fr0.gg">fr-0.gg</a>
        <div className="right-side">
        <span className="header-info">info</span> 
        <span>prompt</span>
        </div>
      </header>
      {loading ? (
        <div className="loading">🐸</div>
      ) : (
        <div className="fr0gg-container">
          {data.map(entry => (
            <div className="fr0gg" key={entry.date}>
              <img
                src={entry.image_url}
                alt={`fr0gg ${entry.date}`}
                onClick={() => handleClick(entry.image_url, entry.date)}
              />
            </div>
          ))}
        </div>
      )}
      <div className='footer'>
        <p>2023 - 2025</p>
        <div>
          <MiniPlayer tracks={tracks} startIndex={0} storageKey="fr0gg-player" autoPlay={false} />
        </div>
      </div>
      {modal && selected_fr0gg && (
        <Pond
          setModal={setModal}
          fr0gg={selected_fr0gg.image_url}
          date={selected_fr0gg.date}
        />
      )}
    </div>
  );
};

export default App;
