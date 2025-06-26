import { useState, useEffect } from 'react';
import './App.css'
import axios from 'axios';


function App() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // one way of calling axios is the following 
    // axios.get('/api/products')
    //   .then(res => console.log(res.data))
    //   .catch(err => console.log(err))
    // But when we use promises the response doesn't wait it get's immediately executed
    // so if you want to use async await you have to use ifis --> create and run function immediately
    ; (async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await axios.get("/api/products")
        console.log(res.data)
        setProducts(res.data)
        setLoading(false);
      } catch (error) {
        setError(true)
        setLoading(false)
      }
    })()

    // what happens sometimes is that there can be unexecuted code and then the ifi must not be misunderstood with the earlier code so for security check we use ; before ifis
  }, [])
  if (error) {
    return <h1>Something went wrong...</h1>
  }
  if (loading) return <h1>Loading ...</h1>
  return (
    <>
      <h1>Practicing API</h1>
      <h2>Number of Products are: {products.length}</h2>
    </>
  )
}

export default App
