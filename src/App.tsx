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
  const numEntries = 25;
  const appContainer = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<fr0gg[]>([]);
  const [paginatedData, setPaginatedData] = useState<fr0gg[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedPrompts, setCopiedPrompts] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(true);

  async function fetchData() {
    const dbRef = ref(database, 'image_prompts');
    const orderedQuery = query(dbRef, orderByChild('date'));
    try {
      const snapshot = await get(orderedQuery);
      if (snapshot.exists()) {
        const fetchedData = Object.values(snapshot.val()) as fr0gg[];
        const newestFirst = fetchedData.reverse();
        setData(newestFirst);
        setPaginatedData(newestFirst.slice(0, numEntries));
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
    fetchData();
  }, []);

  // Fetch more items when currentPage changes
  useEffect(() => {
    if (!loading) return;

    const startIndex = (currentPage - 1) * numEntries;
    const endIndex = startIndex + numEntries;
    const newPaginatedData = data.slice(startIndex, endIndex);

    setPaginatedData((prevPaginatedData) => [...prevPaginatedData, ...newPaginatedData]);
    setLoading(false); // Data has been fetched and appended, allow more loading
  }, [currentPage, data, loading]);



  // Function to copy prompt to clipboard
  function copyPrompt(prompt: string, date: string) {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompts(prevState => ({ ...prevState, [date]: true }));
    setTimeout(() => setCopiedPrompts(prevState => ({ ...prevState, [date]: false })), 1500);
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
              <img src={entry.image_url} alt={`fr0gg ${entry.date}`} />
              <div className='info'>
                <span className="birthday">{entry.date}</span>
                <span className='copy-prompt'>
                  <button onClick={() => copyPrompt(entry.prompt, entry.date)}>
                    {copiedPrompts[entry.date] ? <span style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>Copied!</span> : 'Copy Prompt'}
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
      <div className='footer'>
        ok
      </div>
    </div >
  );
};

export default App;
