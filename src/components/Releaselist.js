import { useState, useEffect } from "react";
import Release from './Release.js';
import { API_BASE_URL } from '../config.js';

function ReleaseList() {
  const [releases, setReleases] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/releases`)
      .then((res) => res.json())
      .then((data) => {
        setReleases(data.map((r) => ({
          ...r,
          sideA: r.side_a,
          sideB: r.side_b,
          samples: r.sample_urls,
          downloadUrl: r.download_url,
          images: r.images,
          notes: r.notes,
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
          downloadUrl={release.downloadUrl}
          images={release.images}
          notes={release.notes}
          stock={release.stock}
        />
      ))}
    </div>
  );
}

export default ReleaseList;
