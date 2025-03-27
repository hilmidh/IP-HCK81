export function HomeCard({song}) {
  return (
    <div
      className="card text-bg-dark mb-3"
      style={{ maxWidth: 540, backgroundColor: "#474747" }}
    >
      <div className="row g-0">
        <div className="col-md-4">
          <img
            src={song.image}
            style={{
              objectFit: "contain",
              height: "90%",
              marginLeft: 15,
              marginTop: "5%",
            }}
            className="img-fluid rounded-start"
            alt="..."
          />
        </div>
        <div className="col-md-8">
          <div className="card-body">
            <h5 className="card-title">{song.title}</h5>
            <p className="card-text">{song.artist}</p>
            <p className="card-text">{song.album}</p>
            <p className="card-text">
              <small className="text-body-secondary">
                {song.releaseDate}
              </small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
