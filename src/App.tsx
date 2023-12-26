import React, { useEffect, useState, useRef } from 'react';
import { database } from './firebase-config';
import { ref, get, query, orderByChild } from 'firebase/database';

import './App.css';

interface fr0gg {
  date: string;
  image_url: string;
  prompt: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<fr0gg[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="app">
      <header>
        <a href="https://github.com/joeyvalley/fr0.gg">fr-0.gg</a>
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
              />
            </div>
          ))}
        </div>
      )}
      <div className='footer'>
        ok
      </div>
    </div>
  );
};

export default App;
