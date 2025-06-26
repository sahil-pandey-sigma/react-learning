import express from "express";

const app = express();

app.get("/api/products", (req, res) => {
  const products = [
    {
      id: 1,
      name: "Cozy Mountain Retreat",
      price: 120.5,
      image:
        "https://images.pexels.com/photos/1769300/pexels-photo-1769300.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      description:
        "A beautiful mountain landscape perfect for a peaceful getaway.",
    },
    {
      id: 2,
      name: "Vintage Camera Pro",
      price: 349.99,
      image:
        "https://images.pexels.com/photos/2798950/pexels-photo-2798950.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      description:
        "Capture moments with classic style and modern functionality.",
    },
    {
      id: 3,
      name: "Fresh Fruit Platter",
      price: 25.0,
      image:
        "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      description: "A vibrant assortment of fresh, seasonal fruits.",
    },
    {
      id: 4,
      name: "Urban Cityscape",
      price: 80.75,
      image:
        "https://images.pexels.com/photos/236171/pexels-photo-236171.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      description: "Experience the dynamic energy of city life.",
    },
    {
      id: 5,
      name: "Abstract Art Piece",
      price: 199.0,
      image:
        "https://images.pexels.com/photos/1483059/pexels-photo-1483059.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      description: "A unique and thought-provoking abstract creation.",
    },
  ];
  if (req.query.search) {
    const filterProducts = products.filter((product) =>
      product.name.includes(req.query.search)
    );
    res.send(filterProducts);
    return;
  }

  setTimeout(() => {
    res.send(products);
  }, 3000);
});
// http://localhost:3000/api/products/?search=wooden

// In url element after "?" known as query

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
