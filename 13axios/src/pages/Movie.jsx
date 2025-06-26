import React from 'react'
import axios from "axios"
import { useEffect, useState } from "react"
import Card from '../components/UI/Card';
import { getMovie } from '../services/GetServices';
function Movie() {
    const API = "https://www.omdbapi.com/?i=tt3896198&apikey=1c12799f&s=titanic&page=1";
    const [data, setData] = useState([]);
    const getMovieData = async () => {
        try {
            // const res = await axios.get(API);
            const res = await getMovie();
            // const res1 = await fetch(API);
            console.log(res.data.Search);
            setData(res.data.Search);
            // console.log(res1.json());
        } catch (error) {
            // console.log(error);
            console.error("Error message:", error.message);
            console.error("Error status:", error.response.status);
            console.error("Error data:", error.response.data);
        }
    }


    useEffect(() => {
        getMovieData();
    }, []);
    return (
        <ul className='container grid grid-four--cols'>
            {
                data.map((curElem) => (
                    <Card key={curElem.imdbID}
                        movieData={curElem} />
                ))
            }
        </ul>
    )
}

export default Movie