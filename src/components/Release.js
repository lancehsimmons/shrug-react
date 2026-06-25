import '../Releasecard.css';

export default function MusicCard({
  title,
  artist,
  sideA,
  sideB,
}) {
  return (
    <div className="release-card" >
      {/* {image && <img src={image} alt={title} style={{ width: "100%", marginBottom: 12 }} />} */}
      <h2 style={{ margin: "0 0 0px", "text-align":'left' }}>{title}</h2>
      <p className="artist" >{artist}</p>

      <p style={{ margin: "0 0 4px", fontWeight: "bold" }}>Side A</p>
      <ul style={{ margin: "0 0 16px", paddingLeft: 20 }}>
        {sideA.map((track, i) => <li key={i}>{track}</li>)}
      </ul>

      <p style={{ margin: "0 0 4px", fontWeight: "bold" }}>Side B</p>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {sideB.map((track, i) => <li key={i}>{track}</li>)}
      </ul>
    </div>
  );
}

// style={{width: 300, border: "1px solid #ccc", padding:  16, fontFamily: "sans-serif"}}
