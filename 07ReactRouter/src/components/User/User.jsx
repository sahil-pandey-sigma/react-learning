import React from "react";
import { useParams } from "react-router-dom";
export default function User() {
  const { userId } = useParams();
  return (
    <div className="bg-gray-500 text-white p-6 text-3xl text-center">
      User : {userId}
    </div>
  );
}
