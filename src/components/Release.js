import '../Releasecard.css';

export default function MusicCard({
  title,
  artist,
  date,
  sideA,
  sideB,
  samples
}) {
        console.log('sample urls',{samples});
      console.log('track title',{sideA});
  return (
    <div className="release-card" >
      {/* {image && <img src={image} alt={title} style={{ width: "100%", marginBottom: 12 }} />} */}
      <h2 style={{ margin: "0 0 0px", "text-align": 'left' }}>{title}</h2>
      <div style={{display:"flex"}}>
        <p className="artist" >{artist}</p>
        <p style={{marginLeft:"12px", textAlign: "left",  
  fontSize: "18px"}}> {date} </p>
      </div>

      <div style={{margin: "8px 0px"}}>
        <img className="release-image" src={`${process.env.PUBLIC_URL}/images/strct_wtr_1.jpg`} alt="" />
        <img className="release-image" src={`${process.env.PUBLIC_URL}/images/strct_wtr_2.jpg`} alt="" />
      </div>
      
      <div style={{ marginTop: "16px" }}>
        <p style={{ margin: "0 0 4px", fontWeight: "bold" }}>Side A</p>
      <ul style={{ margin: "0 0 16px", paddingLeft: 20 }}>
        {sideA.map((track, i) => <li key={i}>{track}</li>)}
      </ul>

      <p style={{ margin: "0 0 4px", fontWeight: "bold" }}>Side B</p>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {sideB.map((track, i) => <li key={i}>{track}</li>)}
      </ul>
      </div>


      <p style={{ marginTop: "16px", marginBottom: "8px", fontWeight: "bold" }}>Samples</p>
      <ul>
        {samples.map((url, i) =>
          <li key={i}>
            {/* <p>{sideA.at(i)}</p> */}
            <audio src={url} controls >{url}</audio>
          </li>)}
      </ul> 


    </div>
  );
}

// style={{width: 300, border: "1px solid #ccc", padding:  16, fontFamily: "sans-serif"}}
