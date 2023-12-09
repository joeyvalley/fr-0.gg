import React, { useEffect, useState } from 'react';
import { database } from './firebase-config';
import { ref, get, query, orderByChild, limitToFirst } from 'firebase/database';


import './App.css';

// Define the structure of each database entry
interface fr0gg {
  date: string;
  image_url: string;
  prompt: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<fr0gg[]>([]);
  useEffect(() => {
    async function fetchData() {
      const dbRef = ref(database, 'image_prompts');
      const orderedQuery = query(dbRef, orderByChild('date'), limitToFirst(15));
      try {
        const snapshot = await get(orderedQuery);
        if (snapshot.exists()) {
          const fetchedData = Object.values(snapshot.val()) as fr0gg[];
          console.log(fetchedData);
          setData(fetchedData);
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  // Function to copy prompt to clipboard
  function copyPrompt(prompt: string) {
    navigator.clipboard.writeText(prompt);
  }

  return (
    <div className="app">
      <header>
        <a href="https://github.com/joeyvalley/fr0.gg">fr-0.gg</a>
      </header>
      {data.length > 0 ? (
        <div className="fr0gg-container">
          {data.map(entry => (
            <div className="fr0gg" key={entry.date}>
              <img src={entry.image_url} alt={`fr0gg ${entry.date}`} />
              <div className='info'>
                <span className="birthday">{entry.date}</span>
                <span className='copy-prompt'><button onClick={() => copyPrompt(entry.prompt)}>Copy Prompt</button></span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="loading">🐸</div>
      )
      }
      <div className='pagination'>
      </div>
    </div >
  );
};

export default App;
