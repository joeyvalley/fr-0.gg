import React, { useEffect, useState } from 'react';
import { database } from './firebase-config';
import { ref, get } from 'firebase/database';

import './App.css';

// Define the structure of each database entry
interface fr0gg {
  date: string;
  image_url: string;
  prompt: string;
}

const App: React.FC = () => {
  // Use the interface to type your state
  const [data, setData] = useState<fr0gg[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const dbRef = ref(database, 'image_prompts');
      try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          // Map the data to the structure of DatabaseEntry
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
        <a href="">fr0.gg</a>
      </header>
      {data.length > 0 ? (
        <div
          className="fr0gg-container"
        >
          {data.map(entry => (
            <div className="fr0gg" key={entry.date}>
              <img src={entry.image_url} alt={`fr0gg ${entry.date}`} />
              <div className='info'>
                <span className="birthday">{entry.date}</span>
                <span className='copy-prompt'>
                  <button onClick={() => copyPrompt(entry.prompt)}>
                    Copy Prompt <span className="checkmark">&#10003;</span>
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="loading">🐸</div>
      )
      }
      <div className='pagination'>
        <button>&#10094;</button>
        <button>&#10095;</button>
      </div>
    </div >
  );
};

export default App;
