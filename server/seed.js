const db = require('./db');

const releases = [
  {
    id: 1,
    title: 'Structured Water',
    artist: 'Unguent',
    date: '6.26',
    time: 'c22',
    side_a: JSON.stringify(['Theory of Disinformation II', 'Re-Equivalence']),
    side_b: JSON.stringify(['ZnCO₃ + TiO₂ + K₂O']),
    notes: '',
    sample_urls: JSON.stringify([
      'https://pub-bdc04cdfbec64e10b751e2f08bc7ad5f.r2.dev/disinfo_thry_samp.wav',
      'https://pub-bdc04cdfbec64e10b751e2f08bc7ad5f.r2.dev/re_equivalence_samp.wav',
      'https://pub-bdc04cdfbec64e10b751e2f08bc7ad5f.r2.dev/ZnCO%E2%82%83%2BTiO%E2%82%82%2BK%E2%82%82O_samp.wav',
    ]),
    download_url: 'Structured_Water-Unguent.zip',
    images: JSON.stringify(["https://pub-bdc04cdfbec64e10b751e2f08bc7ad5f.r2.dev/images/strct_wtr_1.jpg", "https://pub-bdc04cdfbec64e10b751e2f08bc7ad5f.r2.dev/images/strct_wtr_2.jpg"]),
    physprice: 15.00,
    fileprice: 6.00,
    stock: 12,
  },
  {
    id: 2,
    title: 'soiled top spin',
    artist: 'Unguent',
    date: '6.26',
    time: null,
    side_a: JSON.stringify(['Theory of Disinformation II', 'Re-Equivalence']),
    side_b: JSON.stringify(['ZnCO₃ + TiO₂ + K₂O']),
    notes: '',
    sample_urls: JSON.stringify([
      'https://pub-bdc04cdfbec64e10b751e2f08bc7ad5f.r2.dev/disinfo_thry_samp.wav',
      'https://pub-bdc04cdfbec64e10b751e2f08bc7ad5f.r2.dev/re_equivalence_samp.wav',
      'https://pub-bdc04cdfbec64e10b751e2f08bc7ad5f.r2.dev/ZnCO%E2%82%83%2BTiO%E2%82%82%2BK%E2%82%82O_samp.wav',
    ]),
    download_url: null,
    images: JSON.stringify([]),
    physprice: 15.00,
    fileprice: 6.00,
    stock: 6,
  },
];

const insert = db.prepare(`
  INSERT INTO releases (id, title, artist, date, time, side_a, side_b, notes, sample_urls, download_url, images, physprice, fileprice, stock)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const r of releases) {
  const existing = db.prepare('SELECT id FROM releases WHERE id = ?').get(r.id);
  if (!existing) {
    insert.run(r.id, r.title, r.artist, r.date, r.time, r.side_a, r.side_b, r.notes, r.sample_urls, r.download_url, r.images, r.physprice, r.fileprice, r.stock);
    console.log(`Seeded: ${r.title}`);
  }
}
