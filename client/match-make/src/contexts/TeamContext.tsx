import axios from "axios";
import { createContext, useState, type PropsWithChildren } from "react";

interface TeamProps {
  getTeamDetails: () => {};
  teamDetails: [];
}

export const TeamContext = createContext<TeamProps | null>(null);

export const TeamProvider = ({ children }: PropsWithChildren) => {
  const [teamDetails, setTeamDetails] = useState([]);
  const getTeamDetails = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:3000/teams/me/my-team",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setTeamDetails(data.team);
    } catch (error) {
      console.error("Error getting team details", error);
    }
  };
  return (
    <TeamContext.Provider
      value={{
        getTeamDetails,
        teamDetails,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};
