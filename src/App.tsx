import React, { useEffect, useState } from 'react';
import { database } from './firebase-config';
import { ref, get, child } from 'firebase/database';

const App: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const dbRef = ref(database, 'image_prompts'); // reference to the image_prompts node
      try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setData(data);
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {/* Render your data here */}
        {data ? (
          <div>{JSON.stringify(data)}</div>
        ) : (
          <div>No data loaded...</div>
        )}
      </header>
    </div>
  );

};

export default App;
