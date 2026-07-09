import './Info.css';

export default function Info() {
  return (
    <div className="info-page">
      <div className="info-intro">Shrug is a private entity providing access to independent sound forms. We will try to serve this objective as best we can. Shrug is neither a functioning business nor a unit of corporate production (though some corporate portals are utilized in achieving our objective). Please procede with discretion.</div>

      <section className="info-section">
        <h2 className="info-section-title">Contact</h2>
        <div className="info-email">info@shrug.huh</div>
        <p className="info-section-body">Do get in touch if you run into any issues with placing orders either physical or digital or if you have not received anything you purchased. We are currently not open for submissions.</p>
      </section>

      <section className="info-section">
        <h2 className="info-section-title">Shipping</h2>
        <p className="info-section-body">Current shipping costs only include USA. If you would like to order elsewhere in the world please get in touch. Physical media should generally ship within a week unless otherwise noted. Media-mail is the default shipping mode which can also take extra time. As stated, Shrug is a private endeavor so please allow for a loose shipping timeframe.</p>
      </section>

      <section className="info-section">
        <h2 className="info-section-title">Terms</h2>
        <p className="info-section-body">Unless otherwise stated, including relevant information external to this site, all content is private copyright of the owner and operator. Digital downloads are for personal listening only, not for redistribution or resale. Download links are generated per purchase and expire after one hour, so grab your files soon after checkout rather than saving the link for later. Digital purchases are non-refundable once the download link has been issued. If physical media is damaged or defective, get in touch and we will sort it out. Payment is handled entirely by PayPal, we do not see or store your card details, and no purchase or contact information is shared with anyone outside of what is needed to fulfill your order.</p>
      </section>
    </div>
  );
}
