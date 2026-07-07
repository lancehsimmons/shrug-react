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

      <h2 className="release-title">{title}</h2>
      <div className="release-meta">
        <p className="artist">{artist}</p>
        <p className="release-date">{date}</p>
      </div>

      {images && images.length > 0 && (
        <div className="release-images">
          {images.map((url, i) => (
            <img key={i} className="release-image" src={url} alt="" />
          ))}
        </div>
      )}

      <div className="release-section">
        {sideA.length > 0 && <div>
          <p className="track-heading">{sideB.length > 0 ? "Side A" : "Tracks"}</p>
          <ul className="track-list">
            {sideA.map((track, i) => <li key={i}>{track}</li>)}
          </ul>
        </div>}
        {sideB.length > 0 && <>
          <p className="track-heading">Side B</p>
          <ul className="track-list--last">
            {sideB.map((track, i) => <li key={i}>{track}</li>)}
          </ul>
        </>}
      </div>


      <p className="release-samples-heading">Samples</p>
      <ul>
        {samples.map((url, i) =>
          <li key={i}>
            <audio src={url} controls >{url}</audio>
          </li>)}
      </ul>

      <div className="release-section">
        <p className="release-subheading">Physical Media — ${physprice} USPP</p>
        {stock > 0 ? (
          <BuyButton price={physprice} title={title} releaseId={id} />
        ) : (
          <p className="sold-out">SOLD OUT</p>
        )}
      </div>

      <div className="release-section">
        <p className="release-subheading">Download — ${fileprice}</p>
        <BuyFileButton price={fileprice} title={title} releaseId={id} downloadUrl={downloadUrl} />
      </div>

    </div>
  );
}