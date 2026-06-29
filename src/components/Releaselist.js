import { useState, useEffect } from "react";
import Release from './Release.js';

function ReleaseList() {
  const [releases, setReleases] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/releases")
      .then((res) => res.json())
      .then((data) => {
        setReleases(data.map((r) => ({
          ...r,
          sideA: r.side_a,
          sideB: r.side_b,
          samples: r.sample_urls,
          downloadUrls: r.download_urls,
        })));
      });
  }, []);

  return (
    <div className="release-list">
      {releases.map(release => (
        <Release
          key={release.id}
          id={release.id}
          title={release.title}
          artist={release.artist}
          date={release.date}
          sideA={release.sideA}
          sideB={release.sideB}
          samples={release.samples}
          physprice={release.physprice}
          fileprice={release.fileprice}
          downloadUrls={release.downloadUrls}
          stock={release.stock}
        />
      ))}
    </div>
  );
}

export default ReleaseList;
