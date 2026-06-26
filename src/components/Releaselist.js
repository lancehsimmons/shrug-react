import { useState, useEffect } from "react";
import relData from '../assets/releases.json';
import Release from './Release.js';

function ReleaseList() {
  const [releases, setReleases] = useState(relData.releases);

  useEffect(() => {
    fetch("http://localhost:4000/api/releases")
      .then((res) => res.json())
      .then((stockData) => {
        console.log("From server:", stockData);
        // setReleases((current) => {
        //   console.log("Currently have:", current);
        //   return current.map((release) => {
        //     const match = stockData.find((s) => s.id === release.id);
        //     return match ? { ...release, stock: match.stock } : release;
        //     })
        // });
        setReleases((current) => {
          console.log("Currently have:", current);
          const updated = current.map((release) => {
            const match = stockData.find((s) => s.id === release.id);
            return match ? { ...release, stock: match.stock } : release;
          });
          console.log("After merging:", updated);
          return updated;
        });
      });
  }, []);

  return (
    <div className="release-list">
      {releases.map(release => (
        <Release
          id={release.id}
          title={release.title}
          artist={release.artist}
          date={release.date}
          sideA={release.sideA}
          sideB={release.sideB}
          samples={release.sampleURL}
          physprice={release.physprice}
          stock={release.stock}
        />
      ))}
    </div>
  );
}

export default ReleaseList;