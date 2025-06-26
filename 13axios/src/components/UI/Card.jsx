import React from 'react'

function Card({ movieData }) {
    const { Poster, imdbID } = movieData;
    return (
        <li className="hero-container">
            <div className="main-container">
                <div className="poster-container">
                    <img src={Poster} alt={imdbID} className="poster" />
                </div>
                <div className="ticket-container">
                    <div className="ticket__content">
                        <a href={`/movie/${imdbID}`}>
                            <button className="ticket__buy-btn">
                                Watch now
                            </button>

                        </a>
                    </div>
                </div>
            </div>
        </li>
    )
}

export default Card