import { useLoaderData } from "react-router-dom";

export default function Github() {
  //   const [data, setData] = useState([]);
  //   useEffect(() => {
  //     fetch("https://api.github.com/users/hiteshchoudhary")
  //       .then((response) => response.json())
  //       .then((data) => setData(data));
  //   });

  const data = useLoaderData();
  return (
    <div className="text-center bg-gray-600 p-4 text-white text-3xl">
      Github Followers : {data.followers}
    </div>
  );
}

export const getInfoLoader = async () => {
  const response = await fetch("https://api.github.com/users/hiteshchoudhary");
  return await response.json();
};
