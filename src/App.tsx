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
  const [numEntries, setNumEntries] = useState(100);
  const appContainer = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<fr0gg[]>([]);
  const [paginatedData, setPaginatedData] = useState<fr0gg[]>([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
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
        setPaginatedData(sortedData.slice(0, numEntries));
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

  // Function to fetch data from firebase and store it in the data state.
  useEffect(() => {
    if (windowWidth <= 400) {
      setNumEntries(25);
    } else if (windowWidth <= 600 && windowWidth > 400) {
      setNumEntries(20);
    } else if (windowWidth <= 800 && windowWidth > 600) {
      setNumEntries(18);
    }
    else {
      setNumEntries(24);
    }
    fetchData();
  }, []);

  // Function to copy prompt to clipboard
  // function copyPrompt(prompt: string, date: string) {
  //   navigator.clipboard.writeText(prompt);
  //   setCopiedPrompts(prevState => ({ ...prevState, [date]: true }));
  //   setTimeout(() => setCopiedPrompts(prevState => ({ ...prevState, [date]: false })), 1500);
  // }


  function ribbit() {
    const sound = new Audio("/assets/ribbit.mp3");
    try {
      sound.play();
      console.log('ribbit');
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <div className="app" ref={appContainer}>
      <header>
        <a href="https://github.com/joeyvalley/fr0.gg">fr-0.gg</a>
      </header>
      {data.length > 0 ? (
        <div className="fr0gg-container">
          {paginatedData.map(entry => (
            <div className="fr0gg" key={entry.date}>
              <img src={entry.image_url} alt={`fr0gg ${entry.date}`} onClick={() => { ribbit() }} />
              {/* <div className='info'>
                <span className="birthday">{entry.date}</span>
              </div> */}
            </div>
          ))}
        </div>
      ) : (
        <div className="loading">🐸</div>
      )
      }
      <div className='footer'>
        ok
      </div>
    </div >
  );
};

export default App;
