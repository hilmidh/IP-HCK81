


export function ArtistCard({artist}) {
  return (
    <div className="card" style={{ width: "18rem", backgroundColor: "#474747", marginBottom: 10 }}>
      <img src={artist.image} className="card-img-top" alt="..." style={{height: 200, objectFit:'cover'}} />
      <div className="card-body">
        <h5 className="card-title">{artist.name}</h5>
        <p className="card-text">
          {artist.genres}
        </p>
        
      </div>
    </div>
  );
}
