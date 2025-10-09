import React, { useEffect, useState, useRef } from 'react';
import { database } from './firebase-config';
import { ref, get, query, orderByChild } from 'firebase/database';
import { prompt } from './prompt'

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
  const [user_prompt, setUser_Prompt] = useState("");

  const ribbit = new Audio('/assets/ribbit.mp3');

  const prompt_open = new Audio('/assets/prompt_open.mp3');
  const prompt_close = new Audio('/assets/prompt_close.mp3');

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

  function handlePrompt() {
    prompt_open.play();
    setUser_Prompt("fuck");
  }

  function handleCloseInfo(){
    prompt_close.play();
    setTimeout(() => {
      setUser_Prompt("");
    }, 200);
  }

  return (
    <div className="app">
      <header>
        <a href="https://github.com/joeyvalley/fr0.gg">fr-0.gg</a>
        <div className="right-side">
        <span onClick={handlePrompt} className="header-info">about</span> 
        </div>
      </header>
      <div className={`info-box ${user_prompt ? "open" : ""}`}>
        <div className="info-box-header">
          <div className="pond-fr0gg-container-header-date">about fr-0.gg</div>
          <div className="pond-closer" onClick={()=>handleCloseInfo()}>x</div>
        </div>
        <p>fr-0.gg is a project that grew out of a love for a few things: frogs, cheap handmade souvenirs, amateur ceramics, and Midjourney.</p>
        <p>I started by building a simple Discord bot (fr-0gg-bot) that lives in the fr-0.gg Discord server alongside a Midjourney bot.</p>
        <p>The bot generates a curated but random Midjourney prompt daily and starts a new thread in the designated channel. It then adds the Midjourney bot to this thread, sends the day's prompt, and emails me with a direct link to the message.</p>
        <p>All of this behavior is a convoluted workaround for two unfortunate facts:</p>
        <p>1. There is still no public API for Midjourney.<br />2. Discord bots are not allowed to issue commands to one another.</p>
        <p>So until one of these things change, the fr-0gg-bot will continue to function in this way, requiring the tender touch of a human operator.</p>
        <p>Anyways, once I click through the link and navigate into the Discord app, I copy the day's prompt and issue it as a command to the Midjourney bot. For example:</p>
        <p>/imagine prompt: a small fat ceramic frog sculpture, oxidation fired, Agalychnis callidryas, souvenir from Cuba, full-color photograph, Pablo Picasso, Mark Rothko, textured white background, highly textured Xerox scan, archival museum catalog --no text, base, plinth  --stylize 750 --v 3</p>
        <p>The content of the prompt was developed over time through my own experiments with Midjourney and pretty reliably creates an image within a certain style that I find delightfully charming. There are specific variables that I've found give the generated image enough variation to keep them interesting while still maintaining the visual language I'm after.</p>
        <p>After a bit of tweaking back-and-forth with the Midjourney bot, I eventually arrive at a new fr0gg that I'm happy with and issue the !save command to the bot, which triggers a series of functions that scrape the thread for the most recent image, uploads the image to a Cloudinary account, and finally adds the uploaded image reference to a Firebase Realtime Database. Then the bot just hangs around until it's time to create the next prompt.</p>
        <p>The code for fr-0gg-bot itself lives inside a wifi-enabled Raspberry Pi module on my bookshelf.</p>
        <p>The fr-0.gg front-end serves as a simple repository for all my fr0ggs.</p>

      </div>
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
