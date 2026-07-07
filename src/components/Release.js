import '../Releasecard.css';
import BuyButton from "./BuyTapeBtn.js";
import BuyFileButton from "./BuyFileBtn.js";

export default function MusicCard({
  id,
  title,
  artist,
  date,
  sideA,
  sideB,
  samples,
  physprice,
  fileprice,
  downloadUrl,
  images,
  stock
}) {

  return (
    <div className="release-card" >

      <h2 style={{ margin: "0 0 0px", "text-align": 'left' }}>{title}</h2>
      <div className="release-meta">
        <p className="artist">{artist}</p>
        <p className="release-date">{date}</p>
      </div>

      {images && images.length > 0 && (
        <div style={{margin: "8px 0px"}}>
          {images.map((url, i) => (
            <img key={i} className="release-image" src={url} alt="" />
          ))}
        </div>
      )}
      
      <div style={{ marginTop: "16px" }}>
        {sideA.length > 0 && <div>
          <p style={{ margin: "0 0 4px", fontWeight: "bold" }}>{sideB.length > 0 ? "Side A" : "Tracks"}</p>
          <ul style={{ margin: "0 0 16px", paddingLeft: 20 }}>
            {sideA.map((track, i) => <li key={i}>{track}</li>)}
          </ul>
        </div>}
        {sideB.length > 0 && <>
          <p style={{ margin: "0 0 4px", fontWeight: "bold" }}>Side B</p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {sideB.map((track, i) => <li key={i}>{track}</li>)}
          </ul>
        </>}
      </div>


      <p style={{ marginTop: "16px", marginBottom: "8px", fontWeight: "bold" }}>Samples</p>
      <ul>
        {samples.map((url, i) =>
          <li key={i}>
            <audio src={url} controls >{url}</audio>
          </li>)}
      </ul> 
      
      <div style={{ marginTop: "16px" }}>
        <p style={{ margin: "0 0 8px", fontWeight: "bold" }}>Physical Media — ${physprice} USPP</p>
        {stock > 0 ? (
          <BuyButton price={physprice} title={title} releaseId={id} />
        ) : (
          <p style={{fontWeight: "bold"}}>SOLD OUT</p>
        )}
      </div>

      <div style={{ marginTop: "16px" }}>
        <p style={{ margin: "0 0 8px", fontWeight: "bold" }}>Download — ${fileprice}</p>
        <BuyFileButton price={fileprice} title={title} releaseId={id} downloadUrl={downloadUrl} />
      </div>

    </div>
  );
}