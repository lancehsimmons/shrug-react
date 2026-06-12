import relData from '../assets/releases.json';
import Release from './Release.js';

function ReleaseList() {
  return (
    <div className="release-list">
      {relData.releases.map(release => (
        <Release
          key={release.id}
          title={release.title}
          artist={release.artist}
          sideA={release.sideA}
          sideB={release.sideB}
        />
      ))}
    </div>
  );
}

export default ReleaseList;