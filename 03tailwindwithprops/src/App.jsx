import "./App.css";
import Card from "./components/cards";

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <h1 className="bg-amber-300 text-blue-50 p-4 rounded-2xl mb-4">
        Tailwind Test
      </h1>
      <Card userName="Sahil Pandey" />{" "}
      {/* here the userName is props and in Card(props) you have to put them as parameters, if you have single prop like userName then you can put that like {userName} in Cards({userName}), if you multiple then you have use them like props.userName */}
      <Card userName="Pandey Sahil" />
    </>
  );
}

export default App;
